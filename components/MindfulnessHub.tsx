
import React, { useState, useEffect } from 'react';

type Exercise = 'none' | 'breathing' | 'pmr';

const MindfulnessHub: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<Exercise>('none');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {activeExercise === 'none' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setActiveExercise('breathing')}
            className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all text-left"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-wind"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">4-7-8 Breathing</h3>
            <p className="text-slate-500 font-medium">A powerful technique to calm the nervous system instantly. Inhale for 4, hold for 7, exhale for 8.</p>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold">
              Start Session <i className="fas fa-arrow-right text-xs"></i>
            </div>
          </button>

          <button 
            onClick={() => setActiveExercise('pmr')}
            className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all text-left"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-person-walking-arrow-right"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Muscle Relaxation</h3>
            <p className="text-slate-500 font-medium">Progressive Muscle Relaxation (PMR) helps release physical tension stored in your muscles from daily stress.</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold">
              Begin Journey <i className="fas fa-arrow-right text-xs"></i>
            </div>
          </button>
        </div>
      ) : activeExercise === 'breathing' ? (
        <BreathingExercise onBack={() => setActiveExercise('none')} />
      ) : (
        <PMRExercise onBack={() => setActiveExercise('none')} />
      )}
    </div>
  );
};

const BreathingExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [rounds, setRounds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            setRounds(r => r + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 transition-colors">
        <i className="fas fa-chevron-left text-xl"></i>
      </button>
      
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">4-7-8 Breathing</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Rounds Completed: {rounds}</p>
      </div>

      <div className="relative flex items-center justify-center py-20">
        {/* Animated Circle */}
        <div className={`absolute w-64 h-64 rounded-full transition-all duration-[1000ms] ease-in-out border-4 border-indigo-100 ${
          phase === 'Inhale' ? 'scale-150 bg-indigo-50/50' : 
          phase === 'Hold' ? 'scale-150 bg-indigo-100/50' : 'scale-100 bg-white'
        }`}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-6xl font-black text-slate-900 mb-4 transition-all">{timer}</span>
          <span className="text-sm font-black text-indigo-600 uppercase tracking-[0.4em]">{phase}</span>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          Focus only on the air moving in and out of your lungs. Let all other thoughts float away.
        </p>
        <button 
          onClick={onBack}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-rose-600 transition-all active:scale-95"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

const PMRExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    { area: "Hands & Forearms", instruction: "Clench both fists as hard as you can. Feel the tension." },
    { area: "Shoulders", instruction: "Shrug your shoulders up towards your ears. Hold them tight." },
    { area: "Face", instruction: "Squeeze your eyes shut and scrunch your face. Feel the tightness." },
    { area: "Abdomen", instruction: "Tighten your stomach muscles as if someone is about to punch you." },
    { area: "Feet", instruction: "Curl your toes tightly and tense the arches of your feet." }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isTense, setIsTense] = useState(true);

  return (
    <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 transition-colors">
        <i className="fas fa-chevron-left text-xl"></i>
      </button>

      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Muscle Relaxation</h2>
        <div className="flex justify-center gap-1 mt-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="py-20 flex flex-col items-center">
        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-4xl mb-8 transition-all duration-700 ${
          isTense ? 'bg-rose-50 text-rose-500 scale-110 shadow-xl shadow-rose-100 rotate-3' : 'bg-emerald-50 text-emerald-500 scale-100'
        }`}>
          <i className={`fas ${isTense ? 'fa-dumbbell' : 'fa-leaf'}`}></i>
        </div>
        
        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{steps[currentStep].area}</h3>
        <p className="text-slate-500 font-medium max-w-sm h-16">{steps[currentStep].instruction}</p>
        
        <div className="mt-12 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsTense(!isTense)}
            className={`px-12 py-5 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95 ${
              isTense ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
            }`}
          >
            {isTense ? 'Now RELEASE' : 'Next Muscle Group'}
          </button>
          
          {!isTense && currentStep < steps.length - 1 && (
            <button 
              onClick={() => {
                setCurrentStep(s => s + 1);
                setIsTense(true);
              }}
              className="text-emerald-600 font-bold hover:underline"
            >
              Continue to next step
            </button>
          )}

          {currentStep === steps.length - 1 && !isTense && (
            <div className="animate-bounce mt-4">
              <span className="text-emerald-500 font-black">All Done! You've released total body tension.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindfulnessHub;
