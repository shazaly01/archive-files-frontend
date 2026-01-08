<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700"
    >
      <div class="text-6xl mb-4">🚫</div>
      <h1 class="text-4xl font-bold text-red-600 mb-2">403</h1>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">وصول مرفوض</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-8">
        عذراً، لا تملك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
      </p>

      <div class="flex flex-col gap-3">
        <router-link
          to="/app/dashboard"
          class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          العودة للرئيسية
        </router-link>

        <button
          @click="handleLogout"
          class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
        >
          تسجيل الخروج والدخول بحساب آخر
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const handleLogout = async () => {
  // استدعاء دالة الخروج الموجودة في الستور الخاص بك
  await authStore.logout()
}
</script>
