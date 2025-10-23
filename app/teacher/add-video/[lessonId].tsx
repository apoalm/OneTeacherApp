import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  I18nManager,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { ArrowRight, Save } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AddVideoScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال عنوان الفيديو');
      return;
    }

    if (!videoUrl.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال رابط الفيديو');
      return;
    }

    const mins = parseInt(durationMinutes) || 0;
    const secs = parseInt(durationSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    if (totalSeconds === 0) {
      Alert.alert('خطأ', 'الرجاء إدخال مدة الفيديو');
      return;
    }

    setLoading(true);

    try {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      const { error } = await supabase.from('videos').insert({
        lesson_id: lessonId,
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        duration_seconds: totalSeconds,
        thumbnail_url: thumbnailUrl.trim() || null,
        order_index: count || 0,
      });

      if (error) throw error;

      Alert.alert('تم الحفظ', 'تم إضافة الفيديو بنجاح', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('خطأ', 'فشل إضافة الفيديو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة فيديو جديد</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>عنوان الفيديو *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: الدرس الأول - مقدمة"
              value={title}
              onChangeText={setTitle}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>رابط الفيديو *</Text>
            <TextInput
              style={styles.input}
              placeholder="رابط YouTube أو رابط مباشر"
              value={videoUrl}
              onChangeText={setVideoUrl}
              textAlign="right"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.hint}>مثال: https://www.youtube.com/watch?v=...</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>مدة الفيديو *</Text>
            <View style={styles.durationRow}>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.input}
                  placeholder="00"
                  value={durationSeconds}
                  onChangeText={setDurationSeconds}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.durationLabel}>ثانية</Text>
              </View>
              <Text style={styles.durationSeparator}>:</Text>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.input}
                  placeholder="00"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="number-pad"
                  maxLength={3}
                  textAlign="center"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.durationLabel}>دقيقة</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وصف مختصر عن محتوى الفيديو"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>رابط صورة المعاينة</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailUrl}
              onChangeText={setThumbnailUrl}
              textAlign="right"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.hint}>اختياري - سيتم استخدام الصورة الافتراضية إذا تركت فارغاً</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Save size={20} color={Colors.textWhite} />
          <Text style={styles.saveButtonText}>
            {loading ? 'جاري الحفظ...' : 'حفظ الفيديو'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  form: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  durationInput: {
    flex: 1,
  },
  durationLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  durationSeparator: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textWhite,
  },
});
