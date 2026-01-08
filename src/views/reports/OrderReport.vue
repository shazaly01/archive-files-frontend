<!-- src/views/reports/OrderReport.vue (النسخة النهائية والمحسنة) -->
<template>
  <div>
    <!-- رأس الصفحة (لا تغيير) -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">تقرير الطلبات</h1>
      <p class="text-gray-600 dark:text-text-secondary mt-1">عرض وتحليل الطلبات مع فلاتر متقدمة.</p>
    </div>

    <!-- استخدام مكون الفلاتر (لا تغيير) -->
    <OrderReportFilters @apply-filters="applyFilters" @reset-filters="resetFilters" />

    <!-- جدول عرض النتائج -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="orderReport.data || []"
        :is-loading="orderReport.loading"
        :row-clickable="false"
      >
        <!-- --- [بداية التعديل هنا] --- -->
        <!-- 1. تخصيص عرض خلية الحالة (الشارة الملونة) -->
        <template #cell-status="{ item }">
          <span
            v-if="item.status"
            class="px-3 py-1 text-xs font-semibold rounded-full text-white"
            :style="{ backgroundColor: item.status.color || '#6c757d' }"
          >
            {{ item.status.name }}
          </span>
          <span v-else class="text-text-muted">N/A</span>
        </template>

        <!-- تخصيص عرض باقي الخلايا لضمان عدم حدوث خطأ -->
        <template #cell-driver="{ item }">
          <span>{{ item.driver?.name || 'N/A' }}</span>
        </template>
        <template #cell-station="{ item }">
          <span>{{ item.station?.name || 'N/A' }}</span>
        </template>
        <template #cell-company="{ item }">
          <span>{{ item.station?.company?.name || 'N/A' }}</span>
        </template>
        <template #cell-region="{ item }">
          <span>{{ item.station?.region?.name || 'N/A' }}</span>
        </template>
        <template #cell-product="{ item }">
          <span>{{ item.product?.name || 'N/A' }}</span>
        </template>
        <!-- --- [نهاية التعديل هنا] --- -->
      </AppTable>

      <AppPagination :meta="orderReport.pagination" @page-change="handlePageChange" />
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import OrderReportFilters from './OrderReportFilters.vue'

// إعدادات
const reportStore = useReportStore()
const { orderReport } = storeToRefs(reportStore)
const toast = useToast()

// --- [بداية التعديل هنا] ---
// 2. تحديث ترتيب أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'status', label: 'الحالة' }, // <-- تم نقله إلى البداية
  { key: 'order_date', label: 'تاريخ الطلب' },
  { key: 'driver', label: 'السائق' },
  { key: 'company', label: 'الشركة' },
  { key: 'region', label: 'المنطقة' },
  { key: 'station', label: 'المحطة' },
  { key: 'product', label: 'المنتج' },
  { key: 'quantity', label: 'الكمية' },
]
// --- [نهاية التعديل هنا] ---

// إدارة الفلاتر (لا تغيير)
const currentFilters = ref({ page: 1 })

const applyFilters = (newFilters) => {
  currentFilters.value = { ...newFilters, page: 1 }
  fetchReportData()
}

const resetFilters = () => {
  currentFilters.value = { page: 1 }
  fetchReportData()
}

const handlePageChange = (page) => {
  currentFilters.value.page = page
  fetchReportData()
}

const fetchReportData = () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(currentFilters.value).filter(([_, v]) => v !== '' && v !== null),
  )

  reportStore.fetchOrderReport(cleanFilters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات التقرير.')
  })
}

// جلب البيانات عند تحميل المكون لأول مرة
onMounted(() => {
  fetchReportData()
})
</script>
