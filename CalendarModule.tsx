
import React, { useState } from 'react';
import { CalendarEvent, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CalendarProps {
  events: CalendarEvent[];
  lang: Language;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

const CalendarModule: React.FC<CalendarProps> = ({ events, lang, onAddEvent }) => {
  const t = TRANSLATIONS[lang];
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    titleEn: '',
    titleKn: '',
    type: 'holiday' as const,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    notifyPriorDays: 1
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesKn = [
    "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
    "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(newEvent);
    setShowModal(false);
  };

  const typeColors = {
    holiday: 'bg-red-100 text-red-700',
    exam: 'bg-indigo-100 text-indigo-700',
    activity: 'bg-green-100 text-green-700',
    meeting: 'bg-amber-100 text-amber-700',
    celebration: 'bg-pink-100 text-pink-700'
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.calendar}</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          + Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">
              {lang === 'en' ? monthNames[month] : monthNamesKn[month]} {year}
            </h3>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 border border-slate-200">&larr;</button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 border border-slate-200">&rarr;</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-20"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateStr);
              
              return (
                <div key={day} className="aspect-square border border-slate-100 rounded-lg p-1 hover:bg-slate-50 cursor-pointer flex flex-col justify-between">
                  <span className="text-sm text-slate-600 font-medium">{day}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.map(e => (
                      <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[e.type].split(' ')[0].replace('100', '500')}`}></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-700">{t.upcoming}</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {events
              .filter(e => new Date(e.date) >= new Date(year, month, 1))
              .sort((a,b) => a.date.localeCompare(b.date))
              .map(event => (
              <div key={event.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeColors[event.type]}`}>
                    {event.type}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{event.date}</span>
                </div>
                <h4 className="font-bold text-slate-800">{lang === 'en' ? event.titleEn : event.titleKn}</h4>
                {event.notes && <p className="text-xs text-slate-500 mt-1">{event.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name (English)</label>
                <input 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={newEvent.titleEn}
                  onChange={e => setNewEvent({...newEvent, titleEn: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">ಹೆಸರು (ಕನ್ನಡ)</label>
                <input 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={newEvent.titleKn}
                  onChange={e => setNewEvent({...newEvent, titleKn: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Type</label>
                  <select 
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                  >
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="activity">Activity</option>
                    <option value="meeting">Meeting</option>
                    <option value="celebration">Celebration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 font-semibold border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-semibold rounded-lg">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
