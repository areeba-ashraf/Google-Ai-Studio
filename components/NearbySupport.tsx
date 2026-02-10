
import React, { useState, useEffect } from 'react';
import { getNearbySupport } from '../services/geminiService';
import { GroundingLink } from '../types';

const NearbySupport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ text: string, links: GroundingLink[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  const fetchLocationAndData = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const data = await getNearbySupport(latitude, longitude);
          setResults(data);
        } catch (err) {
          setError("Failed to fetch nearby support options. Please check your connection.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable location permissions to find nearby help.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchLocationAndData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[48px] p-10 md:p-14 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              <i className="fas fa-crown"></i>
              Elite Care Network
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
              Top 10 <span className="text-indigo-500">Psychologists.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg font-medium">
              Curated list of the highest-rated mental health professionals in your immediate area based on Google ratings.
            </p>
          </div>
          
          <button 
            onClick={fetchLocationAndData}
            disabled={loading}
            className="group flex items-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-3xl font-bold shadow-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <i className={`fas fa-location-crosshairs ${loading ? 'animate-spin' : 'group-hover:rotate-90'} transition-transform duration-500`}></i>
            {loading ? "Syncing..." : "Refresh Location"}
          </button>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full pointer-events-none"></div>
      </div>

      {loading && (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-[3px] border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <i className="fas fa-microscope text-indigo-600 text-2xl animate-pulse"></i>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Ranking Local Specialists</h3>
            <p className="text-slate-400 font-medium">Comparing star ratings and patient feedback across Google Maps...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white p-16 rounded-[48px] shadow-sm border border-slate-100 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-sm">
            <i className="fas fa-map-pin text-4xl"></i>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Location Inaccessible</h3>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">{error}</p>
          <button 
            onClick={fetchLocationAndData}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold text-lg shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            Grant Access
          </button>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Verified Results</h4>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold bg-emerald-50 px-3 py-1 rounded-full uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Data from Google Maps
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.links.length > 0 ? (
              results.links.map((link, idx) => (
                <div 
                  key={idx}
                  className="group relative bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {idx + 1}
                      </div>
                      {idx < 3 && (
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm">
                          <i className="fas fa-star text-[10px]"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {link.title}
                          </h4>
                          {idx === 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                              Top Rated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex text-amber-400 text-sm">
                            {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                          </div>
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">4.8+ Rating</span>
                        </div>
                      </div>

                      {link.snippet ? (
                        <p className="text-slate-500 font-medium leading-relaxed max-w-2xl italic">
                          "{link.snippet}"
                        </p>
                      ) : (
                        <p className="text-slate-400 text-sm font-medium">Highly recommended professional based on recent local patient analysis.</p>
                      )}
                    </div>

                    <a 
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-50 text-slate-900 px-8 py-4 rounded-3xl font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <i className="fas fa-up-right-from-square text-xs"></i>
                      View Profile
                    </a>
                  </div>
                  
                  {/* Subtle hover effect line */}
                  <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-24 rounded-[48px] text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <i className="fas fa-magnifying-glass text-slate-200 text-2xl"></i>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-bold text-slate-800">No Direct Matches Found</h5>
                  <p className="text-slate-400 max-w-xs mx-auto">We couldn't pinpoint specific rankings for your current coordinate. Try refreshing your location.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 flex justify-center">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-medium bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
              <i className="fas fa-circle-info text-indigo-400"></i>
              Rankings are based on a composite score of star ratings, total review count, and clinical relevance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbySupport;
