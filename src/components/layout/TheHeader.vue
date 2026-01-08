<template>
  <header
    class="flex h-16 items-center justify-between bg-surface-section px-4 sm:px-6 lg:px-8 flex-shrink-0"
  >
    <!-- زر فتح القائمة على الشاشات الصغيرة -->
    <button
      @click="$emit('open-sidebar')"
      class="lg:hidden text-text-muted hover:text-text-primary"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- مسافة فارغة لدفع المحتوى التالي إلى اليمين -->
    <div class="flex-1"></div>

    <!-- معلومات المستخدم -->
    <div class="flex items-center gap-4">
      <span class="font-medium text-text-primary hidden sm:inline">{{
        authStore.user?.full_name
      }}</span>
      <!-- يمكن إضافة أيقونة للملف الشخصي أو الإشعارات هنا -->
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { Bars3Icon } from '@heroicons/vue/24/outline'

defineEmits(['open-sidebar'])
const authStore = useAuthStore()
</script>
