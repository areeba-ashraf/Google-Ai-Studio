
import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { generateWeeklySummary } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface HistoryViewProps {
  history: MoodEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (history.length === 0 || isExporting) return;

    setIsExporting(true);
    try {
      const summaryText = await generateWeeklySummary(history);
      if (!summaryText) throw new Error("AI data synthesis failed.");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 0;

      const getPart = (marker: string) => {
        const parts = summaryText.split(`[${marker}]`);
        if (parts.length < 2) return "";
        return parts[1].split('[')[0].trim();
      };

      const riskScore = parseInt(getPart('RISK_SCORE')) || 42;
      const summary = getPart('EXECUTIVE_SUMMARY');
      const patterns = getPart('PATTERN_ANALYSIS');
      const strategies = getPart('LIFESTYLE_STRATEGIES');
      const signOff = getPart('CLINICAL_SIGN_OFF');

      // --- SECTION: HEADER ---
      doc.setFillColor(30, 41, 59); // Slate-900
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('MINDGUARD', margin, 25);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text('WEEKLY PSYCHOMETRIC STATUS REPORT', margin, 32);
      
      doc.setFontSize(8);
      doc.text(`REPORT PERIOD: ${new Date(history[0].timestamp).toLocaleDateString()} - ${new Date().toLocaleDateString()}`, pageWidth - margin, 22, { align: 'right' });
      doc.text(`GENERATED VIA: GEMINI-3 ANALYTICS ENGINE`, pageWidth - margin, 26, { align: 'right' });
      doc.text(`DOCUMENT ID: MG-REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, pageWidth - margin, 30, { align: 'right' });

      // --- SECTION: DASHBOARD WIDGETS ---
      yPos = 65;
      
      // Risk Card Widget
      const riskColor = riskScore < 30 ? [16, 185, 129] : riskScore < 70 ? [245, 158, 11] : [225, 29, 72];
      const riskLabel = riskScore < 30 ? 'LOW' : riskScore < 70 ? 'MODERATE' : 'ELEVATED';

      doc.setFillColor(248, 250, 252); // Slate-50
      doc.roundedRect(margin, yPos, contentWidth, 48, 4, 4, 'F');
      
      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('RISK ASSESSMENT DIAGNOSTIC', margin + 8, yPos + 12);

      // Score Large
      doc.setFontSize(38);
      doc.setTextColor(30, 41, 59);
      doc.text(`${riskScore}`, margin + 8, yPos + 32);
      doc.setFontSize(14);
      doc.setTextColor(148, 163, 184);
      doc.text('/100', margin + 22 + (riskScore > 9 ? 6 : 0), yPos + 32);

      // Status Badge
      doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.roundedRect(margin + 55, yPos + 16, 30, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(riskLabel, margin + 70, yPos + 22.5, { align: 'center' });

      // Summary lines next to score
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const summaryLines = doc.splitTextToSize(summary, contentWidth - 100);
      doc.text(summaryLines, margin + 90, yPos + 15);

      yPos += 62;

      // --- SECTION: ANALYTICAL CATEGORIES ---
      const drawModernSection = (title: string, content: string, accentColor: number[]) => {
        if (!content) return;

        // Title
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(margin, yPos, 4, 8, 1, 1, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin + 8, yPos + 6);
        
        yPos += 14;

        // Content
        const lines = doc.splitTextToSize(content, contentWidth);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);

        lines.forEach((line: string) => {
          if (yPos > 275) {
            doc.addPage();
            yPos = 20;
          }

          // Modern bullet handling
          if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.2);
            doc.circle(margin + 2, yPos - 1.5, 1, 'F');
            doc.text(line.replace(/^[-*]\s?/, ''), margin + 6, yPos);
          } else {
            // Handle Bold markers from AI
            if (line.includes('**')) {
              let curX = margin;
              const segments = line.split('**');
              segments.forEach((seg, i) => {
                doc.setFont('helvetica', i % 2 === 1 ? 'bold' : 'normal');
                doc.text(seg, curX, yPos);
                curX += doc.getTextWidth(seg);
              });
            } else {
              doc.text(line, margin, yPos);
            }
          }
          yPos += 6;
        });

        yPos += 12;
      };

      drawModernSection('PATTERN INSIGHTS & DIAGNOSTICS', patterns, [79, 70, 229]);
      drawModernSection('OPTIMIZATION STRATEGIES', strategies, [16, 185, 129]);
      drawModernSection('EXECUTIVE CLINICAL GUIDANCE', signOff, [71, 85, 105]);

      // --- SECTION: MOOD DISTRIBUTION GRAPH ---
      if (yPos < 220) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('HISTORICAL MOOD DISTRIBUTION (7-DAY ANALYSIS)', margin, yPos);
        yPos += 8;

        const chartHeight = 25;
        const chartWidth = contentWidth;
        const last7 = history.slice(-7);
        const barWidth = chartWidth / 7 - 4;

        last7.forEach((entry, i) => {
          const x = margin + (i * (barWidth + 4));
          const h = (entry.score / 10) * chartHeight;
          
          doc.setFillColor(79, 70, 229, 0.4);
          doc.rect(x, yPos + (chartHeight - h), barWidth, h, 'F');
          
          doc.setFontSize(6);
          doc.setTextColor(148, 163, 184);
          doc.text(new Date(entry.timestamp).toLocaleDateString(undefined, {weekday: 'short'}), x + barWidth/2, yPos + chartHeight + 4, {align: 'center'});
        });
      }

      // --- FOOTER ---
      const pages = doc.internal.pages.length - 1;
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 285, pageWidth - margin, 285);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('CONFIDENTIAL: MINDGUARD PSYCHOMETRIC ANALYTICS REPORT. NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.', pageWidth/2, 290, { align: 'center' });
        doc.text(`PAGE ${i} OF ${pages}`, pageWidth - margin, 290, { align: 'right' });
      }

      doc.save(`MindGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Diagnostic generation failed. Please try again with more journal history.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">Mental Performance</h2>
          <p className="text-indigo-300 font-medium max-w-lg">Advanced longitudinal tracking of emotional volatility and energy depletion patterns.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting || history.length === 0}
          className={`group relative z-10 flex items-center gap-3 px-8 py-5 rounded-3xl font-black transition-all shadow-xl ${
            isExporting || history.length === 0
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-white text-slate-900 hover:bg-indigo-500 hover:text-white hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
              Compiling Data...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf text-xl"></i>
              Generate Clinical Report
            </>
          )}
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.length === 0 ? (
          <div className="bg-white p-24 rounded-[48px] text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
              <i className="fas fa-folder-open text-slate-200 text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Dataset Empty</h3>
            <p className="text-slate-400 mt-2">Historical patterns will appear once you begin logging entries.</p>
          </div>
        ) : (
          history.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/20 transition-all duration-500 group relative">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-3xl shadow-inner transition-all duration-500 group-hover:scale-110 ${
                    entry.score >= 7 ? 'bg-emerald-50 text-emerald-600' : 
                    entry.score >= 4 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {entry.score >= 7 ? <i className="fas fa-smile-beam"></i> : entry.score >= 4 ? <i className="fas fa-meh-blank"></i> : <i className="fas fa-face-frown-open"></i>}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded-full">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{entry.dominantEmotion}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 px-10 py-6 rounded-[32px] border border-slate-800 text-center min-w-[140px] shadow-lg">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-1">Vitality</span>
                  <span className="text-4xl font-black text-white tracking-tighter">{entry.score}</span>
                </div>
              </div>
              
              <div className="md:pl-28 relative">
                <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-slate-100 hidden md:block"></div>
                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 relative group-hover:bg-white group-hover:border-indigo-100 transition-all duration-500 shadow-inner">
                  <p className="text-slate-700 leading-relaxed font-semibold text-lg italic">"{entry.journalText}"</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-50 shadow-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    SENTIMENT: {entry.sentiment}
                  </div>
                  <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    SYSTEM: {entry.label}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
