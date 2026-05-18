
import React from 'react';
import { Student, AttendanceStatus, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface StudentGridProps {
  students: Student[];
  onSelect: (id: string) => void;
  lang: Language;
  attendanceMap: Record<string, AttendanceStatus>;
}

const StudentGrid: React.FC<StudentGridProps> = ({ students, onSelect, lang, attendanceMap }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {students.map((student) => {
        const status = attendanceMap[student.id] || 'present';
        const statusColors = {
          present: 'bg-green-500',
          absent: 'bg-red-500',
          late: 'bg-yellow-500'
        };

        return (
          <div 
            key={student.id}
            onClick={() => onSelect(student.id)}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold uppercase overflow-hidden">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.charAt(0)
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`}></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{lang === 'en' ? student.name : student.nameKn}</h3>
                <p className="text-sm text-slate-500">{student.standard} • {t.rollNo}: {student.rollNo}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
               <div className="flex space-x-1 items-center">
                 <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                 <span>Active Progress</span>
               </div>
               <span className="group-hover:text-indigo-600 transition-colors">View Profile &rarr;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentGrid;
