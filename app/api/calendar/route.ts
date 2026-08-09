import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    const url = `${GOOGLE_CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(
      startOfDay
    )}&timeMax=${encodeURIComponent(
      endOfDay
    )}&singleEvents=true&orderBy=startTime`;

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

      const formatTime = (d: Date | null) =>
        d
          ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          : 'All day';

      return {
        id: evt.id,
        title: evt.summary || 'Untitled Event',
        start: formatTime(startDateTime),
        end: formatTime(endDateTime),
      };
    });

    return NextResponse.json({ events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
