import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-stone-900">
            Terms of Service
          </h1>
        </div>

        <div className="space-y-6 text-xs md:text-sm text-stone-600 leading-relaxed font-sans border-t border-stone-200 pt-6">
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MiniDash (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">2. Description of Service</h2>
            <p>
              MiniDash provides a minimalist, mobile-first productivity dashboard designed for landscape desk displays, integrating live calendar scheduling and task focus management via official APIs.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your Google account credentials and for all activities that occur under your account session.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-2">4. Disclaimer & Limitations</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. MiniDash shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the Service.
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
