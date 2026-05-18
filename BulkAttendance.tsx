
import React, { useState } from 'react';
import { Student, AttendanceStatus, Language, DailyLog } from '../types';
import { TRANSLATIONS } from '../constants';

interface BulkAttendanceProps {
  students: Student[];
  lang: Language;
  onSave: (logs: DailyLog[]) => void;
  onBack: () => void;
}

const BulkAttendance: React.FC<BulkAttendanceProps> = ({ students, lang, onSave, onBack }) => {
  const t = TRANSLATIONS[lang];
  const today = new Date().toISOString().split('T')[0];
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(students.map(s => [s.id, 'present']))
  );

  const handleSave = () => {
    const logs: DailyLog[] = students.map(s => ({
      id: Math.random().toString(),
      studentId: s.id,
      date: today,
      attendance: attendance[s.id],
      homeworkDone: false,
      calories: 0
    }));
    onSave(logs);
    onBack();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-indigo-600 font-bold">&larr; {t.back}</button>
        <h2 className="text-xl font-black">{t.markAttendance}</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
          <span>Student</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-slate-100">
          {students.map(student => (
            <div key={student.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
              <div className="font-bold">
                {lang === 'en' ? student.name : student.nameKn}
                <span className="block text-[10px] text-slate-400 font-normal uppercase">{student.standard}</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['present', 'absent', 'late'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setAttendance({...attendance, [student.id]: status})}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${attendance[student.id] === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t[status].charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all"
      >
        {t.saveAll}
      </button>
    </div>
  );
};

export default BulkAttendance;
