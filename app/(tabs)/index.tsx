import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  I18nManager,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Lesson } from '@/types/database';
import LessonCard from '@/components/LessonCard';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { BookOpen, TrendingUp, Clock } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function HomeScreen() {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (lessonsError) throw lessonsError;

      if (lessonsData) {
        setLessons(lessonsData);

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
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLessons();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{profile?.full_name || 'مستخدم'}</Text>
          </View>
          <View style={styles.iconContainer}>
            <BookOpen size={40} color={Colors.textWhite} strokeWidth={2.5} />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>استمر في رحلتك التعليمية</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <BookOpen size={24} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{lessons.length}</Text>
          <Text style={styles.statLabel}>دروس متاحة</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>
            {Object.values(videoCounts).reduce((a, b) => a + b, 0)}
          </Text>
          <Text style={styles.statLabel}>فيديو تعليمي</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={24} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>24/7</Text>
          <Text style={styles.statLabel}>تعلم مستمر</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>أحدث الدروس</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/lessons')}>
            <Text style={styles.seeAllText}>عرض الكل</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>جاري التحميل...</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>لا توجد دروس متاحة حالياً</Text>
            <Text style={styles.emptySubtext}>
              سيتم إضافة الدروس قريباً
            </Text>
          </View>
        ) : (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              videosCount={videoCounts[lesson.id] || 0}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textWhite,
    opacity: 0.9,
    textAlign: 'right',
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textWhite,
    opacity: 0.9,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.xl,
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
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
