import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const GOOGLE_TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

async function getDashListId(accessToken: string): Promise<string> {
  // 1. List user tasklists
  const res = await fetch(`${GOOGLE_TASKS_API}/users/@me/lists`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tasklists: ${res.statusText}`);
  }

  const data = await res.json();
  const lists = data.items || [];
  const existingList = lists.find((l: { title: string }) => l.title === 'dash-list');

  if (existingList) {
    return existingList.id;
  }

  // 2. Create 'dash-list' tasklist if missing
  const createRes = await fetch(`${GOOGLE_TASKS_API}/users/@me/lists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'dash-list' }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create dash-list: ${createRes.statusText}`);
  }

  const newList = await createRes.json();

  // 3. Seed with initial dummy task
  await fetch(`${GOOGLE_TASKS_API}/lists/${newList.id}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Check this task to confirm integration' }),
  });

  return newList.id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listId = await getDashListId(session.accessToken);
    const res = await fetch(
      `${GOOGLE_TASKS_API}/lists/${listId}/tasks?showCompleted=true&showHidden=true`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }

    const data = await res.json();
    const rawItems = data.items || [];

    const pending = rawItems
      .filter((t: { status?: string }) => t.status !== 'completed')
      .map((t: { id: string; title?: string }) => ({
        id: t.id,
        title: t.title || 'Untitled Task',
        completed: false,
      }));

    const completed = rawItems
      .filter((t: { status?: string }) => t.status === 'completed')
      .map((t: { id: string; title?: string }) => ({
        id: t.id,
        title: t.title || 'Untitled Task',
        completed: true,
      }));

    return NextResponse.json({ pending, completed, listId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const listId = await getDashListId(session.accessToken);
    const res = await fetch(`${GOOGLE_TASKS_API}/lists/${listId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, completed } = await req.json();
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const listId = await getDashListId(session.accessToken);
    const bodyPayload: Record<string, unknown> = { id };
    if (title !== undefined) bodyPayload.title = title;
    if (completed !== undefined) {
      bodyPayload.status = completed ? 'completed' : 'needsAction';
    }

    const res = await fetch(`${GOOGLE_TASKS_API}/lists/${listId}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const listId = await getDashListId(session.accessToken);
    await fetch(`${GOOGLE_TASKS_API}/lists/${listId}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
