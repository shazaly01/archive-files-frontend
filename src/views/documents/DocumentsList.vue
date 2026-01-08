<template>
  <div>
    <div v-if="loading" class="text-center p-4">جاري تحميل المستندات...</div>
    <div v-else-if="error" class="text-center p-4 text-danger">{{ error }}</div>

    <AppTable
      v-else-if="documents.length > 0"
      :headers="tableHeaders"
      :items="documents"
      :is-loading="loading"
    >
      <template #cell-created_at="{ item }">
        <span>{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            @click="$emit('preview', item)"
            class="p-1 text-sky-500 hover:text-sky-400 transition-colors"
            title="معاينة المستند"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>

          <button
            @click="$emit('delete', item)"
            class="p-1 text-rose-500 hover:text-rose-400 transition-colors"
            title="حذف المستند"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <div
      v-else
      class="text-center text-text-muted py-8 border-2 border-dashed border-surface-border rounded-md"
    >
      <p>لم يتم رفع أي مستندات بعد.</p>
    </div>
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import { formatDate } from '@/utils/formatters'

defineProps({
  documents: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

// تعريف الأحداث: الحذف والمعاينة
defineEmits(['delete', 'preview'])

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم المستند' },
  { key: 'created_at', label: 'تاريخ الرفع' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]
</script>
