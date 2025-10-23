import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { BookOpen, Clock } from 'lucide-react-native';
import { Lesson } from '@/types/database';

interface LessonCardProps {
  lesson: Lesson;
  videosCount?: number;
  onPress: () => void;
}

export default function LessonCard({ lesson, videosCount = 0, onPress }: LessonCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {lesson.cover_image_url ? (
        <Image source={{ uri: lesson.cover_image_url }} style={styles.coverImage} />
      ) : (
        <View style={styles.coverImagePlaceholder}>
          <BookOpen size={48} color={Colors.primary} strokeWidth={2} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
        {lesson.description && (
          <Text style={styles.description} numberOfLines={2}>
            {lesson.description}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.stat}>
            <BookOpen size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{videosCount} فيديو</Text>
          </View>
          <View style={styles.stat}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>
              {new Date(lesson.created_at).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.backgroundSecondary,
  },
  coverImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'right',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
