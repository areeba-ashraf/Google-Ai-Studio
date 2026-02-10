
import React, { useState } from 'react';

const MobileAppSDK: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'install' | 'sdk'>('install');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  const sdkCodeSnippet = `
// MindGuard AI Mental Health SDK
import { GoogleGenAI } from "@google/genai";

class MindGuardSDK {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyze(text: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: \`Analyze mental health markers in: "\${text}"\`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  }
}

export default MindGuardSDK;
  `.trim();

  const handleDownloadSDK = () => {
    // Creating a Blob from the SDK file content
    const sdkContent = `
/**
 * MindGuard Mental Health Detection SDK v1.0
 */
class MindGuardSDK {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
  }

  async analyze(text) {
    if (!this.apiKey) throw new Error("MindGuard SDK: API Key is required.");
    const payload = {
      contents: [{ parts: [{ text: \`Analyze mental health markers in: "\${text}"\` }] }],
      generationConfig: { responseMimeType: "application/json" }
    };
    const response = await fetch(\`\${this.endpoint}?key=\${this.apiKey}\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }
}
window.MindGuardSDK = MindGuardSDK;
    `;
    const blob = new Blob([sdkContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindguard-sdk.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      {/* Header Container */}
      <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="inline-flex gap-1">
             <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">PWA Framework</div>
             <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">Multi-Platform</div>
          </div>
          <h2 className="text-5xl font-black tracking-tighter">MindGuard Mobile</h2>
          <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
            Download MindGuard as a standalone app or integrate our clinical mental health logic into your own projects with our developer SDK.
          </p>
          
          <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
            <button 
              onClick={() => setActiveTab('install')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'install' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Get App
            </button>
            <button 
              onClick={() => setActiveTab('sdk')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sdk' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Developer SDK
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <i className="fas fa-mobile-screen-button text-[280px]"></i>
        </div>
      </div>

      {activeTab === 'install' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Installation Instructions */}
          <div className="space-y-6 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Installation Guide</h3>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                 <button onClick={() => setPlatform('ios')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${platform === 'ios' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><i className="fab fa-apple"></i></button>
                 <button onClick={() => setPlatform('android')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${platform === 'android' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><i className="fab fa-android"></i></button>
              </div>
            </div>

            <div className="space-y-8">
              {platform === 'ios' ? (
                <div className="space-y-6">
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">1</div>
                    <p className="text-slate-600 font-medium pt-2">Open MindGuard in <span className="font-bold text-slate-900">Safari</span> on your iPhone.</p>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">2</div>
                    <p className="text-slate-600 font-medium pt-2">Tap the <span className="font-bold text-slate-900">Share</span> button <i className="fas fa-square-up-right text-indigo-500 mx-1"></i> in the bottom menu.</p>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">3</div>
                    <p className="text-slate-600 font-medium pt-2">Scroll down and select <span className="font-bold text-slate-900">"Add to Home Screen"</span>.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">1</div>
                    <p className="text-slate-600 font-medium pt-2">Open MindGuard in <span className="font-bold text-slate-900">Chrome</span> on your Android.</p>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">2</div>
                    <p className="text-slate-600 font-medium pt-2">Tap the <span className="font-bold text-slate-900">Menu</span> <i className="fas fa-ellipsis-v text-emerald-500 mx-1"></i> in the top-right corner.</p>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 flex-shrink-0">3</div>
                    <p className="text-slate-600 font-medium pt-2">Select <span className="font-bold text-slate-900">"Install App"</span> or "Add to Home Screen".</p>
                  </div>
                </div>
              )}
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Native App Features Enabled</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <i className="fas fa-check-circle text-emerald-500"></i> No Address Bar
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <i className="fas fa-check-circle text-emerald-500"></i> Push Alerts
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <i className="fas fa-check-circle text-emerald-500"></i> Local DB
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <i className="fas fa-check-circle text-emerald-500"></i> Biometrics
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Connection */}
          <div className="bg-indigo-600 p-10 rounded-[40px] text-white flex flex-col items-center text-center justify-center space-y-8 shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-2xl font-black mb-2">Quick Scan</h3>
               <p className="text-indigo-100 text-sm opacity-80 mb-8">Scan to open MindGuard instantly on your mobile device.</p>
               
               <div className="bg-white p-6 rounded-[32px] shadow-2xl inline-block group cursor-pointer hover:scale-105 transition-transform">
                 <div className="w-48 h-48 bg-slate-50 rounded-2xl flex items-center justify-center border-4 border-slate-100 relative overflow-hidden">
                   {/* Simulated QR Code */}
                   <div className="grid grid-cols-4 gap-2 w-32 h-32 opacity-80">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`rounded-sm \${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                      ))}
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xl">
                        <i className="fas fa-shield-heart text-xs"></i>
                      </div>
                   </div>
                 </div>
               </div>
               
               <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Session Handoff Secured</p>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
           <div className="flex justify-between items-start">
             <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">MindGuard Core SDK</h3>
                <p className="text-slate-500 font-medium">Build your own mental health app using our battle-tested neural analysis logic.</p>
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(sdkCodeSnippet);
                   alert("SDK Code copied to clipboard!");
                 }}
                 className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2"
               >
                 <i className="fas fa-copy"></i> Copy Code
               </button>
               <button 
                 onClick={handleDownloadSDK}
                 className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all flex items-center gap-2"
               >
                 <i className="fas fa-download"></i> Download SDK (.js)
               </button>
             </div>
           </div>

           <div className="relative">
             <pre className="bg-slate-900 text-indigo-300 p-8 rounded-3xl overflow-x-auto text-sm font-mono border border-white/5 shadow-inner">
               <code>{sdkCodeSnippet}</code>
             </pre>
             <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                <h4 className="font-black text-slate-900 text-sm uppercase">REST Endpoint</h4>
                <p className="text-xs text-slate-500 font-mono">POST /v1/analyze</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                <h4 className="font-black text-slate-900 text-sm uppercase">Auth Protocol</h4>
                <p className="text-xs text-slate-500 font-mono">Bearer (Gemini Key)</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                <h4 className="font-black text-slate-900 text-sm uppercase">Version</h4>
                <p className="text-xs text-slate-500 font-mono">v3.1-preview</p>
              </div>
           </div>
        </div>
      )}
      
      <div className="text-center pt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Global Clinical Standard Compliance v3.0</p>
      </div>
    </div>
  );
};

export default MobileAppSDK;
