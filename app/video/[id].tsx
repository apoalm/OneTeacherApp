import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Video } from '@/types/database';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { ArrowRight, Clock } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');
const videoHeight = (width * 9) / 16;

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      loadVideo();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id]);

  const loadVideo = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (videoError) throw videoError;
      if (!videoData) {
        router.back();
        return;
      }

      setVideo(videoData);
      await updateWatchProgress(0);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWatchProgress = async (position: number) => {
    if (!user || !video) return;

    try {
      const { error } = await supabase.from('watch_progress').upsert(
        {
          user_id: user.id,
          video_id: video.id,
          last_position_seconds: Math.floor(position),
          completed: position >= video.duration_seconds * 0.9,
          watched_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,video_id',
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    }
    return url;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!video) {
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
          <ArrowRight size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: getEmbedUrl(video.video_url) }}
          style={styles.webview}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{video.title}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{formatDuration(video.duration_seconds)}</Text>
          </View>
        </View>

        {video.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>الوصف</Text>
            <Text style={styles.description}>{video.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.xxl + 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: videoHeight,
    backgroundColor: Colors.text,
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  descriptionContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  descriptionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
  },
});
