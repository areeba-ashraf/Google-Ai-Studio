
import React from 'react';
import { View } from '../types';

interface ResourceHubProps {
  onNavigate: (view: View) => void;
}

const ResourceHub: React.FC<ResourceHubProps> = ({ onNavigate }) => {
  const hotlines = [
    { name: "National Suicide Prevention Lifeline", number: "988", desc: "Available 24/7 across the US" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", desc: "Connect with a volunteer Crisis Counselor" },
    { name: "The Trevor Project", number: "1-866-488-7386", desc: "Support for LGBTQ youth" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-200">
          <i className="fas fa-phone-alt text-white text-3xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-rose-800 mb-2">Emergency Crisis Support</h2>
          <p className="text-rose-700 opacity-80 mb-4">If you or someone you know is in immediate danger or experiencing a life-threatening crisis, please contact emergency services or one of these helplines.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotlines.map((h, i) => (
              <a 
                key={i} 
                href={`tel:${h.number.replace(/\D/g,'')}`}
                className="bg-white/60 p-4 rounded-2xl border border-rose-200 hover:bg-white transition-colors block"
              >
                <h4 className="font-bold text-rose-900 text-sm">{h.name}</h4>
                <p className="text-lg font-black text-rose-600 my-1">{h.number}</p>
                <p className="text-[10px] text-rose-700 opacity-70">{h.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-spa text-emerald-500"></i>
            Relaxation Tools
          </h3>
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate('mindfulness')}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <h4 className="font-bold text-slate-700 group-hover:text-emerald-700">4-7-8 Breathing Technique</h4>
              <p className="text-xs text-slate-500 mt-1">A rhythmic breathing pattern to calm the nervous system.</p>
            </button>
            <button 
              onClick={() => onNavigate('mindfulness')}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <h4 className="font-bold text-slate-700 group-hover:text-emerald-700">Progressive Muscle Relaxation</h4>
              <p className="text-xs text-slate-500 mt-1">Release physical tension from head to toe.</p>
            </button>
            <button 
              onClick={() => onNavigate('chat')}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <h4 className="font-bold text-slate-700 group-hover:text-emerald-700">Guided Imagery Chat</h4>
              <p className="text-xs text-slate-500 mt-1">Describe a peaceful place to our AI Counselor for guidance.</p>
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-book-open text-blue-500"></i>
            Self-Help Articles
          </h3>
          <div className="space-y-4">
            {[
              { title: "Identifying Early Burnout Signs", desc: "Learn to spot when your candle is burning out." },
              { title: "The Power of Micro-Breaks", desc: "How 2 minutes of rest can save your productivity." },
              { title: "Digital Detox Guide", desc: "Practical steps to disconnect for mental clarity." }
            ].map((article, i) => (
              <div 
                key={i}
                onClick={() => alert(`Opening Article: ${article.title}\n\nThis would normally load a curated guide on ${article.desc.toLowerCase()}`)}
                className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <h4 className="font-bold text-slate-700 group-hover:text-blue-700">{article.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{article.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;
