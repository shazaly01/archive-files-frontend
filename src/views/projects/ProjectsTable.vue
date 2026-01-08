<template>
  <AppCard>
    <!-- [التعديل الوحيد هنا] أضفنا خاصيتين فقط -->
    <AppTable
      :headers="tableHeaders"
      :items="projects"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-project_owner="{ item }">
        <span class="text-text-muted font-medium">{{ item.project_owner || 'غير محدد' }}</span>
      </template>
      <!-- عرض اسم الشركة -->
      <template #cell-company="{ item }">
        <span>{{ item.company?.name || 'N/A' }}</span>
      </template>

      <!-- تنسيق قيمة العقد الكلية -->
      <template #cell-contract_value="{ item }">
        <span class="text-gray-400">{{ formatCurrency(item.contract_value) }}</span>
      </template>

      <!-- تنسيق قيمة العقد -->
      <template #cell-due_value="{ item }">
        <span>{{ formatCurrency(item.due_value) }}</span>
      </template>

      <!-- تنسيق التاريخ -->
      <template #cell-award_date="{ item }">
        <span>{{ formatDate(item.award_date) }}</span>
      </template>

      <!-- [لا تغيير هنا] هذا هو الكود الأصلي الذي كان يعمل -->
      <template #cell-actions="{ item }">
        <div class="flex items-center space-x-2 space-x-reverse">
          <!-- زر الدفعات -->
          <button
            v-if="authStore.can('payment.view')"
            @click.stop="$emit('manage-payments', item)"
            class="p-1 text-emerald-500 hover:text-emerald-400 transition-colors"
            title="إدارة الدفعات"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10 4a2 2 0 100 4 2 2 0 000-4zM3 6a2 2 0 114 0 2 2 0 01-4 0zM14 6a2 2 0 114 0 2 2 0 01-4 0zM4 12a2 2 0 100 4h12a2 2 0 100-4H4z"
              ></path>
            </svg>
          </button>

          <button
            v-if="authStore.can('document.view')"
            @click.stop="$emit('manage-documents', item)"
            class="p-1 text-teal-500 hover:text-teal-400 transition-colors"
            title="إدارة المستندات"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"
              ></path>
            </svg>
          </button>
          <!-- زر التعديل -->
          <button
            v-if="authStore.can('project.update')"
            @click.stop="$emit('edit-project', item)"
            class="p-1 font-medium text-sky-500 hover:text-sky-400 transition-colors"
            title="تعديل المشروع"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h12a1 1 0 100-2H3z"
              ></path>
            </svg>
          </button>

          <!-- زر الحذف -->
          <button
            v-if="authStore.can('project.delete')"
            @click.stop="$emit('delete-project', item)"
            class="p-1 font-medium text-rose-500 hover:text-rose-400 transition-colors"
            title="حذف المشروع"
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

    <!-- مكون الترقيم -->
    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// استيراد المكونات والأدوات
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

// هذا المكون يستقبل البيانات كـ props
const props = defineProps({
  projects: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

// [التعديل الوحيد هنا] أضفنا 'row-clicked'
const emit = defineEmits([
  'page-change',
  'edit-project',
  'delete-project',
  'manage-payments',
  'manage-documents', // أضف هذا السطر
  'row-clicked',
])

const authStore = useAuthStore()

// [لا تغيير هنا] هذا هو الكود الأصلي الذي كان يعمل
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'اسم المشروع' },
    { key: 'project_owner', label: 'الجهة المالكة' },
    { key: 'company', label: 'الشركة' },
    { key: 'contract_value', label: 'قيمة العقد' },
    { key: 'due_value', label: 'القيمة المستحقة' },
    { key: 'award_date', label: 'تاريخ الترسية' },
  ]
  if (
    authStore.can('project.update') ||
    authStore.can('project.delete') ||
    authStore.can('payment.view') ||
    authStore.can('document.view')
  ) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left' })
  }
  return headers
})
</script>
