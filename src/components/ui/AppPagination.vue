<!-- src/components/ui/AppPagination.vue -->
<template>
  <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between mt-4">
    <!-- معلومات الصفحات -->
    <div class="text-sm text-text-muted">
      عرض من <span class="font-bold">{{ meta.from || 0 }}</span> إلى
      <span class="font-bold">{{ meta.to || 0 }}</span> من إجمالي
      <span class="font-bold">{{ meta.total || 0 }}</span>
    </div>

    <!-- أزرار التنقل -->
    <div class="flex items-center space-x-2 space-x-reverse">
      <!-- زر السابق -->
      <button
        @click="changePage(meta.current_page - 1)"
        :disabled="meta.current_page <= 1"
        class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
        :class="{
          'bg-surface-ground text-text-secondary hover:bg-primary hover:text-white':
            meta.current_page > 1,
          'bg-surface-border text-text-muted cursor-not-allowed': meta.current_page <= 1,
        }"
      >
        السابق
      </button>

      <!-- أرقام الصفحات (منطق مبسط لعرض الأرقام) -->
      <button
        v-for="page in pages"
        :key="page"
        @click="changePage(page)"
        class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
        :class="{
          'bg-primary text-white': page === meta.current_page,
          'bg-surface-ground text-text-secondary hover:bg-primary hover:text-white':
            page !== meta.current_page,
        }"
      >
        {{ page }}
      </button>

      <!-- زر التالي -->
      <button
        @click="changePage(meta.current_page + 1)"
        :disabled="meta.current_page >= meta.last_page"
        class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
        :class="{
          'bg-surface-ground text-text-secondary hover:bg-primary hover:text-white':
            meta.current_page < meta.last_page,
          'bg-surface-border text-text-muted cursor-not-allowed':
            meta.current_page >= meta.last_page,
        }"
      >
        التالي
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  meta: {
    type: Object,
    required: true,
    default: () => ({
      current_page: 1,
      last_page: 1,
      from: 0,
      to: 0,
      total: 0,
    }),
  },
})

const emit = defineEmits(['page-change'])

const changePage = (page) => {
  // التأكد من عدم الخروج عن نطاق الصفحات
  if (page > 0 && page <= props.meta.last_page) {
    emit('page-change', page)
  }
}

// حساب أرقام الصفحات التي ستعرض (منطق مبسط)
const pages = computed(() => {
  const pageCount = props.meta.last_page
  if (pageCount <= 5) {
    // عرض كل الصفحات إذا كانت 5 أو أقل
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  // منطق أكثر تعقيدًا يمكن إضافته هنا لعرض "..." للصفحات الكثيرة
  // حاليًا، سنعرض أول 5 صفحات فقط كمثال
  return [1, 2, 3, 4, 5]
})
</script>
