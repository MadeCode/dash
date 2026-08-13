'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ScheduleEvent, EventStatus } from '@/lib/types';
import { INITIAL_SCHEDULE_EVENTS } from '@/lib/googleCalendar';

const BRUSSELS_TIME_ZONE = 'Europe/Brussels';
const UPCOMING_MEETING_ALERT_MINUTES = new Set([10, 5, 2]);
const MEETING_ALERT_PULSE_DURATION_MS = 3600;

function getBrusselsDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BRUSSELS_TIME_ZONE }));
}

function timeToMinutes(timeStr: string): number {
  if (timeStr === 'All day') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatScheduleTime(timeStr: string): string {
  if (timeStr === 'All day') return timeStr;

  const [hours, minutes = '0'] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function getOptionalClassNames(event: ScheduleEvent, status: EventStatus) {
  if (!event.isOptional) return { border: '', time: '', title: '', background: '', badge: null as React.ReactNode };

  if (status === 'current') {
    return {
      border: 'border-sky-400',
      time: 'text-sky-600',
      title: 'text-sky-950',
      background: 'bg-sky-50/70 rounded-r-[3px]',
      badge: <span className="ml-2 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-700">Optional</span>,
    };
  }

  return {
    border: 'border-sky-300',
    time: 'text-sky-500',
    title: 'text-sky-700',
    background: 'bg-sky-50/40 rounded-r-[3px]',
    badge: <span className="ml-2 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-700">Optional</span>,
  };
}

function formatScheduleRange(event: ScheduleEvent): string {
  if (event.start === 'All day' || event.end === 'All day') return 'All day';

  return `${formatScheduleTime(event.start)} - ${formatScheduleTime(event.end)}`;
}

/**
 * Builds a smart continuous schedule timeline inserting "Nothing planned" gaps
 * before the first event, between events, and after the last event.
 */
function buildSmartTimeline(events: ScheduleEvent[]): ScheduleEvent[] {
  if (!events || events.length === 0) {
    const d = getBrusselsDate();
    const currentH = String(d.getHours()).padStart(2, '0');
    const nextH = String((d.getHours() + 1) % 24).padStart(2, '0');
    return [
      { id: 'empty-current', start: `${currentH}:00`, end: `${nextH}:00`, title: 'Nothing planned' },
    ];
  }

  // Sort events chronologically
  const sorted = [...events].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const timeline: ScheduleEvent[] = [];

  const dayStartMins = 8 * 60; // 08:00 AM start
  const firstStartMins = timeToMinutes(sorted[0].start);

  // 1. Gap before first event
  if (firstStartMins > dayStartMins) {
    const endH = String(Math.floor(firstStartMins / 60)).padStart(2, '0');
    const endM = String(firstStartMins % 60).padStart(2, '0');
    timeline.push({
      id: 'gap-start',
      start: '08:00',
      end: `${endH}:${endM}`,
      title: 'Nothing planned',
    });
  }

  // 2. Interleave events and gaps
  for (let i = 0; i < sorted.length; i++) {
    const currentEvt = sorted[i];
    timeline.push(currentEvt);

    if (i < sorted.length - 1) {
      const nextEvt = sorted[i + 1];
      const currentEndMins = timeToMinutes(currentEvt.end);
      const nextStartMins = timeToMinutes(nextEvt.start);

      // Insert gap if there is more than 15 minutes between events
      if (nextStartMins - currentEndMins >= 15) {
        timeline.push({
          id: `gap-${i}`,
          start: currentEvt.end,
          end: nextEvt.start,
          title: 'Nothing planned',
        });
      }
    }
  }

  // 3. Gap after last event
  const lastEvt = sorted[sorted.length - 1];
  const lastEndMins = timeToMinutes(lastEvt.end);
  const dayEndMins = 21 * 60; // 21:00 PM

  if (lastEndMins < dayEndMins) {
    timeline.push({
      id: 'gap-end',
      start: lastEvt.end,
      end: '21:00',
      title: 'Nothing planned',
    });
  }

  return timeline;
}

export default function ScheduleList() {
  const { data: session } = useSession();
  const [rawEvents, setRawEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE_EVENTS);
  const [nowMins, setNowMins] = useState<number>(0);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const alertedMeetingKeysRef = useRef<Set<string>>(new Set());
  const [isMeetingAlertPulsing, setIsMeetingAlertPulsing] = useState(false);

  // Poll Google Calendar API when authenticated
  const fetchCalendar = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setRawEvents(data.events);
        }
      }
    } catch (err) {
      console.warn('Failed to poll calendar:', err);
    }
  }, [session]);

  useEffect(() => {
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 5000); // 5-second polling
    return () => clearInterval(interval);
  }, [fetchCalendar]);

  // Update system clock minutes every 15 seconds
  useEffect(() => {
    const updateMinutes = () => {
      const d = getBrusselsDate();
      setNowMins(d.getHours() * 60 + d.getMinutes());
    };
    updateMinutes();
    const interval = setInterval(updateMinutes, 15000);
    return () => clearInterval(interval);
  }, []);

  const timelineEvents = useMemo(() => {
    return buildSmartTimeline(rawEvents);
  }, [rawEvents]);

  // Auto-scroll active event into center view
  useEffect(() => {
    if (activeRef.current) {
      const timer = setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nowMins, timelineEvents]);

  useEffect(() => {
    const upcomingMeeting = rawEvents.find((event) => {
      if (event.title === 'Nothing planned' || event.start === 'All day') return false;

      return UPCOMING_MEETING_ALERT_MINUTES.has(timeToMinutes(event.start) - nowMins);
    });

    if (!upcomingMeeting) return;

    const minutesUntilMeeting = timeToMinutes(upcomingMeeting.start) - nowMins;
    const alertKey = `${upcomingMeeting.id}-${formatScheduleTime(upcomingMeeting.start)}-${minutesUntilMeeting}`;

    if (alertedMeetingKeysRef.current.has(alertKey)) return;

    alertedMeetingKeysRef.current.add(alertKey);
    setIsMeetingAlertPulsing(false);

    const startTimer = setTimeout(() => setIsMeetingAlertPulsing(true), 0);
    const stopTimer = setTimeout(() => setIsMeetingAlertPulsing(false), MEETING_ALERT_PULSE_DURATION_MS);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, [nowMins, rawEvents]);

  const getEventStatus = (event: ScheduleEvent): EventStatus => {
    if (event.start === 'All day') return 'current';
    const startMins = timeToMinutes(event.start);
    const endMins = timeToMinutes(event.end);

    if (nowMins >= endMins) return 'past';
    if (nowMins >= startMins && nowMins < endMins) return 'current';
    return 'future';
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden rounded-[3px] transition-colors ${
        isMeetingAlertPulsing ? 'animate-meeting-alert-pulse' : ''
      }`}
    >
      <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2 md:mb-3 shrink-0 flex items-center gap-2 pl-1 overflow-visible">
        Today&apos;s Schedule
        {session && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Live Google Calendar Sync Active" />
        )}
      </h2>

      <div className="space-y-3 md:space-y-4 overflow-y-auto pr-3 pb-8 flex-1 thin-scrollbar scroll-smooth">
        {timelineEvents.map((evt) => {
          const status = getEventStatus(evt);
          const isGapBlock = evt.title === 'Nothing planned';
          const optionalClasses = getOptionalClassNames(evt, status);

          if (status === 'past') {
            return (
              <div
                key={evt.id}
                className={`border-l-2 pl-2 md:pl-3 opacity-50 transition-all ${
                  optionalClasses.border || 'border-stone-300'
                } ${isGapBlock ? 'italic text-stone-400' : optionalClasses.background}`}
              >
                <div className={`text-[10px] md:text-xs font-medium mb-0.5 line-through ${optionalClasses.time || 'text-stone-400'}`}>
                  {formatScheduleRange(evt)}
                </div>
                <div className={`text-xs md:text-sm font-medium line-through ${optionalClasses.title || 'text-stone-400'}`}>
                  {evt.title}{optionalClasses.badge}
                </div>
              </div>
            );
          }

          if (status === 'current') {
            return (
              <div
                key={evt.id}
                ref={activeRef}
                className={`border-l-2 pl-2 md:pl-3 relative py-1 transition-all ${
                  optionalClasses.border || 'border-emerald-400'
                } ${isGapBlock ? 'bg-stone-100/40 rounded-r-[3px]' : optionalClasses.background}`}
              >
                <div className="absolute -left-[5px] top-2.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse-glow" />
                <div className={`text-[10px] md:text-xs font-bold mb-0.5 ${optionalClasses.time || 'text-emerald-600'}`}>
                  {formatScheduleRange(evt)}
                </div>
                <div className={`text-xs md:text-sm font-semibold ${optionalClasses.title || 'text-stone-900'}`}>
                  Current: {evt.title}{optionalClasses.badge}
                </div>
              </div>
            );
          }

          return (
            <div
              key={evt.id}
              className={`border-l-2 pl-2 md:pl-3 transition-all ${
                optionalClasses.border || 'border-stone-300'
              } ${isGapBlock ? 'text-stone-400 italic' : optionalClasses.background}`}
            >
              <div className={`text-[10px] md:text-xs font-medium mb-0.5 ${optionalClasses.time || 'text-stone-400'}`}>
                {formatScheduleRange(evt)}
              </div>
              <div className={`text-xs md:text-sm font-medium ${optionalClasses.title || 'text-stone-700'}`}>
                {evt.title}{optionalClasses.badge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
