
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry, InsightReport, View } from '../types';

interface DashboardProps {
  history: MoodEntry[];
  latestInsight: InsightReport | null;
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, latestInsight, onNavigate }) => {
  const chartData = history.slice(-7).map(entry => ({
    name: new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    mood: entry.score
  }));

  const riskLevel = latestInsight ? (
    latestInsight.riskScore < 30 ? 'Low' : latestInsight.riskScore < 70 ? 'Moderate' : 'Elevated'
  ) : 'Pending';

  const riskColor = latestInsight ? (
    latestInsight.riskScore < 30 ? 'text-emerald-500' : latestInsight.riskScore < 70 ? 'text-amber-500' : 'text-rose-500'
  ) : 'text-slate-300';

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Diagnostic Card */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50">
          <div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Status</span>
              <div className={`w-2 h-2 rounded-full ${latestInsight?.riskScore! < 30 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">{latestInsight ? latestInsight.riskScore : '--'}</span>
              <span className="text-slate-300 font-bold">/100</span>
            </div>
            <p className={`text-sm font-black uppercase tracking-widest ${riskColor}`}>{riskLevel} Stress Risk</p>
          </div>
          <p className="mt-8 text-xs font-medium text-slate-500 leading-relaxed italic">
            "{latestInsight?.overallMood || "Waiting for diagnostic data from your first journal entry."}"
          </p>
        </div>

        {/* Dynamic Chart Container */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8 px-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Emotional Vitality</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">7-Day Biometric Trend</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:text-indigo-600 transition-colors"><i className="fas fa-expand"></i></button>
              <button className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:text-indigo-600 transition-colors"><i className="fas fa-ellipsis-v"></i></button>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                />
                <Area type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Intervention Strategy */}
        <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
          <i className="fas fa-shield-halved absolute -right-8 -bottom-8 text-9xl text-white/5 group-hover:rotate-12 transition-transform duration-700"></i>
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-10">
              <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Priority Intervention</span>
              <h3 className="text-3xl font-black text-white tracking-tighter mt-4">Personalized Action</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm">
                {latestInsight?.recommendations[0]?.description || "Take 2 minutes to center your thoughts and regulate your breath for immediate neural calmness."}
              </p>
            </div>
            <div className="mt-auto">
              <button 
                onClick={() => onNavigate('mindfulness')}
                className="bg-white text-slate-900 px-8 py-4 rounded-3xl font-black text-sm transition-all hover:bg-indigo-500 hover:text-white hover:-translate-y-1 active:scale-95 shadow-xl"
              >
                Launch Protocol
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight Feed */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">AI Diagnostics Feed</h3>
          <div className="space-y-6">
            {latestInsight ? (
              latestInsight.recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (rec.type === 'exercise' || rec.type === 'meditation') onNavigate('mindfulness');
                    if (rec.type === 'professional') onNavigate('nearby');
                    if (rec.type === 'journaling') onNavigate('journal');
                  }}
                  className="flex gap-6 items-start p-5 rounded-[32px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 shadow-sm ${
                    rec.urgency === 'high' ? 'bg-rose-50 text-rose-500' : 
                    rec.urgency === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'
                  }`}>
                    <i className={`fas ${
                      rec.type === 'exercise' ? 'fa-person-running' :
                      rec.type === 'meditation' ? 'fa-spa' :
                      rec.type === 'professional' ? 'fa-user-doctor' : 'fa-lightbulb-on'
                    } text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rec.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        rec.urgency === 'high' ? 'bg-rose-500/10 text-rose-600' : 
                        rec.urgency === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600'
                      }`}>
                        {rec.urgency} Urgency
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center text-center opacity-30 grayscale">
                <i className="fas fa-wave-pulse text-5xl mb-6 text-slate-300"></i>
                <p className="text-sm font-bold text-slate-400">SYNC DATA TO UNLOCK INSIGHTS</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
