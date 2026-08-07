import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  BellRing,
  FileText,
  Tag,
  Check
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const CalendarView = () => {
  const { reminders, addReminder, updateReminder, toggleReminder, deleteReminder } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  // Modal State (Supports both Add & Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formPriority, setFormPriority] = useState('medium');
  const [formNotes, setFormNotes] = useState('');

  // Calendar Month Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const openAddModalForDate = (dateString) => {
    setEditingReminderId(null);
    setFormTitle('');
    setFormDate(dateString);
    setFormTime('10:00 AM');
    setFormPriority('medium');
    setFormNotes('');
    setShowModal(true);
  };

  const openEditModal = (rem) => {
    setEditingReminderId(rem.id);
    setFormTitle(rem.title);
    setFormDate(rem.date || new Date().toISOString().split('T')[0]);
    setFormTime(rem.time || '10:00 AM');
    setFormPriority(rem.priority || 'medium');
    setFormNotes(rem.notes || '');
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a title for the focus reminder.');
      return;
    }

    if (editingReminderId) {
      updateReminder(editingReminderId, {
        title: formTitle.trim(),
        date: formDate,
        time: formTime.trim(),
        priority: formPriority,
        notes: formNotes.trim()
      });
    } else {
      addReminder(formTitle.trim(), formTime.trim(), formPriority, formDate, formNotes.trim());
    }

    setShowModal(false);
  };

  // Filter reminders matching the selected date
  const filteredReminders = reminders.filter(r => (r.date || new Date().toISOString().split('T')[0]) === selectedDateStr);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-emerald-400" />
            Calendar & Focus Reminders
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Click any date on the calendar grid to schedule, view, edit, or delete custom focus reminders.
          </p>
        </div>

        <button
          onClick={() => openAddModalForDate(selectedDateStr)}
          className="btn-emerald px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Focus Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Monthly Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-neutral-800 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white">
              {monthNames[month]} <span className="text-emerald-400 font-light">{year}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-neutral-400 tracking-wider uppercase mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for first week offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-2xl opacity-20"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              // Check reminders matching this day
              const dayReminders = reminders.filter(r => r.date === dateStr);

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 rounded-2xl p-2.5 glass-panel flex flex-col justify-between transition-all cursor-pointer border relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold ring-2 ring-emerald-500/40 shadow-lg'
                      : isToday
                      ? 'border-emerald-500/60 bg-neutral-800/80 text-white font-bold'
                      : 'border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{dayNum}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>

                  {/* Visual Reminder Badges / Dots on Calendar Grid */}
                  {dayReminders.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {dayReminders.slice(0, 3).map((rem) => (
                        <span
                          key={rem.id}
                          className={`w-2 h-2 rounded-full ${
                            rem.priority === 'high'
                              ? 'bg-red-400 shadow-sm shadow-red-500'
                              : rem.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          title={`${rem.title} (${rem.time})`}
                        />
                      ))}
                      {dayReminders.length > 3 && (
                        <span className="text-[9px] font-bold text-neutral-400">+{dayReminders.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Focus Reminders for Selected Date (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-400" />
                Focus Reminders ({filteredReminders.length})
              </h3>
              <span className="text-xs text-neutral-400 font-medium mt-0.5 block">
                Selected: {selectedDateStr}
              </span>
            </div>
            <button
              onClick={() => openAddModalForDate(selectedDateStr)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 transition-colors"
              title="Add reminder for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* List of Reminders for Selected Date */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-neutral-400 italic">
                  No reminders set for {selectedDateStr}.
                </p>
                <button
                  onClick={() => openAddModalForDate(selectedDateStr)}
                  className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Focus Reminder
                </button>
              </div>
            ) : (
              filteredReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl glass-panel border transition-all flex items-start justify-between gap-3 ${
                    rem.completed
                      ? 'border-neutral-800 opacity-60 bg-neutral-900/50'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/80 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className="mt-0.5 text-emerald-400 hover:scale-110 transition-transform"
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-500" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${rem.completed ? 'line-through text-neutral-400' : 'text-white'}`}>
                        {rem.title}
                      </h4>

                      {rem.notes && (
                        <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                          {rem.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{rem.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          rem.priority === 'high' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                            : rem.priority === 'medium' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {rem.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(rem)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Edit Reminder"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-neutral-700 space-y-6 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-400" />
                {editingReminderId ? 'Edit Focus Reminder' : 'Add Custom Focus Reminder'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Sprint Core Module"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Priority Level</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                >
                  <option value="high" className="bg-neutral-900 text-white">High Priority</option>
                  <option value="medium" className="bg-neutral-900 text-white">Medium Priority</option>
                  <option value="low" className="bg-neutral-900 text-white">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Notes / Subtasks (Optional)</label>
                <textarea
                  placeholder="Additional details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs resize-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                >
                  {editingReminderId ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
