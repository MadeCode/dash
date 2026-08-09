import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-800 p-6 md:p-12 flex flex-col justify-between selection:bg-stone-200">
      <div className="max-w-2xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-8 p-2 rounded-xl hover:bg-stone-200/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to MiniDash
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-stone-900 text-stone-50 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-stone-900">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 text-xs md:text-sm text-stone-600 leading-relaxed font-sans border-t border-stone-200 pt-6">
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">1. Overview</h2>
            <p>
              MiniDash is a distraction-free productivity companion. Your privacy is paramount. We do not sell, rent, or share your personal data with any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">2. Google User Data</h2>
            <p>
              MiniDash requests access to your Google Calendar (Read-Only) and Google Tasks (Read/Write for the <code>dash-list</code> tasklist) via Google OAuth 2.0.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-500">
              <li>Calendar data is fetched live to display today&apos;s active timeline block.</li>
              <li>Task data is accessed strictly to manage your focus tasks in the dedicated <code>dash-list</code> list.</li>
              <li>Your Google tokens and data remain securely in your local browser session and are never transmitted to external third-party databases.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">3. Storage & Security</h2>
            <p>
              Authentication state is encrypted using industry-standard JWT session tokens. You can revoke access at any time through your Google Account permissions settings.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">4. Contact</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us via our official repository.
            </p>
          </section>
        </div>
      </div>

      <footer className="max-w-2xl mx-auto w-full pt-12 text-[11px] text-stone-400 border-t border-stone-200 mt-12 flex justify-between items-center">
        <span>© {new Date().getFullYear()} MiniDash</span>
        <div className="flex gap-4">
          <Link href="/policy" className="hover:text-stone-700">Privacy Policy</Link>
          <Link href="/tos" className="hover:text-stone-700 font-medium">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
