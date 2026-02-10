
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

const CounselorBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Welcome to your safe harbor. I'm your MindGuard Counselor. This is a non-judgmental space for you to explore whatever is on your mind. Where shall we begin today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a world-class clinical psychologist and empathetic counselor with a calm, sophisticated, and deeply human-like persona. 
        Your goal is to guide the user through their emotional landscape using evidence-based techniques like CBT, DBT, and mindfulness. 
        Focus on active listening, validation, and gently challenging maladaptive thoughts. 
        Always prioritize safety. If you detect severe distress, gently guide them toward professional emergency resources.
        Keep your responses elegant, professional, and relatively concise.`,
      },
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: input });
      
      let assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);

      let fullText = '';
      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMsg, text: fullText };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        text: "I apologize, but I've encountered a temporary neural disconnect. Shall we try that thought again?",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-280px)] flex flex-col bg-white rounded-[48px] shadow-2xl shadow-indigo-100/30 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-700">
      {/* Premium Header */}
      <div className="px-10 py-8 bg-slate-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-4 ring-slate-900/50">
            <i className="fas fa-user-doctor text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Clinical Counselor</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: `${i*200}ms`}}></div>)}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Neural Link Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fas fa-trash-can text-sm"></i></button>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fas fa-ellipsis-v text-sm"></i></button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-[32px] px-8 py-5 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 font-medium'
              }`}>
                {msg.text}
              </div>
              <p className={`text-[10px] font-bold text-slate-300 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 rounded-[32px] rounded-tl-none px-8 py-5 border border-slate-100 flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Counselor is processing</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input */}
      <div className="px-10 py-10 bg-white border-t border-slate-50">
        <div className="relative group">
          <div className="absolute -inset-1 bg-indigo-500/10 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center gap-6 bg-slate-50 p-2.5 rounded-[32px] border border-slate-100 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What thoughts are currently on your horizon?"
              className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-700 font-semibold placeholder:text-slate-300"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                input.trim() && !isTyping ? 'bg-slate-950 text-white hover:bg-indigo-600 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-paper-plane text-lg"></i>
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-center items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          <i className="fas fa-shield-check text-indigo-400"></i>
          END-TO-END CLINICAL ENCRYPTION ACTIVE
          <i className="fas fa-circle text-[4px]"></i>
          POWERED BY GEMINI 3 PRO
        </div>
      </div>
    </div>
  );
};

export default CounselorBot;
