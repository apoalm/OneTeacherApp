import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { BookOpen } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (role === 'student' && !grade) {
      Alert.alert('خطأ', 'الرجاء اختيار الصف الدراسي');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, role, grade);
    setLoading(false);

    if (error) {
      Alert.alert('خطأ في التسجيل', error.message || 'حدث خطأ أثناء التسجيل');
    } else {
      Alert.alert('تم التسجيل بنجاح', 'يمكنك الآن تسجيل الدخول', [
        { text: 'موافق', onPress: () => router.replace('/login') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <BookOpen size={48} color={Colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <Text style={styles.subtitle}>انضم إلى منصة التعليم اليوم</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسمك الكامل"
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>نوع الحساب</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'student' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('student')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'student' && styles.roleButtonTextActive,
                  ]}
                >
                  طالب
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'teacher' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('teacher')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'teacher' && styles.roleButtonTextActive,
                  ]}
                >
                  مدرس
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {role === 'student' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>الصف الدراسي</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: الصف الأول الثانوي"
                value={grade}
                onChangeText={setGrade}
                textAlign="right"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>تأكيد كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textAlign="right"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>لديك حساب بالفعل؟</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
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
  roleContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.primaryLight + '20',
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  roleButtonTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
});
