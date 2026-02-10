
import React, { useState } from 'react';
import GoogleIdentityOverlay from './GoogleIdentityOverlay';
import { dbService } from '../../services/dbService';

interface LoginProps {
  onAuth: (name: string, email: string, isSignup: boolean) => void;
  onToggleSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuth, onToggleSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGoogleOpen, setIsGoogleOpen] = useState(false);

  const handleGoogleSelect = async (name: string, selectedEmail: string) => {
    setIsGoogleOpen(false);
    setLoading(true);
    setError(null);
    try {
      // Check if user exists, if not create a Google-type user record
      let user = await dbService.verifyUser(selectedEmail);
      if (!user) {
        user = { name, email: selectedEmail, type: 'google' };
        await dbService.createUser(user);
      }
      // Log in
      onAuth(name, selectedEmail, false);
    } catch (err: any) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const user = await dbService.verifyUser(email, password);
      if (user) {
        onAuth(user.name, user.email, false);
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } catch (err: any) {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <GoogleIdentityOverlay 
        isOpen={isGoogleOpen} 
        onClose={() => setIsGoogleOpen(false)} 
        onSelect={handleGoogleSelect} 
      />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 md:p-14 shadow-2xl relative">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/20">
              <i className="fas fa-shield-heart text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Welcome Back</h1>
            <p className="text-slate-400 font-medium">Continue your journey to mental strength.</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={() => setIsGoogleOpen(true)}
              className="w-full py-5 bg-white rounded-3xl text-slate-900 font-black flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">or email</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold animate-in slide-in-from-top-2">
                <i className="fas fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : "Sign In"}
              </button>
            </form>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm font-medium">
              New to MindGuard? {' '}
              <button onClick={onToggleSignup} className="text-indigo-400 font-bold hover:underline">Create an account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
