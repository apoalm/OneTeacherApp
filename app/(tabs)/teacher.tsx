import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/database';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { Plus, BookOpen, Users, TrendingUp, Edit, Trash2 } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function TeacherDashboardScreen() {
  const { user, profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalVideos: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.role === 'teacher') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      if (lessonsData) {
        setLessons(lessonsData);

        let totalVideos = 0;
        for (const lesson of lessonsData) {
          const { count } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);
          totalVideos += count || 0;
        }

        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        setStats({
          totalLessons: lessonsData.length,
          totalVideos,
          totalStudents: studentsCount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
    Alert.alert('حذف الدرس', `هل أنت متأكد من حذف درس "${lessonTitle}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
            if (error) throw error;
            loadDashboardData();
            Alert.alert('تم الحذف', 'تم حذف الدرس بنجاح');
          } catch (error) {
            Alert.alert('خطأ', 'فشل حذف الدرس');
          }
        },
      },
    ]);
  };

  if (profile?.role !== 'teacher') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>هذه الصفحة متاحة للمدرسين فقط</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>لوحة التحكم</Text>
        <Text style={styles.subtitle}>إدارة الدروس والمحتوى</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <BookOpen size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalLessons}</Text>
            <Text style={styles.statLabel}>دروس</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.totalVideos}</Text>
            <Text style={styles.statLabel}>فيديو</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>طالب</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/teacher/add-lesson')}
          activeOpacity={0.7}
        >
          <Plus size={24} color={Colors.textWhite} strokeWidth={2.5} />
          <Text style={styles.addButtonText}>إضافة درس جديد</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دروسي</Text>

          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>جاري التحميل...</Text>
            </View>
          ) : lessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BookOpen size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>لا توجد دروس بعد</Text>
              <Text style={styles.emptySubtext}>ابدأ بإضافة أول درس لك</Text>
            </View>
          ) : (
            lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonCard}>
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonStatus}>
                    {lesson.is_published ? 'منشور' : 'مسودة'}
                  </Text>
                </View>
                <View style={styles.lessonActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/teacher/edit-lesson/${lesson.id}`)}
                  >
                    <Edit size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteLesson(lesson.id, lesson.title)}
                  >
                    <Trash2 size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textWhite,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  lessonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  lessonTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  lessonStatus: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  lessonActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.error,
    textAlign: 'center',
    padding: Spacing.xl,
  },
});
