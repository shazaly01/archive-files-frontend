<template>
  <div>
    <div v-if="loading" class="text-center p-4">جاري تحميل الدفعات...</div>
    <div v-else-if="error" class="text-center p-4 text-danger">{{ error }}</div>

    <AppTable
      v-else-if="payments.length > 0"
      :headers="tableHeaders"
      :items="payments"
      :is-loading="loading"
    >
      <!-- تنسيق المبلغ -->
      <template #cell-amount="{ item }">
        <span>{{ formatCurrency(item.amount) }}</span>
      </template>

      <!-- === [تصحيح 2] === -->
      <!-- تم تغيير اسم السلوت من #cell-date إلى #cell-payment_date -->
      <!-- وتم تغيير الوصول من item.date إلى item.payment_date -->
      <template #cell-payment_date="{ item }">
        <span>{{ formatDate(item.payment_date) }}</span>
      </template>

      <!-- أزرار الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 space-x-reverse">
          <button
            @click="$emit('edit', item)"
            class="p-1 text-sky-500 hover:text-sky-400 transition-colors"
            title="تعديل"
          >
            <!-- أيقونة قلم -->
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h12a1 1 0 100-2H3z"
              ></path>
            </svg>
          </button>
          <button
            @click="$emit('delete', item)"
            class="p-1 text-rose-500 hover:text-rose-400 transition-colors"
            title="حذف"
          >
            <!-- أيقونة سلة مهملات -->
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

    <!-- رسالة في حالة عدم وجود دفعات -->
    <div
      v-else
      class="text-center text-text-muted py-8 border-2 border-dashed border-surface-border rounded-md"
    >
      <p>لم يتم إضافة أي دفعات لهذا المشروع بعد.</p>
    </div>

    <!-- مكون الترقيم -->
    <AppPagination
      v-if="pagination && pagination.total > pagination.per_page"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps({
  payments: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['edit', 'delete', 'page-change'])

// === [تصحيح 1] ===
// تم تغيير المفتاح 'key' من 'date' إلى 'payment_date'
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'payment_date', label: 'تاريخ الدفعة' },
  { key: 'notes', label: 'ملاحظات' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]
</script>
