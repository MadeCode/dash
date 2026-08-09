'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, LayoutDashboard, Sparkles, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';
import TaskList from '@/components/TaskList';
import HeaderClockWeather from '@/components/HeaderClockWeather';
import ScheduleList from '@/components/ScheduleList';
import FullscreenButton from '@/components/FullscreenButton';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const { data: session, status } = useSession();

  // Loading Skeleton
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-50 text-stone-400">
        <div className="flex items-center gap-3 animate-pulse text-sm font-medium">
          <LayoutDashboard className="w-5 h-5 text-stone-500" />
          Loading Mini Desk Dashboard...
        </div>
      </div>
    );
  }

  // Unauthenticated Landing Page
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-stone-50 text-stone-800 p-6 relative overflow-hidden select-none">
        {/* Background glow accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white/80 backdrop-blur-md border border-stone-200 rounded-3xl p-8 shadow-xl text-center relative z-10">
          <div className="w-12 h-12 bg-stone-900 text-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-stone-900/10">
            <LayoutDashboard className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-light tracking-tight text-stone-900 mb-2">
            Mini Desk Dashboard
          </h1>
          <p className="text-xs text-stone-500 mb-8 leading-relaxed">
            Distraction-free productivity companion for landscape smartphone & tablet displays. Syncs live with your Google Tasks and Google Calendar.
          </p>

          <div className="space-y-3 mb-8 text-left text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Auto-creates & syncs <strong>dash-list</strong> Google Tasklist</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Auto-scrolls today&apos;s active meeting schedule</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>5-second background sync for desk displays</span>
            </div>
          </div>

          <button
            onClick={() => signIn('google')}
            className="w-full py-3.5 px-5 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-sm group cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-stone-400 group-hover:text-stone-200 transition-colors" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-8 text-[11px] text-stone-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>Read-only Calendar access &amp; Tasks integration</span>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard View
  return (
    <main className="flex w-full h-full p-6 md:p-8 gap-6 md:gap-8 max-w-5xl mx-auto relative select-none">
      {/* Settings & Fullscreen Controls */}
      <SettingsModal />
      <FullscreenButton />

      {/* User Session Pill */}
      <div className="absolute top-3 left-4 z-40 flex items-center gap-2">
        <div className="bg-stone-200/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-medium text-stone-600 flex items-center gap-1.5 border border-stone-300/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[140px]">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="hover:text-stone-900 ml-1 p-0.5 rounded hover:bg-stone-300/50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3 h-3 text-stone-400 hover:text-stone-700" />
          </button>
        </div>
      </div>

      {/* Left Column: Tasks (55%) */}
      <TaskList />

      {/* Right Column: Dashboard Data (45%) */}
      <div className="flex flex-col h-full w-[45%] border-l border-stone-200 pl-6 md:pl-8 py-2 overflow-hidden">
        {/* Top Row: Time & Date + Weather */}
        <HeaderClockWeather />

        {/* Bottom Row: Today's Schedule */}
        <ScheduleList />
      </div>
    </main>
  );
}
