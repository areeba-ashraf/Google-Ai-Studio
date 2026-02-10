
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { dbService } from '../services/dbService';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchProfile = async () => {
      const activeEmail = localStorage.getItem('activeUserEmail');
      if (activeEmail) {
        const profile = await dbService.getProfile(activeEmail);
        if (profile) setUserName(profile.name);
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-grid-2' },
    { id: 'chat', label: 'AI Psychologist', icon: 'fa-brain-circuit' },
    { id: 'live-session', label: 'Live Session', icon: 'fa-waveform-lines' },
    { id: 'mindfulness', label: 'Wellness Hub', icon: 'fa-leaf' },
    { id: 'journal', label: 'Daily Journal', icon: 'fa-feather' },
    { id: 'voice', label: 'Voice Diary', icon: 'fa-microphone' },
    { id: 'history', label: 'Timeline', icon: 'fa-clock-rotate-left' },
    { id: 'emergency', label: 'Safety Net', icon: 'fa-shield-heart' },
    { id: 'nearby', label: 'Local Care', icon: 'fa-location-crosshairs' },
    { id: 'resources', label: 'Hotlines', icon: 'fa-phone-flip' },
  ];

  return (
    <div className="w-72 h-full bg-slate-950 flex flex-col fixed left-0 top-0 z-50 text-slate-400">
      <div className="p-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-shield-heart text-white text-xl"></i>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight block leading-none">MindGuard</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 block">Clinical AI</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
        <div className="px-5 py-4 mb-4 bg-white/5 rounded-3xl border border-white/5">
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active Profile</p>
           <p className="text-sm font-black text-white truncate">{userName}</p>
        </div>

        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
              currentView === item.id
                ? 'bg-white/10 text-white shadow-xl shadow-black/20'
                : 'hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              currentView === item.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 group-hover:bg-slate-800'
            }`}>
              <i className={`fas ${item.icon} text-sm`}></i>
            </div>
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <button 
          onClick={() => onViewChange('mobile-app')}
          className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
            currentView === 'mobile-app' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white/5 hover:bg-white/10 text-indigo-400'
          }`}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5">
            <i className="fas fa-mobile-screen-button text-sm"></i>
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">Get Mobile App</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-400 group"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 group-hover:bg-rose-500/20">
            <i className="fas fa-right-from-bracket text-sm"></i>
          </div>
          <span className="font-semibold text-sm">Sign Out</span>
        </button>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
          <i className="fas fa-star absolute -right-4 -top-4 text-7xl opacity-10 group-hover:rotate-12 transition-transform duration-700"></i>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Weekly Progress</p>
          <div className="flex items-end justify-between mb-3">
            <p className="text-2xl font-black">72%</p>
            <p className="text-[10px] font-bold opacity-80 uppercase">Level 4 Mind</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-white h-full rounded-full w-[72%] transition-all duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
