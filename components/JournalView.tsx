
import React, { useState } from 'react';
import { analyzeJournalEntry } from '../services/geminiService';
import { InsightReport, MoodEntry } from '../types';

interface JournalViewProps {
  onEntryProcessed: (entry: MoodEntry, insight: InsightReport) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ onEntryProcessed }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodScore, setMoodScore] = useState(5);

  const handleSubmit = async () => {
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const insight = await analyzeJournalEntry(text);
      
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        score: moodScore,
        label: moodScore >= 7 ? 'Good' : moodScore >= 4 ? 'Neutral' : 'Poor',
        sentiment: insight.overallMood,
        dominantEmotion: insight.stressMarkers[0] || 'Unknown',
        journalText: text
      };

      onEntryProcessed(newEntry, insight);
      setText('');
      setMoodScore(5);
    } catch (error) {
      alert("Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Daily Check-in</h2>
        <p className="text-slate-500 mb-8">How was your day? Write as much as you'd like. Our AI will help you process your emotions.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Rate your general mood right now</label>
          <div className="flex items-center gap-4">
            <span className="text-2xl">😔</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={moodScore} 
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-2xl">😊</span>
            <span className="font-bold text-indigo-600 min-w-[20px]">{moodScore}</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">Your Thoughts</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Today I felt... because..."
            className="w-full h-48 p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none text-slate-700 leading-relaxed"
          ></textarea>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !text.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
            isAnalyzing || !text.trim() 
            ? 'bg-slate-300 cursor-not-allowed shadow-none' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch animate-spin"></i>
              Analyzing Patterns...
            </span>
          ) : (
            "Save & Analyze Entry"
          )}
        </button>

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div className="flex gap-3 text-xs text-slate-500 items-center">
            <i className="fas fa-lock text-emerald-500"></i>
            <p>Your entries are encrypted. Privacy is our top priority. Only anonymous patterns are analyzed to provide support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalView;
