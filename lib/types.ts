export type UserRole = 'therapist' | 'athlete';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Protocol {
  id: string;
  therapist_id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  exercises: Exercise[];
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration?: number;
  frequency: string;
}

export interface DailyFeedback {
  id: string;
  athlete_id: string;
  protocol_id: string;
  date: string;
  pain_level: number;
  fatigue_level: number;
  mobility_range: number;
  notes: string | null;
  exercises_completed: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'exercise_reminder' | 'message' | 'protocol_update';
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  protocol_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}
