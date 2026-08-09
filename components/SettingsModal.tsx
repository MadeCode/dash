'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Settings, X, ShieldCheck, Cloud, LogOut, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function SettingsModal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 p-2 text-stone-400 hover:text-stone-600 transition-colors z-50 rounded-xl hover:bg-stone-200/50"
        title="Dashboard Settings & Account"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-200 rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 select-none">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-stone-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              MiniDash Settings
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Manage your connected Google session &amp; display options.
            </p>

            <div className="space-y-5 text-left">
              {/* Connected Account & Sign Out */}
              {session && (
                <div className="bg-stone-100/70 border border-stone-200 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Connected Google Account</div>
                      <div className="text-xs font-medium text-stone-800 truncate">{session.user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}

              {/* Weather Location (Fixed to Brussels) */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-stone-500" />
                  Weather Location
                </label>
                <input
                  type="text"
                  value="Brussels"
                  disabled
                  readOnly
                  className="w-full text-xs md:text-sm px-3 py-2 bg-stone-200/60 border border-stone-300 rounded-xl text-stone-500 cursor-not-allowed font-medium select-none"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Default location set to Brussels, Belgium.
                </p>
              </div>

              {/* Footer Policy / Terms */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-200/80 mt-4">
                <div className="text-[10px] text-stone-400 flex gap-2">
                  <Link href="/policy" onClick={() => setIsOpen(false)} className="hover:text-stone-700 underline">Privacy Policy</Link>
                  <span>•</span>
                  <Link href="/tos" onClick={() => setIsOpen(false)} className="hover:text-stone-700 underline">Terms of Service</Link>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
