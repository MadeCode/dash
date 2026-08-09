import { ScheduleEvent } from './types';

export const INITIAL_SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: '1', start: '08:00', end: '09:00', title: 'Morning Review' },
  { id: '2', start: '09:30', end: '10:30', title: 'Team Standup' },
  { id: '3', start: '11:00', end: '12:00', title: 'Design Sync' },
  { id: '4', start: '12:30', end: '13:30', title: 'Lunch Break' },
  { id: '5', start: '14:00', end: '15:30', title: 'Deep Work' },
  { id: '6', start: '16:00', end: '17:00', title: 'Client Call' },
  { id: '7', start: '18:00', end: '19:00', title: 'Gym' },
];

/**
 * Ensures there's always an active time block matching current local time
 * for demo testing when no calendar API key is configured.
 */
export function getAugmentedSchedule(events: ScheduleEvent[]): ScheduleEvent[] {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const hasActive = events.some((evt) => {
    const s = parseInt(evt.start.split(':')[0]) * 60 + parseInt(evt.start.split(':')[1]);
    const e = parseInt(evt.end.split(':')[0]) * 60 + parseInt(evt.end.split(':')[1]);
    return currentMins >= s && currentMins < e;
  });

  if (!hasActive) {
    const currentH = String(now.getHours()).padStart(2, '0');
    const nextH = String((now.getHours() + 1) % 24).padStart(2, '0');
    const activeBlock: ScheduleEvent = {
      id: 'live-test',
      start: `${currentH}:00`,
      end: `${nextH}:00`,
      title: 'Live Focus Block',
    };
    return [...events, activeBlock].sort((a, b) => a.start.localeCompare(b.start));
  }

  return [...events].sort((a, b) => a.start.localeCompare(b.start));
}
