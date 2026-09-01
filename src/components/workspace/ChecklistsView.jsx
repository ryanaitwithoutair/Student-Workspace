import React, { useState } from 'react';
import { Calendar, CheckCircle2, CheckSquare, Circle, Plus, Trash2 } from '../common/Icons';
import { useApp } from '../../context/AppContext';

const TaskComposer = ({ listId, selectedDate, addChecklistTask }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);

  const submitTask = (event) => {
    event.preventDefault();
    addChecklistTask(listId, title, date);
    setTitle('');
  };

  return (
    <form onSubmit={submitTask} className="mt-7 grid gap-2 sm:grid-cols-[1fr_160px_auto]">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="glass-input min-w-0 px-4 py-3 rounded-xl text-sm" placeholder="Add a task and press Enter" />
      <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="glass-input px-3 py-3 rounded-xl text-sm" aria-label="Task date" />
      <button type="submit" className="btn-emerald px-4 py-3 rounded-xl text-sm font-bold">Add task</button>
    </form>
  );
};

export const ChecklistsView = () => {
  const { checklists, addChecklist, deleteChecklist, addChecklistTask, updateChecklistTask, deleteChecklistTask, selectedDate, setSelectedDate } = useApp();
  const [activeId, setActiveId] = useState(checklists[0]?.id);
  const [listName, setListName] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const active = checklists.find((list) => list.id === activeId) || checklists[0];
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const scheduledTasks = active?.tasks.filter((task) => task.date === selectedDate) || [];
  const visibleTasks = showAllTasks ? active?.tasks || [] : scheduledTasks;
  const done = scheduledTasks.filter((task) => task.completed).length;
  const unscheduledCount = active?.tasks.filter((task) => !task.date).length || 0;

  const submitList = (event) => {
    event.preventDefault();
    if (!listName.trim()) return;
    addChecklist(listName);
    setListName('');
  };

  return (
    <div className="grid gap-6 animate-fadeIn lg:grid-cols-[230px_1fr]">
      <aside className="glass-panel h-fit rounded-3xl border border-neutral-800 p-4">
        <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Checklists</p>
        <div className="mt-3 space-y-1">{checklists.map((list) => <button type="button" onClick={() => setActiveId(list.id)} key={list.id} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm ${active?.id === list.id ? 'bg-emerald-500 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>{list.name}</button>)}</div>
        <form onSubmit={submitList} className="mt-4 flex gap-2"><input value={listName} onChange={(event) => setListName(event.target.value)} placeholder="New list" className="glass-input min-w-0 flex-1 px-2 py-2 rounded-lg text-xs" /><button type="submit" className="btn-emerald rounded-lg p-2" aria-label="Create checklist"><Plus className="w-4 h-4" /></button></form>
      </aside>

      {active && <section className="glass-panel rounded-3xl border border-neutral-800 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-emerald-400" /><h1 className="text-2xl font-bold text-white">{active.name}</h1></div><p className="mt-2 text-sm text-neutral-400">{done} / {scheduledTasks.length} completed for the selected date</p></div>
          <button type="button" onClick={() => { if (checklists.length > 1) { const next = checklists.find((list) => list.id !== active.id); deleteChecklist(active.id); setActiveId(next?.id); } }} className="p-2 text-neutral-500 hover:text-red-400" aria-label="Delete checklist" disabled={checklists.length <= 1}><Trash2 className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-400" /><span className="text-sm font-semibold text-white">{selectedDateLabel}</span></div><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="glass-input rounded-lg px-2 py-1.5 text-xs" aria-label="Selected workspace date" /></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${scheduledTasks.length ? (done / scheduledTasks.length) * 100 : 0}%` }} /></div>

        <TaskComposer key={`${active.id}-${selectedDate}`} listId={active.id} selectedDate={selectedDate} addChecklistTask={addChecklistTask} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button type="button" onClick={() => setShowAllTasks(false)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!showAllTasks ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}>Selected date ({scheduledTasks.length})</button><button type="button" onClick={() => setShowAllTasks(true)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${showAllTasks ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}>All tasks ({active.tasks.length})</button></div>{unscheduledCount > 0 && <span className="text-xs text-neutral-500">{unscheduledCount} task{unscheduledCount === 1 ? '' : 's'} need a date.</span>}</div>

        <div className="mt-5 space-y-2">{visibleTasks.length ? visibleTasks.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3"><button type="button" onClick={() => updateChecklistTask(active.id, item.id, { completed: !item.completed })}>{item.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-neutral-500" />}</button><input value={item.title} onChange={(event) => updateChecklistTask(active.id, item.id, { title: event.target.value })} className={`min-w-40 flex-1 bg-transparent text-sm outline-none ${item.completed ? 'text-neutral-500 line-through' : 'text-white'}`} aria-label="Task title" /><input type="date" value={item.date || ''} onChange={(event) => updateChecklistTask(active.id, item.id, { date: event.target.value })} className="glass-input rounded-lg px-2 py-1.5 text-xs" aria-label="Task date" /><button type="button" onClick={() => deleteChecklistTask(active.id, item.id)} className="text-neutral-500 hover:text-red-400" aria-label="Delete task"><Trash2 className="h-4 w-4" /></button></div>) : <p className="py-8 text-center text-sm text-neutral-500">{showAllTasks ? 'Add the first task for this list.' : 'No tasks are scheduled for this date yet.'}</p>}</div>
      </section>}
    </div>
  );
};
