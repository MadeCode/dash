'use client';

import React, { useState } from 'react';
import { Settings, X, CheckCircle2, ShieldCheck, Cloud, Calendar } from 'lucide-react';

import Link from 'next/link';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState('London');
  const [googleClientId, setGoogleClientId] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 p-2 text-stone-400 hover:text-stone-600 transition-colors z-50 rounded-xl hover:bg-stone-200/50"
        title="Dashboard Settings & API Connections"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Dashboard Settings
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Configure live API integrations or run in standalone mode.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              {/* City Location */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-stone-500" />
                  Weather Location (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London, New York, Tokyo"
                  className="w-full text-xs md:text-sm px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
                />
              </div>

              {/* Google Client ID */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  Google OAuth Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="your-client-id.apps.googleusercontent.com"
                  className="w-full text-xs md:text-sm px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 font-mono text-[11px]"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Required for live Google Tasks & Calendar sync. Leave blank to run in smart demo mode.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-200/80 mt-4">
                <div className="text-[10px] text-stone-400 flex gap-2">
                  <Link href="/policy" onClick={() => setIsOpen(false)} className="hover:text-stone-700 underline">Privacy Policy</Link>
                  <span>•</span>
                  <Link href="/tos" onClick={() => setIsOpen(false)} className="hover:text-stone-700 underline">Terms</Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Saved!
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
