<template>
  <router-view />
</template>

<script setup>
// [جديد] استيراد متجر الثيمات الذي أنشأناه
import { useThemeStore } from '@/stores/themeStore'

// [جديد] استدعاء المتجر لتفعيله.
// بمجرد استدعاء هذا السطر، سيبدأ `watchEffect` الموجود داخل المتجر بالعمل،
// وسيقوم تلقائيًا بتطبيق الثيم الصحيح (من localStorage) على عنصر <html>.
useThemeStore()
</script>

<style>
/* لا حاجة لأي أنماط هنا. كل شيء يتم التحكم به عبر Tailwind. */
</style>
