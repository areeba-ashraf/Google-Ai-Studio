
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const LivePsychologist: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [transcription, setTranscription] = useState<string>('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('idle');
  };

  const startSession = async () => {
    setStatus('connecting');
    setIsActive(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              
              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = audioContextRef.current!.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

              const source = audioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current!.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current!.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatus('error');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: "You are an expert clinical psychologist in a live session. You are empathetic, calm, and professional. Your voice is soothing. Respond to the user's emotions in real-time. Keep your turns relatively brief to maintain conversation flow."
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-280px)] flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700">
      <div className="relative">
        <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 ${
          status === 'listening' ? 'bg-indigo-500/10 scale-110 shadow-[0_0_80px_rgba(99,102,241,0.2)]' :
          status === 'speaking' ? 'bg-emerald-500/10 scale-125 shadow-[0_0_100px_rgba(16,185,129,0.3)]' :
          status === 'connecting' ? 'bg-slate-200 animate-pulse' : 'bg-slate-50'
        }`}>
          <div className={`w-48 h-48 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
            status === 'listening' ? 'border-indigo-500 border-dashed' :
            status === 'speaking' ? 'border-emerald-500 border-solid' : 'border-slate-200'
          }`}>
             <i className={`fas ${
               status === 'listening' ? 'fa-microphone text-indigo-500 animate-bounce' :
               status === 'speaking' ? 'fa-waveform-lines text-emerald-500' :
               status === 'connecting' ? 'fa-circle-notch animate-spin text-slate-400' :
               status === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-microphone-slash text-slate-300'
             } text-5xl`}></i>
          </div>
        </div>
        
        {/* Animated Orbits */}
        {isActive && status !== 'error' && (
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-slate-100 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-100 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          {status === 'idle' ? 'Start AI Psychologist Session' :
           status === 'connecting' ? 'Establishing Neural Link...' :
           status === 'listening' ? 'I\'m Listening...' :
           status === 'speaking' ? 'Psychologist is Speaking' : 'Connection Error'}
        </h3>
        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          {status === 'idle' ? 'Experience real-time empathetic conversation powered by Gemini 3 Native Audio.' :
           status === 'listening' ? 'Speak naturally. I can hear your tone and pacing.' :
           status === 'speaking' ? 'Please listen to the psychologist\'s guidance.' : 
           status === 'error' ? 'Something went wrong. Please check your API key and microphone permissions.' : ''}
        </p>
      </div>

      <div className="flex gap-4">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="bg-slate-950 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-indigo-600 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            <i className="fas fa-play text-xs"></i>
            Begin Session
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="bg-rose-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-rose-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            <i className="fas fa-stop text-xs"></i>
            End Session
          </button>
        )}
      </div>

      {transcription && (
        <div className="w-full max-w-lg bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Live Transcription</p>
          <p className="text-slate-600 text-sm italic line-clamp-2 text-center">"{transcription}"</p>
        </div>
      )}
    </div>
  );
};

export default LivePsychologist;
