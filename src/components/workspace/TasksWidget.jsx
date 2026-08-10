import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  X,
  Sparkles
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { DraggableResizable } from '../common/DraggableResizable';
import { useWidgetTranslucency } from '../../hooks/useWidgetTranslucency';

export const TasksWidget = () => {
  const { 
    reminders, 
    addReminder, 
    toggleReminder, 
    deleteReminder, 
    toggleTasksWidget,
  } = useApp();

  const { widgetBgStyle } = useWidgetTranslucency();

  const [filter, setFilter] = useState('pending');
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState('high');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addReminder(taskTitle.trim(), '10:00 AM', priority);
    setTaskTitle('');
  };

  const filteredTasks = reminders.filter(r => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const pendingCount = reminders.filter(r => !r.completed).length;

  const getPriorityTag = (p) => {
    switch (p) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <DraggableResizable
      storageKey="floating_tasks_v1"
      defaultSize={380}
      resizable={false}
      defaultPosition={{ x: 30, y: 220 }}
      className="fixed z-40 animate-pop-spring"
    >
      {() => (
        <div 
          style={widgetBgStyle}
          className="rounded-3xl p-5 border border-emerald-500/40 shadow-2xl relative transition-all duration-500 hover:border-emerald-400 space-y-4 shadow-emerald-500/10"
        >
          {/* Luminous Glow Halo */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between no-drag pb-2 border-b border-neutral-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckSquare className="w-4 h-4" />
              <span className="text-white">Focus Tasks</span>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {pendingCount} Left
              </span>
            </div>

            <button
              onClick={toggleTasksWidget}
              className="p-1 rounded-lg bg-neutral-800/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors backdrop-blur-md"
              title="Close Tasks Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inline Quick Add Task Form */}
          <form onSubmit={handleCreateTask} className="no-drag flex items-center gap-2">
            <input
              type="text"
              placeholder="Add focus task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs flex-1"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="glass-input rounded-xl px-2 py-1.5 text-[10px] uppercase font-bold text-neutral-300"
            >
              <option value="high" className="bg-neutral-900 text-red-400">High</option>
              <option value="medium" className="bg-neutral-900 text-amber-400">Med</option>
              <option value="low" className="bg-neutral-900 text-emerald-400">Low</option>
            </select>
            <button
              type="submit"
              className="btn-emerald p-2 rounded-xl text-xs shadow-md"
              title="Add Task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Filter Tabs */}
          <div className="no-drag flex items-center gap-1.5 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/80">
            {['pending', 'all', 'completed'].map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`flex-1 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                  filter === tabKey
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tabKey}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="no-drag max-h-56 overflow-y-auto space-y-2 pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-neutral-400 space-y-1">
                <Sparkles className="w-6 h-6 mx-auto text-emerald-400/60" />
                <p className="text-xs font-medium">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleReminder(task.id)}
                      className="text-neutral-400 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span className={`text-xs font-medium truncate ${
                      task.completed ? 'line-through text-neutral-500' : 'text-white'
                    }`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${getPriorityTag(task.priority)}`}>
                      {task.priority || 'med'}
                    </span>
                    <button
                      onClick={() => deleteReminder(task.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DraggableResizable>
  );
};
