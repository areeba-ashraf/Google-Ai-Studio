
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JournalView from './components/JournalView';
import VoiceDiary from './components/VoiceDiary';
import HistoryView from './components/HistoryView';
import ResourceHub from './components/ResourceHub';
import NearbySupport from './components/NearbySupport';
import CounselorBot from './components/CounselorBot';
import MindfulnessHub from './components/MindfulnessHub';
import LivePsychologist from './components/LivePsychologist';
import EmergencySettings from './components/EmergencySettings';
import MobileAppSDK from './components/MobileAppSDK';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { alertService } from './services/alertService';
import { dbService } from './services/dbService';
import { View, MoodEntry, InsightReport, EmergencyContact, AlertConfig } from './types';

type AuthState = 'unauthenticated' | 'authenticated' | 'signing-up';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [latestInsight, setLatestInsight] = useState<InsightReport | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, reason?: string } | null>(null);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [onboardingReason, setOnboardingReason] = useState('');

  // Initial Data Fetch from Database on Mount (checks for active session)
  useEffect(() => {
    const checkActiveSession = async () => {
      setIsSyncing(true);
      try {
        await dbService.init();
        const savedAuth = localStorage.getItem('authState');
        const activeEmail = localStorage.getItem('activeUserEmail');
        
        if (savedAuth === 'authenticated' && activeEmail) {
          await loadUserData(activeEmail);
          setAuthState('authenticated');
        }
      } catch (err) {
        console.error("Session initialization failed", err);
      } finally {
        setIsSyncing(false);
      }
    };

    checkActiveSession();
  }, []);

  // Helper to load specific user data into state
  const loadUserData = async (email: string) => {
    const [moods, insight, contacts, profile] = await Promise.all([
      dbService.getMoods(email),
      dbService.getLatestInsight(email),
      dbService.getContacts(email),
      dbService.getProfile(email)
    ]);

    setUserProfile(profile || { name: 'User', email });
    setEmergencyContacts(contacts || []);
    setLatestInsight(insight || null);
    
    if (moods && moods.length > 0) {
      setMoodHistory(moods);
    } else {
      // Default placeholder data for new accounts to prevent empty dashboard
      const initial: MoodEntry[] = [
        { id: '1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), score: 7, label: 'Optimal', sentiment: 'Initialized neural baseline', dominantEmotion: 'Calm', journalText: "Welcome to MindGuard. Your history starts here." },
      ];
      setMoodHistory(initial);
      await dbService.saveMoods(email, initial);
    }

    // Trigger onboarding if no reason found for this user
    if (!profile?.reason) {
      setShowReasonPopup(true);
    }
  };

  const handleAuth = async (name: string, email: string, isSignup: boolean) => {
    setIsSyncing(true);
    try {
      // Clear previous user state first
      setMoodHistory([]);
      setLatestInsight(null);
      setEmergencyContacts([]);

      // Ensure profile exists in DB
      let profile = await dbService.getProfile(email);
      if (!profile) {
        profile = { name, email };
        await dbService.saveProfile(profile);
      }

      // Load this specific user's data from IndexedDB
      await loadUserData(email);
      
      setUserProfile(profile);
      setAuthState('authenticated');
      localStorage.setItem('authState', 'authenticated');
      localStorage.setItem('activeUserEmail', email);

    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    setAuthState('unauthenticated');
    localStorage.removeItem('authState');
    localStorage.removeItem('activeUserEmail');
    setUserProfile(null);
    setMoodHistory([]);
    setLatestInsight(null);
    setEmergencyContacts([]);
    setIsSyncing(false);
  };

  const submitReason = async () => {
    if (!onboardingReason.trim() || !userProfile) return;
    setIsSyncing(true);
    try {
      const updatedProfile = { ...userProfile, reason: onboardingReason };
      setUserProfile(updatedProfile);
      await dbService.saveProfile(updatedProfile);
      setShowReasonPopup(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEntryProcessed = async (entry: MoodEntry, insight: InsightReport) => {
    if (!userProfile) return;
    setIsSyncing(true);
    try {
      const updatedHistory = [...moodHistory, entry];
      setMoodHistory(updatedHistory);
      setLatestInsight(insight);
      
      await Promise.all([
        dbService.saveMoods(userProfile.email, updatedHistory),
        dbService.saveLatestInsight(userProfile.email, insight)
      ]);
      
      setCurrentView('dashboard');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateContacts = async (contacts: EmergencyContact[]) => {
    if (!userProfile) return;
    setIsSyncing(true);
    try {
      setEmergencyContacts(contacts);
      await dbService.saveContacts(userProfile.email, contacts);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendTestContact = async (contact: EmergencyContact, config: AlertConfig) => {
    setIsSendingSMS(true);
    const message = `Alert: Hey ${contact.name}, Seems like your ${contact.relation.toLowerCase() || 'sister'} could use some help.`;
    const success = await alertService.sendAlert(contact, message, config);
    setIsSendingSMS(false);
    if (success) {
      alert(`CLOUD ALERT: Dispatch request accepted via ${config.method.toUpperCase()}.`);
    } else {
      alert(`Dispatch failed. Check logs for details.`);
    }
  };

  const handleAlertContacts = async () => {
    if (emergencyContacts.length === 0 || !userProfile) {
      setCurrentView('emergency');
      alert("Please add emergency contacts first.");
      return;
    }
    const config = await dbService.getConfig(userProfile.email) || { method: 'native', useProxy: true };
    setIsSendingSMS(true);
    await Promise.all(emergencyContacts.map(contact => {
      const message = `CRITICAL ALERT: Hey ${contact.name}, Seems like your ${contact.relation.toLowerCase() || 'sister'} is in deep distress and needs immediate help. Please check in right now.`;
      return alertService.sendAlert(contact, message, config as any);
    }));
    alert(`Crisis Alert Broadcast dispatched via ${config.method.toUpperCase()}.`);
    setIsSendingSMS(false);
  };

  if (authState === 'unauthenticated') {
    return <Login onAuth={(name, email) => handleAuth(name, email, false)} onToggleSignup={() => setAuthState('signing-up')} />;
  }

  if (authState === 'signing-up') {
    return <Signup onAuth={(name, email) => handleAuth(name, email, true)} onToggleLogin={() => setAuthState('unauthenticated')} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard history={moodHistory} latestInsight={latestInsight} onNavigate={setCurrentView} />;
      case 'chat': return <CounselorBot />;
      case 'live-session': return <LivePsychologist />;
      case 'mindfulness': return <MindfulnessHub />;
      case 'journal': return <JournalView onEntryProcessed={handleEntryProcessed} />;
      case 'voice': return <VoiceDiary onEntryProcessed={handleEntryProcessed} />;
      case 'history': return <HistoryView history={moodHistory} />;
      case 'resources': return <ResourceHub onNavigate={setCurrentView} />;
      case 'nearby': return <NearbySupport />;
      case 'emergency': return <EmergencySettings contacts={emergencyContacts} userEmail={userProfile?.email || ''} onUpdate={handleUpdateContacts} onSendTest={handleSendTestContact} />;
      case 'mobile-app': return <MobileAppSDK />;
      default: return <Dashboard history={moodHistory} latestInsight={latestInsight} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      
      <main className="flex-1 ml-72 p-10 lg:p-14 overflow-y-auto">
        <header className="flex justify-between items-center mb-14 sticky top-0 bg-slate-50/50 backdrop-blur-xl z-40 py-6 -mx-10 lg:-mx-14 px-10 lg:px-14">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-[0.3em] mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tighter">
              {currentView === 'nearby' ? 'Support Network' : currentView.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
            {isSyncing && (
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl shadow-sm border border-indigo-100 animate-pulse">
                <i className="fas fa-user-lock text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Profile Isolation Active...</span>
              </div>
            )}
            {isSendingSMS && (
              <div className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-2xl text-white shadow-lg animate-pulse">
                <i className="fas fa-tower-broadcast text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Active Dispatch...</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-4 text-right">
              <div>
                <p className="text-sm font-black text-slate-900 leading-none">{userProfile?.name || 'User'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Encrypted Session: {userProfile?.email}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-black/5 hover:scale-110 transition-transform cursor-pointer">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'U')}&background=6366f1&color=fff&bold=true`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          {renderContent()}
        </div>
      </main>

      {/* REASON POPUP MODAL (Isolated per user) */}
      {showReasonPopup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[48px] p-10 md:p-14 shadow-2xl space-y-10 animate-in zoom-in-95 duration-700">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl">
                  <i className="fas fa-heart"></i>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                  Hello {userProfile?.name.split(' ')[0]}, <br />
                  <span className="text-indigo-600">What brings you here?</span>
                </h3>
                <p className="text-slate-500 font-medium">
                  Briefly share why you’re using MindGuard today. It helps our AI initialize your personal mental performance baseline.
                </p>
              </div>
              <div className="space-y-6">
                <textarea 
                  autoFocus
                  className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-lg text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none font-medium"
                  placeholder="I've been feeling a bit overwhelmed lately..."
                  value={onboardingReason}
                  onChange={e => setOnboardingReason(e.target.value)}
                ></textarea>
                <button 
                  onClick={submitReason}
                  disabled={!onboardingReason.trim() || isSyncing}
                  className={`w-full py-5 rounded-3xl font-black text-lg transition-all shadow-2xl flex items-center gap-3 ${
                    onboardingReason.trim() && !isSyncing
                    ? 'bg-slate-950 text-white hover:bg-indigo-600 shadow-indigo-200 active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSyncing ? <i className="fas fa-circle-notch animate-spin"></i> : "Confirm & Begin"}
                  {!isSyncing && <i className="fas fa-arrow-right text-xs"></i>}
                </button>
              </div>
              <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                This journal is private and securely saved to your personal DB
              </p>
           </div>
        </div>
      )}

      {latestInsight?.crisisWarning && (
        <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <button 
            onClick={handleAlertContacts}
            className="bg-slate-950 text-white px-8 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(2,6,23,0.3)] flex items-center gap-4 font-black hover:bg-slate-800 transition-all hover:-translate-y-2 group border border-white/10"
          >
            <i className="fas fa-tower-broadcast text-xl animate-pulse"></i>
            ALERT SAFETY NET
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
