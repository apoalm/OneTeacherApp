import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, Video, WatchProgress } from '@/types/database';
import VideoCard from '@/components/VideoCard';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { ArrowRight, BookOpen } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLessonData();
    }
  }, [id]);

  const loadLessonData = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        router.back();
        return;
      }

      setLesson(lessonData);

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true });

      if (videosError) throw videosError;
      setVideos(videosData || []);

      if (user && videosData) {
        const { data: progressData } = await supabase
          .from('watch_progress')
          .select('*')
          .eq('user_id', user.id)
          .in(
            'video_id',
            videosData.map((v) => v.id)
          );

        if (progressData) {
          const progressMap: Record<string, WatchProgress> = {};
          progressData.forEach((p) => {
            progressMap[p.video_id] = p;
          });
          setWatchProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowRight size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {lesson.cover_image_url ? (
          <Image source={{ uri: lesson.cover_image_url }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverImagePlaceholder}>
            <BookOpen size={64} color={Colors.primary} strokeWidth={2} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{lesson.title}</Text>
          {lesson.description && (
            <Text style={styles.description}>{lesson.description}</Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{videos.length}</Text>
              <Text style={styles.statLabel}>فيديو</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {Object.values(watchProgress).filter((p) => p.completed).length}
              </Text>
              <Text style={styles.statLabel}>مكتمل</Text>
            </View>
          </View>
        </View>

        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>الفيديوهات</Text>
          {videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>لا توجد فيديوهات في هذا الدرس</Text>
            </View>
          ) : (
            videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isWatched={watchProgress[video.id]?.completed || false}
                onPress={() => router.push(`/video/${video.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.xxl + 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  coverImage: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.backgroundSecondary,
  },
  coverImagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  videosSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
