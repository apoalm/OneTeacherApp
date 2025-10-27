# تحديث نظام التنقل - Navigation Update

## التغييرات المطبقة

### 1. إصلاح مشكلة ظهور "لوحة التحكم" للطلاب

تم إصلاح المشكلة التي كانت تسبب ظهور تبويب "لوحة التحكم" (teacher) في شريط التنقل السفلي لجميع المستخدمين بما فيهم الطلاب.

### 2. إضافة تبويب "دروسي" للطلاب

تم إضافة تبويب جديد اسمه "دروسي" يظهر **فقط للطلاب** ويحتوي على:
- الدروس التي تم شراؤها
- إحصائيات عن عدد الدروس والفيديوهات
- واجهة سهلة للوصول السريع للدروس المشتراة

## كيف يعمل النظام الآن

### للطلاب (Student):
يظهر في شريط التنقل السفلي:
1. 🏠 **الرئيسية** - الصفحة الرئيسية
2. 📚 **الدروس** - جميع الدروس المتاحة
3. 🎓 **دروسي** - الدروس المشتراة (جديد!)
4. 👤 **الحساب** - الملف الشخصي

### للمدرسين (Teacher):
يظهر في شريط التنقل السفلي:
1. 🏠 **الرئيسية** - الصفحة الرئيسية
2. 📚 **الدروس** - جميع الدروس
3. ⚙️ **لوحة التحكم** - إدارة الدروس والمحتوى
4. 👤 **الحساب** - الملف الشخصي

## الملفات المعدلة

### 1. `app/(tabs)/_layout.tsx`
```typescript
// تم استخدام خاصية href لإخفاء/إظهار التبويبات حسب نوع المستخدم
<Tabs.Screen
  name="my-lessons"
  options={{
    title: 'دروسي',
    tabBarIcon: ({ color, size }) => <GraduationCap size={size} color={color} />,
    href: isTeacher ? null : undefined, // يظهر فقط للطلاب
  }}
/>
<Tabs.Screen
  name="teacher"
  options={{
    title: 'لوحة التحكم',
    tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
    href: isTeacher ? undefined : null, // يظهر فقط للمدرسين
  }}
/>
```

### 2. `app/(tabs)/my-lessons.tsx` (جديد)
صفحة "دروسي" للطلاب تحتوي على:
- عرض الدروس المشتراة
- إحصائيات سريعة
- رسالة توضيحية إذا لم يكن هناك دروس مشتراة
- حماية للصفحة (تظهر فقط للطلاب)

## ملاحظات مهمة

### نظام الشراء (للتطوير المستقبلي)
حالياً، صفحة "دروسي" تعرض جميع الدروس المنشورة كمثال. لتطبيق نظام الشراء الفعلي:

1. إنشاء جدول `purchased_lessons` في Supabase:
```sql
CREATE TABLE purchased_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE purchased_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchased_lessons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

2. تحديث الاستعلام في `my-lessons.tsx`:
```typescript
// جلب الدروس المشتراة فقط
const { data: purchasedData } = await supabase
  .from('purchased_lessons')
  .select('lesson_id')
  .eq('user_id', user?.id);

const lessonIds = purchasedData?.map(p => p.lesson_id) || [];

const { data: lessonsData } = await supabase
  .from('lessons')
  .select('*')
  .in('id', lessonIds);
```

3. إضافة زر "شراء" في صفحة تفاصيل الدرس
4. دمج بوابة الدفع (Stripe أو غيرها)

## الاختبار

### اختبار حساب طالب:
1. سجل دخول كطالب
2. تحقق من أن شريط التنقل يحتوي على:
   - الرئيسية ✓
   - الدروس ✓
   - دروسي ✓
   - الحساب ✓
3. تحقق من **عدم** وجود "لوحة التحكم"

### اختبار حساب مدرس:
1. سجل دخول كمدرس
2. تحقق من أن شريط التنقل يحتوي على:
   - الرئيسية ✓
   - الدروس ✓
   - لوحة التحكم ✓
   - الحساب ✓
3. تحقق من **عدم** وجود "دروسي"

## خطوات التطوير التالية

1. **نظام الشراء**
   - إضافة جدول purchased_lessons
   - إضافة زر شراء في صفحة الدرس
   - دمج بوابة دفع

2. **تتبع التقدم**
   - حساب نسبة إكمال كل درس
   - عرض آخر فيديو تمت مشاهدته
   - إضافة شريط تقدم لكل درس

3. **الإشعارات**
   - إشعار عند إضافة فيديو جديد لدرس مشترى
   - إشعار عند إضافة درس جديد

4. **المفضلة**
   - إضافة الدروس للمفضلة
   - عرض سريع للدروس المفضلة

---

تم تطبيق التحديثات بنجاح! ✅
