
import React, { useState, useRef } from 'react';
import { transcribeAudio, analyzeJournalEntry } from '../services/geminiService';
import { MoodEntry, InsightReport } from '../types';

interface VoiceDiaryProps {
  onEntryProcessed: (entry: MoodEntry, insight: InsightReport) => void;
}

const VoiceDiary: React.FC<VoiceDiaryProps> = ({ onEntryProcessed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const text = await transcribeAudio(base64data, 'audio/webm');
        setTranscript(text);
        
        if (text) {
          const insight = await analyzeJournalEntry(text);
          const newEntry: MoodEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            score: 5, // Default for voice
            label: 'Voice Entry',
            sentiment: insight.overallMood,
            dominantEmotion: insight.stressMarkers[0] || 'Unknown',
            journalText: text
          };
          onEntryProcessed(newEntry, insight);
        }
      };
    } catch (error) {
      console.error("Audio processing failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100 relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 bg-indigo-50/50 flex items-center justify-center -z-10">
            <div className="w-64 h-64 bg-indigo-200/30 rounded-full animate-ping"></div>
          </div>
        )}
        
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Voice Diary</h2>
        <p className="text-slate-500 mb-12">
          Speak freely. Gemini analyzes your tone, pace, and vocabulary to detect stress patterns you might have missed.
        </p>

        <div className="flex flex-col items-center justify-center gap-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 ${
              isRecording 
              ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600' 
              : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
            }`}
          >
            {isRecording ? <i className="fas fa-stop"></i> : <i className="fas fa-microphone"></i>}
          </button>

          <div className="space-y-2">
            <p className="font-semibold text-slate-800">
              {isRecording ? "Listening..." : isProcessing ? "AI analyzing tone & content..." : "Tap to start recording"}
            </p>
            {isRecording && (
              <div className="flex gap-1 justify-center items-end h-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%`}}></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {transcript && !isProcessing && (
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl text-left border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Transcript Preview</h4>
            <p className="text-slate-600 text-sm italic">"{transcript}"</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center gap-8">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <i className="fas fa-waveform-lines"></i>
          <span>Tone Analysis Active</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <i className="fas fa-brain"></i>
          <span>Pattern Detection Active</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceDiary;
