/*
  # إنشاء نظام المنصة التعليمية

  ## الجداول الجديدة

  ### profiles (الملفات الشخصية)
  - `id` (uuid, primary key) - معرف المستخدم من auth.users
  - `email` (text) - البريد الإلكتروني
  - `full_name` (text) - الاسم الكامل
  - `role` (text) - الدور (student أو teacher)
  - `grade` (text) - الصف الدراسي (للطلاب فقط)
  - `avatar_url` (text) - رابط الصورة الشخصية
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ### lessons (الدروس)
  - `id` (uuid, primary key) - معرف الدرس
  - `title` (text) - عنوان الدرس
  - `description` (text) - وصف الدرس
  - `cover_image_url` (text) - رابط صورة الغلاف
  - `teacher_id` (uuid) - معرف المدرس
  - `order_index` (integer) - ترتيب الدرس
  - `is_published` (boolean) - حالة النشر
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ### videos (الفيديوهات)
  - `id` (uuid, primary key) - معرف الفيديو
  - `lesson_id` (uuid) - معرف الدرس المرتبط
  - `title` (text) - عنوان الفيديو
  - `description` (text) - وصف الفيديو
  - `video_url` (text) - رابط الفيديو
  - `duration_seconds` (integer) - مدة الفيديو بالثواني
  - `order_index` (integer) - ترتيب الفيديو في الدرس
  - `thumbnail_url` (text) - رابط صورة المعاينة
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ### watch_progress (سجل المشاهدات)
  - `id` (uuid, primary key) - معرف السجل
  - `user_id` (uuid) - معرف الطالب
  - `video_id` (uuid) - معرف الفيديو
  - `last_position_seconds` (integer) - آخر موضع مشاهدة بالثواني
  - `completed` (boolean) - هل تم إكمال المشاهدة
  - `watched_at` (timestamptz) - تاريخ آخر مشاهدة
  - `created_at` (timestamptz) - تاريخ الإنشاء

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات الوصول حسب دور المستخدم
  - المدرسون يمكنهم إدارة المحتوى
  - الطلاب يمكنهم القراءة فقط
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher')),
  grade text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  duration_seconds integer DEFAULT 0,
  order_index integer DEFAULT 0,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create watch_progress table
CREATE TABLE IF NOT EXISTS watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  last_position_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_videos_lesson ON videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_video ON watch_progress(video_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Lessons policies
CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Teachers can insert own lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update own lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can delete own lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Videos policies
CREATE POLICY "Anyone can view videos of published lessons"
  ON videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = videos.lesson_id
      AND lessons.is_published = true
    )
  );

CREATE POLICY "Teachers can insert videos to own lessons"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = videos.lesson_id
      AND lessons.teacher_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
      )
    )
  );

CREATE POLICY "Teachers can update videos in own lessons"
  ON videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = videos.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = videos.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete videos from own lessons"
  ON videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = videos.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Watch progress policies
CREATE POLICY "Users can view own watch progress"
  ON watch_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own watch progress"
  ON watch_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watch progress"
  ON watch_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();