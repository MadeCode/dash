'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Pencil, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { TaskItem } from '@/lib/types';
import { INITIAL_TASKS } from '@/lib/googleTasks';

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch tasks from API or mock
  const fetchTasks = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.pending || []);
        setCompletedTasks(data.completed || []);
      }
    } catch (err) {
      console.warn('Failed to poll tasks:', err);
    }
  }, [session]);

  // Initial load and 5-second polling loop
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // 5-second fast polling
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // Complete a task in normal mode
  const handleComplete = async (id: string) => {
    // 1. Optimistic removal animation
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true, isRemoving: true } : t))
    );

    setTimeout(async () => {
      const taskToMove = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (taskToMove) {
        setCompletedTasks((prev) => [{ ...taskToMove, completed: true }, ...prev]);
      }

      // API call if authenticated
      if (session) {
        try {
          await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: true }),
          });
        } catch (err) {
          console.error('Failed to complete task via API:', err);
        }
      }
    }, 300);
  };

  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const tempId = Date.now().toString();
    const newTask: TaskItem = { id: tempId, title: newTaskTitle.trim(), completed: false };

    setTasks((prev) => [newTask, ...prev]);
    const titleToAdd = newTaskTitle.trim();
    setNewTaskTitle('');

    if (session) {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleToAdd }),
        });
        if (res.ok) fetchTasks();
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
  };

  // Delete task
  const handleDelete = async (id: string, isCompletedList: boolean = false) => {
    if (isCompletedList) {
      setCompletedTasks((prev) => prev.filter((t) => t.id !== id));
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }

    if (session) {
      try {
        await fetch('/api/tasks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Inline edit task title
  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveTitle = async (id: string) => {
    if (!editingTitle.trim()) return;
    const newTitle = editingTitle.trim();

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
    setEditingTaskId(null);

    if (session) {
      try {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, title: newTitle }),
        });
      } catch (err) {
        console.error('Failed to update task title:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-[55%]">
      {/* Header with Pencil Toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 flex items-center gap-2">
          Today&apos;s Focus
          {session && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Live Google Tasks Sync Active" />
          )}
        </h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            isEditing
              ? 'bg-stone-900 text-stone-50'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
          title={isEditing ? 'Done Editing' : 'Edit Tasks'}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
        </button>
      </div>

      {/* Quick Add Form in Edit Mode or Optional */}
      {isEditing && (
        <form onSubmit={handleAddTask} className="mb-3 pr-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add new task to dash-list..."
              className="flex-1 text-xs md:text-sm px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 placeholder-stone-400"
            />
            <button
              type="submit"
              className="p-2 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-4 pb-12 no-scrollbar">
        {/* Active / Pending Tasks */}
        {tasks.length === 0 ? (
          <div className="text-stone-400 text-xs py-6 text-center italic">
            No active focus tasks. Add one or sync with Google Tasks!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-stone-100/80 transition-all select-none ${
                task.isRemoving ? 'task-hide' : ''
              }`}
            >
              {isEditing ? (
                /* Edit Mode: Delete Trashcan Button */
                <button
                  onClick={() => handleDelete(task.id, false)}
                  className="p-1 text-stone-400 hover:text-red-600 transition-colors shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                /* Normal Mode: Checkbox */
                <label className="relative flex items-center justify-center w-4 h-4 md:w-5 md:h-5 border-2 border-stone-300 rounded-full group-hover:border-stone-500 transition-colors cursor-pointer shrink-0">
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
                </label>
              )}

              {/* Title Text or Inline Input */}
              {isEditing && editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveTitle(task.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(task.id)}
                  autoFocus
                  className="flex-1 text-xs md:text-sm px-2 py-1 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                />
              ) : (
                <span
                  onClick={() => isEditing && handleStartEdit(task)}
                  className={`text-xs md:text-sm text-stone-700 transition-all flex-1 ${
                    isEditing ? 'cursor-pointer hover:text-stone-900 font-medium' : ''
                  }`}
                >
                  {task.title}
                </span>
              )}
            </div>
          ))
        )}

        {/* Completed Tasks List (Shown in Edit Mode or Collapsible) */}
        {isEditing && completedTasks.length > 0 && (
          <div className="pt-4 border-t border-stone-200 mt-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-stone-400" />
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-1.5">
              {completedTasks.map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-stone-100/50 text-stone-400"
                >
                  <button
                    onClick={() => handleDelete(ct.id, true)}
                    className="p-1 text-stone-400 hover:text-red-600 transition-colors shrink-0"
                    title="Delete completed task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs line-through flex-1">{ct.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
