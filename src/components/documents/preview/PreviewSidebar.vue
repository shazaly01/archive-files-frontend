<template>
  <aside
    class="w-80 sm:w-96 bg-surface-section border-r border-surface-border flex flex-col flex-shrink-0 z-10 shadow-xl"
  >
    <div class="flex border-b border-surface-border bg-surface-ground/50">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none"
        :class="
          activeTab === tab.id
            ? 'border-primary text-primary bg-surface-section'
            : 'border-transparent text-text-muted hover:bg-surface-section/50 hover:text-text-secondary'
        "
        @click="$emit('update:activeTab', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 overflow-hidden relative">
      <div
        v-if="activeTab === 'info'"
        class="h-full overflow-y-auto custom-scrollbar p-6 space-y-6"
      >
        <slot name="info-content"></slot>
      </div>

      <div v-else-if="activeTab === 'comments'" class="h-full overflow-hidden">
        <slot name="comments-content"></slot>
      </div>
    </div>
  </aside>
</template>

<script setup>
/**
 * الخصائص (Props):
 * - activeTab: معرف التبويب النشط حالياً (مثلاً 'info' أو 'comments')
 * - tabs: مصفوفة كائنات تحتوي على {id, label} لأسماء التبويبات
 */
defineProps({
  activeTab: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
    // مثال للشكل المتوقع:
    // [{ id: 'comments', label: 'التعليقات (3)' }, { id: 'info', label: 'التفاصيل' }]
  },
})

/**
 * الأحداث (Emits):
 * - update:activeTab: يرسل المعرف الجديد عند ضغط المستخدم على تبويب
 */
defineEmits(['update:activeTab'])
</script>

<style scoped>
/* تحسين شكل شريط التمرير داخل القائمة الجانبية */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
