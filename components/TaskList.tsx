'use client';

import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { TaskItem } from '@/lib/types';
import { INITIAL_TASKS } from '@/lib/googleTasks';

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleComplete = (id: string) => {
    // Phase 1: Mark for removal animation
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true, isRemoving: true } : t))
    );

    // Phase 2: Remove from state after 300ms transition
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full w-[55%]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Today&apos;s Focus
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-100 flex items-center gap-1 text-xs"
          title="Add quick task"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="mb-3 pr-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Type task and press Enter..."
            autoFocus
            className="w-full text-xs md:text-sm px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 placeholder-stone-400"
          />
        </form>
      )}

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-4 pb-12 no-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-stone-400 text-xs py-8 text-center italic">
            All clear! No pending focus tasks today.
          </div>
        ) : (
          tasks.map((task) => (
            <label
              key={task.id}
              className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-stone-100/80 transition-all cursor-pointer group select-none ${
                task.isRemoving ? 'task-hide' : ''
              }`}
            >
              <div className="relative flex items-center justify-center w-4 h-4 md:w-5 md:h-5 border-2 border-stone-300 rounded-full group-hover:border-stone-500 transition-colors shrink-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleComplete(task.id)}
                  className="peer opacity-0 absolute w-full h-full cursor-pointer"
                />
                <Check
                  className={`w-3 h-3 text-stone-600 pointer-events-none transition-opacity ${
                    task.completed ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              <span
                className={`text-xs md:text-sm text-stone-700 transition-all ${
                  task.completed ? 'text-stone-400 line-through' : ''
                }`}
              >
                {task.title}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
