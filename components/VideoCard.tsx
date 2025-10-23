import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { Play, Clock } from 'lucide-react-native';
import { Video } from '@/types/database';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  isWatched?: boolean;
}

export default function VideoCard({ video, onPress, isWatched = false }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.thumbnailContainer}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Play size={32} color={Colors.primary} strokeWidth={2} />
          </View>
        )}
        <View style={styles.durationBadge}>
          <Clock size={12} color={Colors.textWhite} />
          <Text style={styles.durationText}>{formatDuration(video.duration_seconds)}</Text>
        </View>
        {isWatched && <View style={styles.watchedBadge} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        {video.description && (
          <Text style={styles.description} numberOfLines={1}>
            {video.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 120,
    height: 90,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundSecondary,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    fontSize: 11,
    color: Colors.textWhite,
    fontWeight: FontWeights.medium,
  },
  watchedBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
