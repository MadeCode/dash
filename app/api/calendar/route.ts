import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const BRUSSELS_TIME_ZONE = 'Europe/Brussels';

function getBrusselsDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: BRUSSELS_TIME_ZONE,
    year: 'numeric',
  }).formatToParts(date);

  return {
    day: parts.find((part) => part.type === 'day')?.value ?? '01',
    month: parts.find((part) => part.type === 'month')?.value ?? '01',
    year: parts.find((part) => part.type === 'year')?.value ?? '1970',
  };
}

function getBrusselsOffsetMinutes(date: Date) {
  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone: BRUSSELS_TIME_ZONE,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = timeZoneName?.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

function brusselsWallTimeToUtcIso(year: string, month: string, day: string, hours: number, minutes: number, seconds: number) {
  const utcGuess = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), hours, minutes, seconds));
  const offsetMinutes = getBrusselsOffsetMinutes(utcGuess);

  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000).toISOString();
}

function formatInBrussels(date: Date | null) {
  if (!date) return 'All day';

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: BRUSSELS_TIME_ZONE,
  }).format(date);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const { year, month, day } = getBrusselsDateParts(now);
    const startOfDay = brusselsWallTimeToUtcIso(year, month, day, 0, 0, 0);
    const endOfDay = brusselsWallTimeToUtcIso(year, month, day, 23, 59, 59);

    const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(
      startOfDay
    )}&timeMax=${encodeURIComponent(
      endOfDay
    )}&timeZone=${encodeURIComponent(BRUSSELS_TIME_ZONE)}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Calendar API Error: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    const events = items.map((evt: { id: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }) => {
      const startDateTime = evt.start?.dateTime ? new Date(evt.start.dateTime) : null;
      const endDateTime = evt.end?.dateTime ? new Date(evt.end.dateTime) : null;

      return {
        id: evt.id,
        title: evt.summary || 'Untitled Event',
        start: formatInBrussels(startDateTime),
        end: formatInBrussels(endDateTime),
      };
    });

    return NextResponse.json({ events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
