import { Tabs } from 'expo-router';
import { I18nManager, Platform } from 'react-native';
import { Home, BookOpen, User, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function TabLayout() {
  const { profile } = useAuth();
  const isTeacher = profile?.role === 'teacher';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          height: Platform.OS === 'android' ? 70 : 60, // 👈 ارتفاع أعلى لأندرويد
          paddingBottom: Platform.OS === 'android' ? 12 : 0, // 👈 مساحة أمان للإيماءات
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'الدروس',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      {isTeacher && (
        <Tabs.Screen
          name="teacher"
          options={{
            title: 'لوحة التحكم',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الحساب',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
