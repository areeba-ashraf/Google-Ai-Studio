
import React, { useState, useEffect } from 'react';
import { EmergencyContact, AlertConfig } from '../types';
import { alertService } from '../services/alertService';
import { dbService } from '../services/dbService';

interface EmergencySettingsProps {
  contacts: EmergencyContact[];
  userEmail: string;
  onUpdate: (contacts: EmergencyContact[]) => void;
  onSendTest: (contact: EmergencyContact, config: AlertConfig) => void;
}

const EmergencySettings: React.FC<EmergencySettingsProps> = ({ contacts, userEmail, onUpdate, onSendTest }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showIftttGuide, setShowIftttGuide] = useState(false);

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    method: 'textbelt',
    useProxy: true,
    twilio: { accountSid: '', authToken: '', fromNumber: '' },
    ifttt: { webhookKey: '', eventName: 'mindguard_alert' }
  });

  useEffect(() => {
    const loadConfig = async () => {
      if (!userEmail) return;
      const saved = await dbService.getConfig(userEmail);
      if (saved) setAlertConfig(saved);
    };
    loadConfig();
  }, [userEmail]);

  const handleSaveConfig = async () => {
    if (!userEmail) return;
    await dbService.saveConfig(userEmail, alertConfig);
    setShowConfig(false);
    alert("Alert protocol updated and saved to your private profile.");
  };

  const handleTriggerTest = async (contact: EmergencyContact) => {
    setIsSending(contact.id);
    await onSendTest(contact, alertConfig);
    setIsSending(null);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      alert("Name and phone number are required.");
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      relation: newRelation || 'Trusted Contact'
    };

    if (isVerifying) {
      const message = `MindGuard: Hello ${newName}, I have added you as my emergency contact. You will be alerted automatically if I am in deep distress.`;
      await alertService.sendAlert(contact, message, alertConfig);
    }

    onUpdate([...contacts, contact]);
    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-5xl font-black tracking-tighter">Safety Net</h2>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {alertConfig.method === 'textbelt' ? 'Auto SMS Active' : `${alertConfig.method.toUpperCase()} Protocol Active`}
              </div>
            </div>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all shadow-xl"
            >
              <i className="fas fa-sliders text-indigo-400"></i>
            </button>
          </div>
          
          <p className="text-slate-400 font-medium max-w-lg leading-relaxed text-lg mb-10">
            {alertConfig.method === 'textbelt' 
              ? "Your safety net uses an automatic SMS relay. No setup required for your first daily alert."
              : alertConfig.method === 'ifttt' 
              ? "MindGuard is connected to your IFTTT Webhook. No app required on your iPhone."
              : "Advanced dispatch mode is active. Check your configuration for 24/7 reliability."}
          </p>

          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-lg flex items-center gap-4 hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
          >
            <i className="fas fa-user-plus"></i> Add New Trusted Contact
          </button>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <i className="fas fa-shield-heart text-[240px]"></i>
        </div>
      </div>

      {showConfig && (
        <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100 shadow-2xl space-y-10 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Dispatch Protocol</h3>
             <button 
               onClick={() => setShowIftttGuide(!showIftttGuide)}
               className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest"
             >
               {showIftttGuide ? 'Hide Setup' : 'iPhone / No-App Setup Guide'}
             </button>
          </div>

          {showIftttGuide && (
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 space-y-4 text-sm animate-in slide-in-from-right-4">
               <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">IFTTT Cloud Setup (No App Needed)</h4>
               <ol className="list-decimal list-inside space-y-2 text-slate-600 font-medium">
                 <li>Go to <a href="https://ifttt.com/create" target="_blank" className="text-indigo-600 underline">ifttt.com/create</a> in Safari.</li>
                 <li><strong>If This</strong>: Search for "Webhooks" & choose "Receive a web request".</li>
                 <li><strong>Event Name</strong>: Enter <code className="bg-slate-200 px-2 py-0.5 rounded">mindguard_alert</code></li>
                 <li><strong>Then That</strong>: Search for <strong>"Email"</strong> (or "Gmail"). This sends an alert from the cloud.</li>
                 <li><strong>Configure Action</strong>: Set the Subject to "MindGuard Crisis Alert" and Body to <code className="bg-slate-200 px-2 py-0.5 rounded">Value2</code></li>
                 <li><em>Tip: To send an SMS instead of email, set the "To" address to your contact's carrier gateway (e.g. 5551234567@vtext.com)</em></li>
                 <li>Get your <strong>Key</strong> from <a href="https://ifttt.com/maker_webhooks/settings" target="_blank" className="text-indigo-600 underline">Webhooks Settings</a>.</li>
               </ol>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'textbelt', label: 'Auto SMS', icon: 'fa-wand-magic-sparkles', desc: 'Zero Setup' },
              { id: 'ifttt', label: 'IFTTT Cloud', icon: 'fa-bolt', desc: 'No App Required' },
              { id: 'native', label: 'Manual SMS', icon: 'fa-mobile-retro', desc: 'iPhone Link' },
              { id: 'twilio', label: 'Twilio', icon: 'fa-cloud', desc: 'Professional' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setAlertConfig({...alertConfig, method: m.id as any})}
                className={`p-6 rounded-[32px] border-2 transition-all text-left relative group ${
                  alertConfig.method === m.id ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-50 bg-slate-50/50 grayscale opacity-60'
                }`}
              >
                {alertConfig.method === m.id && <i className="fas fa-check-circle absolute top-4 right-4 text-indigo-600"></i>}
                <i className={`fas ${m.icon} text-3xl mb-4 ${alertConfig.method === m.id ? 'text-indigo-600' : 'text-slate-400'}`}></i>
                <h4 className="font-black text-slate-900 text-sm">{m.label}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{m.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
             {alertConfig.method === 'ifttt' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-2">IFTTT Webhook Key</label>
                    <input type="text" placeholder="Enter your secret key" className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none" value={alertConfig.ifttt?.webhookKey} onChange={e => setAlertConfig({...alertConfig, ifttt: {...alertConfig.ifttt!, webhookKey: e.target.value}})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-2">Event Name</label>
                    <input type="text" placeholder="mindguard_alert" className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none" value={alertConfig.ifttt?.eventName} onChange={e => setAlertConfig({...alertConfig, ifttt: {...alertConfig.ifttt!, eventName: e.target.value}})} />
                  </div>
                </div>
             )}

             {alertConfig.method === 'twilio' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <input type="text" placeholder="Account SID" className="p-4 rounded-2xl border border-slate-200" value={alertConfig.twilio?.accountSid} onChange={e => setAlertConfig({...alertConfig, twilio: {...alertConfig.twilio!, accountSid: e.target.value}})} />
                   <input type="password" placeholder="Auth Token" className="p-4 rounded-2xl border border-slate-200" value={alertConfig.twilio?.authToken} onChange={e => setAlertConfig({...alertConfig, twilio: {...alertConfig.twilio!, authToken: e.target.value}})} />
                   <input type="text" placeholder="From Number" className="p-4 rounded-2xl border border-slate-200" value={alertConfig.twilio?.fromNumber} onChange={e => setAlertConfig({...alertConfig, twilio: {...alertConfig.twilio!, fromNumber: e.target.value}})} />
                </div>
             )}

             <div className="flex items-center gap-4">
                <input type="checkbox" checked={alertConfig.useProxy} onChange={e => setAlertConfig({...alertConfig, useProxy: e.target.checked})} className="w-6 h-6 accent-indigo-600" id="proxy-cfg" />
                <label htmlFor="proxy-cfg" className="text-xs font-black text-slate-800 uppercase tracking-widest cursor-pointer">Use Secure Proxy (CodeTabs)</label>
             </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSaveConfig} className="bg-slate-950 text-white px-12 py-4 rounded-2xl font-black text-sm transition-all hover:bg-indigo-600">Save Protocol</button>
            <button onClick={() => setShowConfig(false)} className="text-slate-400 font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter px-2">Protected Circle</h3>
          <div className="grid grid-cols-1 gap-4">
            {contacts.length === 0 ? (
              <div className="bg-white p-24 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                <i className="fas fa-heart-pulse text-slate-100 text-7xl mb-6"></i>
                <h4 className="text-xl font-bold text-slate-800">Your network is empty</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Add a contact to enable automatic alerts.</p>
              </div>
            ) : (
              contacts.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-100/30">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {isSending === c.id ? <i className="fas fa-circle-notch animate-spin text-sm"></i> : c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{c.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.relation} • {c.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleTriggerTest(c)} className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <i className="fas fa-bolt-lightning text-xs"></i>
                    </button>
                    <button onClick={() => onUpdate(contacts.filter(item => item.id !== c.id))} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                      <i className="fas fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter px-2">Dispatch Feed</h3>
          <div className="bg-slate-950 rounded-[48px] p-8 h-[460px] flex flex-col border border-white/5 shadow-2xl">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide font-mono text-[11px]">
              {alertService.getLogs().length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 text-white italic">
                  <i className="fas fa-satellite-dish text-3xl mb-4"></i>
                  <p>Awaiting dispatch commands...</p>
                </div>
              ) : (
                alertService.getLogs().map(log => (
                  <div key={log.id} className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-3 text-white/90">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400 font-bold text-xs">{log.toName}</span>
                      <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-[9px] font-black ${
                        log.status === 'delivered' || log.status === 'native_opened' || log.status === 'dispatched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </div>
                    </div>
                    <p className="opacity-60 leading-relaxed italic">"{log.body}"</p>
                    {log.status === 'dispatched' && <p className="text-[9px] text-amber-400 opacity-60 mt-1">Status Dispatched: Sent to relay. Confirmation restricted by CORS.</p>}
                    {log.error && <p className="text-rose-400 font-bold text-[10px] bg-rose-500/10 p-2 rounded-lg mt-2">Error: {log.error}</p>}
                    <div className="pt-3 border-t border-white/5 flex justify-between opacity-30 text-[9px]">
                      <span className="uppercase tracking-widest">{log.method} RELAY</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] p-12 w-full max-w-lg shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Add Safety Link</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none" />
              <input type="tel" placeholder="Phone Number (e.g. +1...)" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none" />
              <input type="text" placeholder="Relationship (e.g. Sister)" value={newRelation} onChange={e => setNewRelation(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none" />
              <label className="flex items-center gap-4 cursor-pointer p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                <input type="checkbox" checked={isVerifying} onChange={() => setIsVerifying(!isVerifying)} className="w-6 h-6 accent-indigo-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Send Verification SMS</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-slate-100 rounded-3xl font-black">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-5 bg-slate-950 text-white rounded-3xl font-black">Link Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencySettings;
