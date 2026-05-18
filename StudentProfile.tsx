
import React, { useState, useRef } from 'react';
import { Student, DailyLog, Assessment, Language } from '../types';
import { TRANSLATIONS, SUBJECTS, MEAL_MENU } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { analyzeMeal } from '../services/geminiService';

interface ProfileProps {
  student: Student;
  logs: DailyLog[];
  assessments: Assessment[];
  lang: Language;
  onBack: () => void;
  onUpdateLog: (log: DailyLog) => void;
  onAddAssessment: (asm: Omit<Assessment, 'id'>) => void;
}

const StudentProfile: React.FC<ProfileProps> = ({ student, logs, assessments, lang, onBack, onUpdateLog, onAddAssessment }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'assessments' | 'focus'>('today');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr && l.studentId === student.id) || {
    id: Math.random().toString(),
    studentId: student.id,
    date: todayStr,
    attendance: 'present',
    homeworkDone: false,
    calories: 0,
  } as DailyLog;

  const startCamera = async () => {
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
      onUpdateLog({
        ...todayLog,
        mealItem: analysis.mealItem,
        calories: analysis.calories,
        mealPhoto: `data:image/jpeg;base64,${base64}`
      });
    }
    setIsAiLoading(false);
  };

  const scoreData = assessments
    .filter(a => a.studentId === student.id)
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(a => ({ date: a.date, score: Math.round((a.score / a.maxScore) * 100), type: a.type, subject: a.subject }));

  const getWeakSpots = () => {
    const sAsms = assessments.filter(a => a.studentId === student.id);
    const subjectAverages = SUBJECTS.map(sub => {
      const subAsms = sAsms.filter(a => a.subject === sub);
      const avg = subAsms.length ? subAsms.reduce((acc, a) => acc + (a.score/a.maxScore), 0) / subAsms.length : 1;
      return { subject: sub, average: avg };
    });
    return subjectAverages.filter(s => s.average < 0.6);
  };

  const weakSpots = getWeakSpots();

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-indigo-600 font-bold flex items-center">
          <span className="mr-1">&larr;</span> {t.back}
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-black text-slate-800 leading-none">{lang === 'en' ? student.name : student.nameKn}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{student.standard}</p>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar mb-6">
          {(['today', 'assessments', 'focus', 'history'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-3 rounded-xl text-xs font-black transition-all capitalize ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab === 'focus' ? t.focusSuggestions : tab}
            </button>
          ))}
        </div>

        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-3">
                  <span className="font-bold text-xs text-slate-400 block uppercase tracking-widest">{t.attendance}</span>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-2xl">
                    {(['present', 'absent', 'late'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => onUpdateLog({...todayLog, attendance: s})}
                        className={`py-4 rounded-xl text-xs font-black transition-all ${todayLog.attendance === s ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
                      >
                        {t[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl">
                  <span className="font-bold text-xs text-slate-400 uppercase tracking-widest">{t.homework}</span>
                  <button 
                    onClick={() => onUpdateLog({...todayLog, homeworkDone: !todayLog.homeworkDone})}
                    className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${todayLog.homeworkDone ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {todayLog.homeworkDone ? t.done : t.notDone}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{t.learnings}</label>
                  <textarea 
                    className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-5 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                    rows={4}
                    placeholder="Describe today's activities..."
                    value={todayLog.learningNote || ''}
                    onChange={e => onUpdateLog({...todayLog, learningNote: e.target.value})}
                  />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-lg">Growth Timeline</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black px-1 text-slate-800">History of Marks</h3>
              {assessments.filter(a => a.studentId === student.id).reverse().map(asm => (
                <div key={asm.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center transition-all hover:scale-[1.02]">
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{asm.type}</div>
                    <div className="font-black text-slate-800 text-lg">{asm.subject}</div>
                    <div className="text-xs text-slate-400 font-bold">{asm.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-800">{asm.score}<span className="text-slate-300 text-base font-bold tracking-tight">/{asm.maxScore}</span></div>
                    <div className={`text-xs font-black uppercase px-2 py-0.5 rounded-lg inline-block ${ (asm.score/asm.maxScore) > 0.8 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {Math.round((asm.score/asm.maxScore)*100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
             <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl">
                <h3 className="text-2xl font-black mb-2 flex items-center">
                  <span className="mr-3 text-3xl">🎯</span> Weak Point Analysis
                </h3>
                <p className="text-indigo-200 text-sm opacity-80 leading-relaxed">Based on overall assessment performance, here is where {student.name} needs the most support.</p>
             </div>

             {weakSpots.length > 0 ? (
               <div className="grid grid-cols-1 gap-4">
                 {weakSpots.map(ws => (
                   <div key={ws.subject} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                         <h4 className="font-black text-xl text-slate-800">{ws.subject}</h4>
                         <span className="bg-red-100 text-red-700 px-4 py-1 rounded-xl text-xs font-black uppercase">Critical Area</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500 transition-all" style={{ width: `${ws.average * 100}%` }}></div>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Performance in {ws.subject} is currently at <b>{Math.round(ws.average * 100)}%</b>. 
                        We recommend focusing on fundamental concepts using the <b>AI Tutor</b> video explainer for {ws.subject}.
                      </p>
                      <button className="w-full bg-slate-50 border border-slate-200 py-3 rounded-2xl text-xs font-black text-indigo-600 active:scale-95 transition-all">
                        Get Remedial Plan &rarr;
                      </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="bg-white p-12 rounded-[2rem] border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="text-5xl">🌟</div>
                  <h4 className="text-xl font-black text-slate-800">Doing Great!</h4>
                  <p className="text-slate-400 text-sm">No critical weak spots detected. {student.name} is performing above average across all subjects.</p>
               </div>
             )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default StudentProfile;
