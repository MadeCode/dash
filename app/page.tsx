'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, LayoutDashboard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import HeaderClockWeather from '@/components/HeaderClockWeather';
import ScheduleList from '@/components/ScheduleList';
import FullscreenButton from '@/components/FullscreenButton';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const { data: session, status } = useSession();

  // Loading Card State (Shows MiniDash card + spinner instead of full screen blank text)
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-stone-50 text-stone-800 p-6 relative overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-sm w-full bg-white/80 backdrop-blur-md border border-stone-200 rounded-3xl p-8 shadow-xl text-center relative z-10">
          <div className="w-12 h-12 bg-stone-900 text-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-stone-900/10">
            <LayoutDashboard className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-normal tracking-tight text-stone-900 mb-2">
            MiniDash
          </h1>
          <p className="text-xs text-stone-500 mb-8 leading-relaxed">
            MiniDash is a distraction-free dashboard for your focus tasks and today's Google Calendar schedule.
          </p>

          <div className="w-full py-3.5 px-5 bg-stone-100 text-stone-600 font-medium rounded-2xl flex items-center justify-center gap-3 text-sm border border-stone-200">
            <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            <span>Checking authentication...</span>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-stone-400 flex items-center justify-center gap-3 relative z-10">
          <Link href="/oauth-info" className="hover:text-stone-700 transition-colors">About MiniDash</Link>
          <span>•</span>
          <Link href="/policy" className="hover:text-stone-700 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/tos" className="hover:text-stone-700 transition-colors">Terms of Service</Link>
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

        <div className="max-w-sm w-full bg-white/80 backdrop-blur-md border border-stone-200 rounded-3xl p-8 shadow-xl text-center relative z-10">
          <div className="w-12 h-12 bg-stone-900 text-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-stone-900/10">
            <LayoutDashboard className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-normal tracking-tight text-stone-900 mb-2">
            MiniDash
          </h1>
          <p className="text-xs text-stone-500 mb-8 leading-relaxed">
            MiniDash is a distraction-free dashboard for your focus tasks and today's Google Calendar schedule.
          </p>

          <button
            onClick={() => signIn('google')}
            className="w-full py-3.5 px-5 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-sm group cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-stone-400 group-hover:text-stone-200 transition-colors" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-6 text-[11px] text-stone-400 flex items-center justify-center gap-3 relative z-10">
          <Link href="/oauth-info" className="hover:text-stone-700 transition-colors">About MiniDash</Link>
          <span>•</span>
          <Link href="/policy" className="hover:text-stone-700 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/tos" className="hover:text-stone-700 transition-colors">Terms of Service</Link>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard View (Clean & Distraction Free)
  return (
    <main className="flex w-full h-full p-6 md:p-8 gap-6 md:gap-8 max-w-5xl mx-auto relative select-none">
      {/* Settings & Fullscreen Controls */}
      <SettingsModal />
      <FullscreenButton />

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
