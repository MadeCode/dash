import React from 'react';
import Link from 'next/link';

export default function OAuthInfoPage() {
  return (
    <main className="min-h-screen w-full bg-white text-stone-900 p-6 md:p-12">
      <article className="mx-auto max-w-2xl space-y-6 text-base leading-7">
        <header className="space-y-2 border-b border-stone-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">App information</p>
          <h1 className="text-3xl font-semibold tracking-tight">MiniDash</h1>
        </header>

        <section className="space-y-4">
          <p>
            MiniDash is a distraction-free personal dashboard that helps signed-in users view their
            current focus tasks, today&apos;s Google Calendar schedule, local time, and weather in one
            minimal workspace.
          </p>
          <p>
            MiniDash uses Google OAuth so users can securely connect their own Google account. The
            app reads Google Calendar events to display the day&apos;s schedule and uses Google Tasks to
            show and manage tasks in the dedicated MiniDash task list.
          </p>
        </section>

        <section className="space-y-2 border-t border-stone-200 pt-6">
          <h2 className="text-xl font-semibold">Privacy</h2>
          <p>
            You can review how MiniDash handles Google user data in the{' '}
            <Link href="/policy" className="font-medium text-stone-900 underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
