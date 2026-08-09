'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ScheduleEvent, EventStatus } from '@/lib/types';
import { INITIAL_SCHEDULE_EVENTS, getAugmentedSchedule } from '@/lib/googleCalendar';

export default function ScheduleList() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE_EVENTS);
  const [nowMins, setNowMins] = useState<number>(0);
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Poll Google Calendar API when authenticated
  const fetchCalendar = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.warn('Failed to poll calendar:', err);
    }
  }, [session]);

  useEffect(() => {
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 5000); // 5-second fast polling
    return () => clearInterval(interval);
  }, [fetchCalendar]);

  // Update system clock minutes every 15 seconds
  useEffect(() => {
    const updateMinutes = () => {
      const d = new Date();
      setNowMins(d.getHours() * 60 + d.getMinutes());
    };
    updateMinutes();
    const interval = setInterval(updateMinutes, 15000);
    return () => clearInterval(interval);
  }, []);

  const scheduleEvents = useMemo(() => {
    return getAugmentedSchedule(events);
  }, [events]);

  // Auto-scroll active event into center view
  useEffect(() => {
    if (activeRef.current) {
      const timer = setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nowMins, scheduleEvents]);

  const getEventStatus = (event: ScheduleEvent): EventStatus => {
    if (event.start === 'All day') return 'current';
    const [startH, startM] = event.start.split(':').map(Number);
    const [endH, endM] = event.end.split(':').map(Number);
    const startMins = startH * 60 + (startM || 0);
    const endMins = endH * 60 + (endM || 0);

    if (nowMins >= endMins) return 'past';
    if (nowMins >= startMins && nowMins < endMins) return 'current';
    return 'future';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 md:mb-3 shrink-0 flex items-center gap-2">
        Today&apos;s Schedule
        {session && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Live Google Calendar Sync Active" />
        )}
      </h2>

      <div className="space-y-3 md:space-y-4 overflow-y-auto pr-3 pb-8 flex-1 thin-scrollbar scroll-smooth">
        {scheduleEvents.map((evt) => {
          const status = getEventStatus(evt);

          if (status === 'past') {
            return (
              <div
                key={evt.id}
                className="border-l-2 border-stone-300 pl-2 md:pl-3 opacity-60 transition-all"
              >
                <div className="text-[10px] md:text-xs font-medium text-stone-400 mb-0.5 line-through">
                  {evt.start} - {evt.end}
                </div>
                <div className="text-xs md:text-sm font-medium text-stone-400 line-through">
                  {evt.title}
                </div>
              </div>
            );
          }

          if (status === 'current') {
            return (
              <div
                key={evt.id}
                ref={activeRef}
                className="border-l-2 border-emerald-400 pl-2 md:pl-3 relative py-1 transition-all"
              >
                <div className="absolute -left-[5px] top-2.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse-glow" />
                <div className="text-[10px] md:text-xs font-bold text-emerald-600 mb-0.5">
                  {evt.start} - {evt.end}
                </div>
                <div className="text-xs md:text-sm font-semibold text-stone-900">
                  Current: {evt.title}
                </div>
              </div>
            );
          }

          return (
            <div
              key={evt.id}
              className="border-l-2 border-stone-300 pl-2 md:pl-3 transition-all"
            >
              <div className="text-[10px] md:text-xs font-medium text-stone-500 mb-0.5">
                {evt.start} - {evt.end}
              </div>
              <div className="text-xs md:text-sm font-medium text-stone-800">
                {evt.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
