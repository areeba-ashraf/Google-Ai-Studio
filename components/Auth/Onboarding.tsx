
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (reason: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onComplete(reason);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-2xl z-10 animate-in slide-in-from-bottom-12 duration-1000">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-8">
              <i className="fas fa-heart text-indigo-500 text-2xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              What brings you <br />
              to <span className="text-indigo-600">MindGuard?</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
              Your journey is unique. Telling us what’s on your mind helps us tailor your AI counselor to your needs.
            </p>
          </div>

          <div className="relative group max-w-xl mx-auto">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="I've been feeling stressed lately because..."
              className="w-full h-48 bg-white border border-slate-200 rounded-[40px] p-8 text-xl text-slate-800 outline-none focus:ring-8 focus:ring-indigo-100 transition-all resize-none shadow-2xl shadow-indigo-100/20 placeholder:text-slate-200 font-medium leading-relaxed"
            ></textarea>
            
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || loading}
                className={`px-12 py-5 rounded-3xl font-black text-lg transition-all shadow-2xl flex items-center gap-3 active:scale-95 ${
                  reason.trim() && !loading
                  ? 'bg-slate-950 text-white hover:bg-indigo-600 shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : "Begin My Journey"}
                <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>

          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            This information is private and helps initialize your neural profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
