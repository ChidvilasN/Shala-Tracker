
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { explainConcept, AIExplanation } from '../services/geminiService';

interface AITutorProps {
  lang: Language;
}

const AITutorModule: React.FC<AITutorProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIExplanation | null>(null);

  const handleSearch = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    
    const explanation = await explainConcept(prompt, 'Standards 1-7', lang);
    setResult(explanation);
    setLoading(false);
  };

  // Helper to extract YouTube ID for embed if possible
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🎓</span>
            <div>
              <h2 className="text-3xl font-black">{t.aiTutor}</h2>
              <p className="text-indigo-200 text-sm">Kannada Video & Concept Explainer (Std 1-7)</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input 
              className="flex-1 bg-white/20 border border-white/30 rounded-2xl px-6 py-4 text-white placeholder:text-indigo-300 outline-none focus:ring-4 focus:ring-white/10 transition-all text-lg"
              placeholder={t.conceptPrompt}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? '...' : t.explain}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 animate-in fade-in">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500">Searching Kannada Learning Resources...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-indigo-900 border-b pb-2">English Explanation</h3>
              <p className="text-slate-700 leading-relaxed text-lg">{result.explanationEn}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-black text-indigo-900 border-b pb-2 text-right">ಕನ್ನಡ ವಿವರಣೆ</h3>
              <p className="text-slate-700 leading-relaxed text-lg text-right font-kannada">{result.explanationKn}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-6">
            <h3 className="text-2xl font-black flex items-center">
              <span className="mr-3">🎥</span> Kannada Video Explanation
            </h3>
            
            <div className="aspect-video w-full bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 overflow-hidden relative">
              {result.videoUrl ? (
                getEmbedUrl(result.videoUrl) ? (
                  <iframe 
                    src={getEmbedUrl(result.videoUrl)} 
                    className="w-full h-full"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <p className="text-slate-300 text-lg">We found a great video explanation for you!</p>
                    <a 
                      href={result.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-red-700 transition-colors"
                    >
                      Watch on YouTube ↗
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center p-8">
                  <p className="text-slate-500 font-mono text-sm mb-4 italic">No direct video found, searching library...</p>
                  <p className="text-lg italic text-slate-300">Try refining the concept name for a better video match.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h4 className="font-bold text-indigo-300 mb-2">Classroom Activity</h4>
                <p className="text-white/80">{result.activityEn}</p>
                <p className="text-white/60 mt-2 font-kannada">{result.activityKn}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h4 className="font-bold text-indigo-300 mb-2">Check Understanding</h4>
                <div className="space-y-3">
                  {result.quiz.map((q, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-bold text-white/90">Q: {q.question}</p>
                      <p className="text-indigo-400">A: {q.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutorModule;
