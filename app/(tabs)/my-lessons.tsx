import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  I18nManager,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/database';
import LessonCard from '@/components/LessonCard';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { GraduationCap, Lock } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MyLessonsScreen() {
  const { user, profile } = useAuth();
  const [myLessons, setMyLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (profile?.role === 'student') {
      loadMyLessons();
    }
  }, [profile]);

  const loadMyLessons = async () => {
    try {
      // في المستقبل، سيتم جلب الدروس المشتراة من جدول purchased_lessons
      // حالياً، سنعرض جميع الدروس المنشورة كمثال
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      if (lessonsData) {
        setMyLessons(lessonsData);

        const counts: Record<string, number> = {};
        for (const lesson of lessonsData) {
          const { count } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);
          counts[lesson.id] = count || 0;
        }
        setVideoCounts(counts);
      }
    } catch (error) {
      console.error('Error loading my lessons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyLessons();
  };

  if (profile?.role !== 'student') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Lock size={64} color={Colors.textLight} />
          <Text style={styles.errorText}>هذه الصفحة متاحة للطلاب فقط</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>دروسي</Text>
        <Text style={styles.subtitle}>الدروس التي قمت بشرائها</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>جاري التحميل...</Text>
          </View>
        ) : myLessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <GraduationCap size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>لا توجد دروس مشتراة بعد</Text>
            <Text style={styles.emptySubtext}>
              قم بشراء الدروس من صفحة "الدروس" لتظهر هنا
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsBar}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{myLessons.length}</Text>
                <Text style={styles.statLabel}>درس مشترى</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Object.values(videoCounts).reduce((a, b) => a + b, 0)}
                </Text>
                <Text style={styles.statLabel}>فيديو متاح</Text>
              </View>
            </View>

            {myLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                videosCount={videoCounts[lesson.id] || 0}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statsBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
    fontWeight: FontWeights.semibold,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
