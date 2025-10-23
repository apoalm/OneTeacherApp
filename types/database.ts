export type UserRole = 'student' | 'teacher';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  grade?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  teacher_id: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  video_url: string;
  duration_seconds: number;
  order_index: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchProgress {
  id: string;
  user_id: string;
  video_id: string;
  last_position_seconds: number;
  completed: boolean;
  watched_at: string;
  created_at: string;
}
