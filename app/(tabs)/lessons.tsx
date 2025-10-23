import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  I18nManager,
  RefreshControl,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Lesson } from '@/types/database';
import LessonCard from '@/components/LessonCard';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { BookOpen, Search } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function LessonsScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = lessons.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons(lessons);
    }
  }, [searchQuery, lessons]);

  const loadLessons = async () => {
    try {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      if (lessonsData) {
        setLessons(lessonsData);
        setFilteredLessons(lessonsData);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الدروس</Text>
        <Text style={styles.subtitle}>جميع الدروس المتاحة للمشاهدة</Text>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن درس..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
            placeholderTextColor={Colors.textLight}
          />
        </View>
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
        ) : filteredLessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد دروس متاحة حالياً'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'جرب البحث بكلمات أخرى' : 'سيتم إضافة الدروس قريباً'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsBar}>
              <Text style={styles.statsText}>
                {filteredLessons.length} {filteredLessons.length === 1 ? 'درس' : 'دروس'}
              </Text>
            </View>
            {filteredLessons.map((lesson) => (
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
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginLeft: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statsBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statsText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
    textAlign: 'right',
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
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
