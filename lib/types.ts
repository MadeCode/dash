export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  isRemoving?: boolean;
}

export interface ScheduleEvent {
  id: string;
  start: string; // HH:MM
  end: string;   // HH:MM
  title: string;
  location?: string;
}

export type EventStatus = 'past' | 'current' | 'future';
