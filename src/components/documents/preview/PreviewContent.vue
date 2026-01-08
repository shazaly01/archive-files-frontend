<template>
  <div class="flex-1 flex overflow-hidden relative">
    <div
      v-if="loading"
      class="absolute inset-0 z-20 bg-surface-ground/80 flex items-center justify-center backdrop-blur-sm"
    >
      <div
        class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div
      class="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-auto"
    >
      <iframe
        v-if="isPreviewable && url"
        :src="url"
        class="w-full h-full rounded-lg shadow-sm bg-white border border-gray-200 dark:border-gray-700 dark:bg-surface-section"
        frameborder="0"
        title="معاينة المستند"
      ></iframe>

      <div
        v-else-if="url"
        class="text-center p-8 bg-surface-section rounded-xl shadow-sm border border-surface-border max-w-md w-full"
      >
        <div
          class="w-16 h-16 bg-surface-ground rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <DocumentIcon class="w-8 h-8 text-text-secondary" />
        </div>

        <h3 class="text-lg font-bold text-text-primary">المعاينة غير متاحة</h3>
        <p class="text-text-muted mt-2 text-sm leading-relaxed">
          صيغة هذا الملف لا تدعم العرض المباشر داخل المتصفح. يمكنك تحميله للاطلاع عليه.
        </p>

        <a
          :href="url"
          class="mt-6 inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors gap-2 text-sm font-medium w-full sm:w-auto"
          download
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          تحميل الملف
        </a>
      </div>

      <div v-else-if="!loading" class="text-text-muted text-sm">لا يمكن الوصول لملف العرض.</div>
    </div>
  </div>
</template>

<script setup>
import { DocumentIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

/**
 * الخصائص (Props):
 * - url: الرابط المباشر (أو الموقع) للملف.
 * - isPreviewable: قيمة منطقية تحدد ما إذا كان الامتداد مدعوماً في iframe.
 * - loading: حالة التحميل لإظهار العداد.
 */
defineProps({
  url: {
    type: String,
    default: null,
  },
  isPreviewable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
