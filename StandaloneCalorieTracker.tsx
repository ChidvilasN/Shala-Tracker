
import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { analyzeMeal } from '../services/geminiService';

interface StandaloneCalorieTrackerProps {
  lang: Language;
}

const StandaloneCalorieTracker: React.FC<StandaloneCalorieTrackerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [isScanning, setIsScanning] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [result, setResult] = useState<{ mealItem: string, calories: number, photo: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setResult(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    const stream = video.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    setIsScanning(false);

    setIsAiLoading(true);
    const analysis = await analyzeMeal(base64);
    if (analysis) {
      setResult({
        ...analysis,
        photo: `data:image/jpeg;base64,${base64}`
      });
    }
    setIsAiLoading(false);
  };

  return (
    <div className="p-6 space-y-8 pb-24 max-w-4xl mx-auto">
      <div className="bg-emerald-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🥗</span>
            <div>
              <h2 className="text-3xl font-black">{t.calories} Tracker</h2>
              <p className="text-emerald-200 text-sm">AI-Powered Mid-Day Meal Analysis</p>
            </div>
          </div>
          <button 
            onClick={startCamera}
            className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
          >
            {t.takePhoto}
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
           <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
           <div className="absolute inset-x-6 top-10 flex justify-between">
              <button onClick={() => {
                const stream = videoRef.current?.srcObject as MediaStream;
                stream?.getTracks().forEach(t => t.stop());
                setIsScanning(false);
              }} className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold">Back</button>
           </div>
           <div className="absolute bottom-10">
              <button onClick={captureAndAnalyze} className="w-20 h-20 bg-white border-8 border-white/20 rounded-full shadow-2xl active:scale-90 transition-transform"></button>
           </div>
        </div>
      )}

      {isAiLoading && (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 animate-in fade-in">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500">{t.analyzing}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8">
           <img src={result.photo} className="w-full h-64 object-cover" alt="Meal" />
           <div className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">{result.mealItem}</h3>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Identified Meal</p>
                 </div>
                 <div className="text-right">
                    <p className="text-4xl font-black text-emerald-600">{result.calories}</p>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Estimated Calories</p>
                 </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                <b>AI Note:</b> This mid-day meal provides approximately {result.calories} kcal. This is a healthy portion for a primary school student.
              </div>
           </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default StandaloneCalorieTracker;
