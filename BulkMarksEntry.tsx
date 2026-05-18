
import React, { useState } from 'react';
import { Student, Assessment, Language, AssessmentType } from '../types';
import { TRANSLATIONS, SUBJECTS } from '../constants';

interface BulkMarksEntryProps {
  students: Student[];
  lang: Language;
  onSave: (assessments: Omit<Assessment, 'id'>[]) => void;
  onBack: () => void;
}

const BulkMarksEntry: React.FC<BulkMarksEntryProps> = ({ students, lang, onSave, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [testType, setTestType] = useState<AssessmentType>('Unit Test');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [maxScore, setMaxScore] = useState(25);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(students.map(s => [s.id, 0]))
  );

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const assessments: Omit<Assessment, 'id'>[] = students.map(s => ({
      studentId: s.id,
      date: today,
      type: testType,
      subject: subject,
      score: scores[s.id] || 0,
      maxScore: maxScore
    }));
    onSave(assessments);
    onBack();
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-indigo-600 font-bold">&larr; {t.back}</button>
        <h2 className="text-xl font-black">{t.uploadMarks}</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t.testType}</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
              value={testType}
              onChange={e => setTestType(e.target.value as AssessmentType)}
            >
              <option value="Unit Test">Unit Test</option>
              <option value="Monthly Test">Monthly Test</option>
              <option value="Mid-Term">Mid-Term</option>
              <option value="Annual">Annual Exam</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t.subject}</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">{t.maxScore}</label>
          <input 
            type="number"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
            value={maxScore}
            onChange={e => setMaxScore(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {students.map(student => (
            <div key={student.id} className="p-4 flex justify-between items-center">
              <div className="font-bold">
                {lang === 'en' ? student.name : student.nameKn}
                <span className="block text-[10px] text-slate-400 font-normal uppercase tracking-widest">{student.standard}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="number"
                  placeholder="0"
                  className="w-20 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500"
                  value={scores[student.id]}
                  onChange={e => setScores({...scores, [student.id]: Number(e.target.value)})}
                />
                <span className="text-slate-300 font-bold">/ {maxScore}</span>
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

export default BulkMarksEntry;
