
import React, { useState, useEffect } from 'react';

interface GoogleIdentityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string, email: string) => void;
}

const GoogleIdentityOverlay: React.FC<GoogleIdentityOverlayProps> = ({ isOpen, onClose, onSelect }) => {
  const [step, setStep] = useState<'picker' | 'manual' | 'loading'>('picker');
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('picker');
      setSelectedAccount(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccountClick = (name: string, email: string) => {
    setSelectedAccount({ name, email });
    setStep('loading');
    // Simulate network delay for authentic feel
    setTimeout(() => {
      onSelect(name, email);
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualEmail) return;
    handleAccountClick(manualName, manualEmail);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      <div className="bg-white w-full max-w-[400px] rounded-lg shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
             <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
          </div>

          {step === 'picker' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-medium text-slate-800">Sign in</h2>
                <p className="text-sm text-slate-500">to continue to <span className="font-semibold text-indigo-600">MindGuard</span></p>
              </div>

              <div className="space-y-1 mt-6 border border-slate-100 rounded-lg overflow-hidden">
                <button 
                  onClick={() => handleAccountClick('Alex Rivers', 'alex.rivers@gmail.com')}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 text-left group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                    <img src="https://ui-avatars.com/api/?name=Alex+Rivers&background=6366f1&color=fff&bold=true" alt="" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-800">Alex Rivers</p>
                    <p className="text-xs text-slate-500 truncate">alex.rivers@gmail.com</p>
                  </div>
                </button>

                <button 
                  onClick={() => setStep('manual')}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <i className="fas fa-user-plus text-xs"></i>
                  </div>
                  <p className="text-sm font-medium text-slate-700">Use another account</p>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-4">
                By signing in, Google will share your name, email address, and profile picture with MindGuard. MindGuard uses this data to personalize your mental health experience under our <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          )}

          {step === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-medium text-slate-800">Google Login</h2>
                <p className="text-sm text-slate-500">Secure entry for another account</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    autoFocus
                    required
                    className="w-full p-4 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all pl-12"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                  />
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                </div>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    required
                    className="w-full p-4 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all pl-12"
                    value={manualEmail}
                    onChange={e => setManualEmail(e.target.value)}
                  />
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <button 
                   type="button" 
                   onClick={() => setStep('picker')}
                   className="text-sm font-semibold text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
                 >
                   Back
                 </button>
                 <button 
                    type="submit"
                    className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Continue
                  </button>
              </div>
            </form>
          )}

          {step === 'loading' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
               <div className="relative">
                 <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
               </div>
               <div className="text-center space-y-1">
                 <h2 className="text-xl font-medium text-slate-800">Authenticating...</h2>
                 <p className="text-sm text-slate-500">Connecting to secure Google session</p>
               </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex gap-4 items-center">
            <span className="hover:text-slate-600 cursor-pointer">English (United States)</span>
            <i className="fas fa-caret-down"></i>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Help</span>
            <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleIdentityOverlay;
