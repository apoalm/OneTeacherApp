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
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { ArrowRight, Save } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AddLessonScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال عنوان الدرس');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          cover_image_url: coverImageUrl.trim() || null,
          teacher_id: user?.id,
          is_published: isPublished,
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('تم الحفظ', 'تم إضافة الدرس بنجاح', [
        {
          text: 'موافق',
          onPress: () => {
            router.back();
            router.push(`/teacher/edit-lesson/${data.id}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating lesson:', error);
      Alert.alert('خطأ', 'فشل إضافة الدرس');
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
        <Text style={styles.headerTitle}>إضافة درس جديد</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>عنوان الدرس *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: مقدمة في البرمجة"
              value={title}
              onChangeText={setTitle}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وصف مختصر عن محتوى الدرس"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>رابط صورة الغلاف</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              value={coverImageUrl}
              onChangeText={setCoverImageUrl}
              textAlign="right"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.hint}>يمكنك استخدام روابط من Pexels أو مصادر أخرى</Text>
          </View>

          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={styles.switch}
              onPress={() => setIsPublished(!isPublished)}
              activeOpacity={0.7}
            >
              <View style={[styles.switchTrack, isPublished && styles.switchTrackActive]}>
                <View
                  style={[
                    styles.switchThumb,
                    isPublished ? styles.switchThumbActive : styles.switchThumbInactive,
                  ]}
                />
              </View>
              <View style={styles.switchLabel}>
                <Text style={styles.switchLabelText}>نشر الدرس</Text>
                <Text style={styles.switchLabelHint}>
                  {isPublished ? 'مرئي للطلاب' : 'مخفي عن الطلاب'}
                </Text>
              </View>
            </TouchableOpacity>
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
            {loading ? 'جاري الحفظ...' : 'حفظ الدرس'}
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
  switchContainer: {
    marginTop: Spacing.md,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    padding: 4,
  },
  switchTrackActive: {
    backgroundColor: Colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  switchThumbInactive: {
    alignSelf: 'flex-end',
  },
  switchThumbActive: {
    alignSelf: 'flex-start',
  },
  switchLabel: {
    flex: 1,
  },
  switchLabelText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  switchLabelHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
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
