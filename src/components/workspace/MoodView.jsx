import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Heart, Sparkles } from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { localDateKey } from '../../utils/focusData';

const DAY_MS = 86_400_000;

const dateBeforeToday = (offset) => localDateKey(Date.now() - (offset * DAY_MS));

export const MoodView = () => {
  const { moodEntries, moodOptions, recordMood } = useApp();
  const today = localDateKey();
  const moodsByDate = useMemo(() => new Map(moodEntries.map((entry) => [entry.date, entry])), [moodEntries]);
  const todayEntry = moodsByDate.get(today);
  const [selectedMood, setSelectedMood] = useState(todayEntry?.mood || 'good');
  const [note, setNote] = useState(todayEntry?.note || '');

  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = dateBeforeToday(6 - index);
    return { date, entry: moodsByDate.get(date) };
  }), [moodsByDate]);
  const weeklyEntries = week.map(({ entry }) => entry).filter(Boolean);
  const weeklyAverage = weeklyEntries.length
    ? (weeklyEntries.reduce((sum, entry) => sum + (moodOptions.find((option) => option.id === entry.mood)?.score || 0), 0) / weeklyEntries.length).toFixed(1)
    : null;
  const todayOption = moodOptions.find((option) => option.id === todayEntry?.mood);
  const recentEntries = [...moodEntries].slice(-5).reverse();

  const submitCheckIn = (event) => {
    event.preventDefault();
    recordMood(selectedMood, note);
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-400">Daily reflection</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Mood tracker</h1>
        <p className="mt-1 text-sm text-neutral-400">A private place to notice how you’re doing, one day at a time.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="glass-panel rounded-3xl border border-neutral-800 p-5 shadow-xl sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10"><Heart className="h-5 w-5 text-emerald-300" /></div>
            <div><h2 className="font-bold text-white">How are you feeling today?</h2><p className="mt-1 text-xs text-neutral-400">You can update today’s check-in whenever your day changes.</p></div>
          </div>

          <form onSubmit={submitCheckIn} className="mt-6">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {moodOptions.map((option) => {
                const active = selectedMood === option.id;
                return <button key={option.id} type="button" onClick={() => setSelectedMood(option.id)} aria-pressed={active} className={`rounded-2xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${active ? 'border-emerald-400/60 bg-emerald-400/10 shadow-lg shadow-emerald-500/10' : 'border-neutral-800 bg-black/10 hover:border-neutral-600 hover:bg-white/[.035]'}`}><span className="block text-2xl">{option.emoji}</span><span className="mt-2 block text-sm font-bold text-white">{option.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-neutral-400">{option.description}</span></button>;
              })}
            </div>
            <label className="mt-5 block text-sm font-semibold text-neutral-200" htmlFor="mood-note">A small note <span className="font-normal text-neutral-500">(optional)</span></label>
            <textarea id="mood-note" value={note} maxLength={240} onChange={(event) => setNote(event.target.value)} placeholder="What’s influencing how you feel?" className="glass-input mt-2 h-28 w-full resize-none rounded-2xl p-3 text-sm" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-neutral-500">{note.length}/240 characters</p><button type="submit" className="btn-emerald inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"><CheckCircle2 className="h-4 w-4" />{todayEntry ? 'Update today’s check-in' : 'Save today’s check-in'}</button></div>
          </form>
        </section>

        <section className="glass-panel rounded-3xl border border-neutral-800 p-5 sm:p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-400" /><h2 className="font-bold text-white">This week</h2></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-neutral-800 bg-black/15 p-4"><p className="text-xs text-neutral-400">Check-ins</p><p className="mt-1 text-2xl font-bold text-white">{weeklyEntries.length}<span className="text-sm text-neutral-500"> / 7</span></p></div><div className="rounded-2xl border border-neutral-800 bg-black/15 p-4"><p className="text-xs text-neutral-400">Average mood</p><p className="mt-1 text-2xl font-bold text-white">{weeklyAverage || '—'}<span className="text-sm text-neutral-500">{weeklyAverage ? ' / 5' : ''}</span></p></div></div>
          <div className="mt-5 grid grid-cols-7 gap-1.5">{week.map(({ date, entry }) => { const option = entry && moodOptions.find((mood) => mood.id === entry.mood); return <div key={date} title={option ? `${date}: ${option.label}` : `${date}: no check-in`} className="text-center"><div className={`flex aspect-square items-center justify-center rounded-xl border text-lg ${option ? 'border-emerald-400/25 bg-emerald-400/[.08]' : 'border-neutral-800 bg-black/10 text-neutral-600'}`}>{option?.emoji || '·'}</div><span className="mt-1 block text-[10px] text-neutral-500">{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</span></div>; })}</div>
          {todayOption && <p className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[.045] p-3 text-xs leading-5 text-neutral-300">Today, you chose <span className="font-bold text-white">{todayOption.emoji} {todayOption.label}</span>. {todayOption.description}.</p>}
        </section>
      </div>

      <section className="glass-panel rounded-3xl border border-neutral-800 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-400" /><div><h2 className="font-bold text-white">Recent check-ins</h2><p className="mt-0.5 text-xs text-neutral-400">Your mood history stays private to your account.</p></div></div>
        <div className="mt-5 space-y-3">{recentEntries.map((entry) => { const option = moodOptions.find((mood) => mood.id === entry.mood); return <article key={entry.date} className="flex gap-3 rounded-2xl border border-neutral-800 bg-black/10 p-4"><span className="text-2xl" aria-hidden="true">{option?.emoji}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><h3 className="text-sm font-bold text-white">{option?.label}</h3><time className="text-xs text-neutral-500" dateTime={entry.date}>{new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>{entry.note && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">{entry.note}</p>}</div></article>; })}{!recentEntries.length && <div className="rounded-2xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-500">Your check-ins will appear here after you save your first one.</div>}</div>
      </section>
    </div>
  );
};
