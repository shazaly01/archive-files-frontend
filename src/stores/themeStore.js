import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 1. الحالة: تعريف الثيم الحالي.
  //    نحاول قراءة الثيم المحفوظ من localStorage، وإذا لم نجد شيئًا،
  //    نستخدم 'dark' كقيمة افتراضية.
  const currentTheme = ref(localStorage.getItem('theme') || 'dark')

  // 2. الدالة: لتبديل الثيم.
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  // 3. التأثير الجانبي (الأهم): لمراقبة التغييرات وتطبيقها.
  //    هذا الكود يراقب `currentTheme`. كلما تغيرت قيمته:
  watchEffect(() => {
    // أ. يقوم بتحديث كلاس عنصر <html>.
    //    إذا كان الثيم 'dark'، يضيف كلاس 'dark'.
    //    إذا كان الثيم 'light'، يزيل كلاس 'dark'.
    document.documentElement.classList.toggle('dark', currentTheme.value === 'dark')

    // ب. يقوم بحفظ الاختيار الجديد في localStorage.
    localStorage.setItem('theme', currentTheme.value)
  })

  // 4. إرجاع الحالة والدوال لجعلها متاحة للمكونات الأخرى.
  return {
    currentTheme,
    toggleTheme,
  }
})
