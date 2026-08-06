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
  BellRing
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const CalendarView = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reminder modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newPriority, setNewPriority] = useState('medium');

  // Calendar calculations
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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addReminder(newTitle, newTime, newPriority);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-emerald-400" />
            Calendar & Focus Schedule
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organize deep work sessions, deadlines, and daily reminders with minimal clarity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-emerald px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Monthly Calendar View (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-neutral-800 space-y-6">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white">
              {monthNames[month]} <span className="text-emerald-400 font-light">{year}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl glass-panel hover:bg-neutral-800 text-neutral-300 transition-colors"
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
              <div key={`empty-${i}`} className="h-14 rounded-xl opacity-20"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div
                  key={dayNum}
                  className={`h-14 rounded-xl p-2 glass-panel flex flex-col justify-between transition-all border ${
                    isToday
                      ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-md'
                      : 'border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span className="text-xs">{dayNum}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 self-center animate-ping"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Today's Tasks & Reminders (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-emerald-400" />
              Focus Reminders ({reminders.length})
            </h3>
            <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              Today
            </span>
          </div>

          {/* List of Reminders */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {reminders.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-6 text-center">
                No active reminders for today. Click "Add Reminder" to create one.
              </p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => toggleReminder(rem.id)}
                  className={`p-4 rounded-xl glass-panel border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    rem.completed
                      ? 'border-neutral-800 opacity-50 line-through'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-emerald-400">
                      {rem.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-500" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {rem.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{rem.time}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          rem.priority === 'high' ? 'bg-red-500/20 text-red-300' : rem.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {rem.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReminder(rem.id);
                    }}
                    className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-neutral-800 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Add Focus Reminder
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Reminder Task</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish API Integration Sprint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                  >
                    <option value="high" className="bg-neutral-900 text-white">High</option>
                    <option value="medium" className="bg-neutral-900 text-white">Medium</option>
                    <option value="low" className="bg-neutral-900 text-white">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald px-5 py-2 rounded-xl text-xs font-semibold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
