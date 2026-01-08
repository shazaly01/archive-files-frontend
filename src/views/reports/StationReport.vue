<!-- src/views/reports/StationReport.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">تقرير المحطات</h1>
      <p class="text-gray-600 dark:text-text-secondary mt-1">
        عرض المحطات مع إمكانية الفلترة حسب الشركة.
      </p>
    </div>

    <!-- قسم الفلاتر -->
    <AppCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <CompaniesDropdown
          id="company-filter"
          label="فلترة حسب الشركة"
          v-model="filters.company_id"
          :required="false"
        />
        <div class="flex space-x-2 space-x-reverse">
          <AppButton @click="applyFilters"> تطبيق </AppButton>
          <AppButton variant="outline" @click="resetFilters"> إعادة تعيين </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض النتائج -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="stationReport.data || []"
        :is-loading="stationReport.loading"
        :row-clickable="false"
      >
        <!-- تخصيص عرض خلية الشركة -->
        <template #cell-company="{ item }">
          <span>{{ item.company?.name || 'غير محدد' }}</span>
        </template>
      </AppTable>

      <AppPagination :meta="stationReport.pagination" @page-change="handlePageChange" />
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
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'

// إعدادات
const reportStore = useReportStore()
const { stationReport } = storeToRefs(reportStore)
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم المحطة' },
  { key: 'address', label: 'العنوان' },
  { key: 'station_number', label: 'رقم المحطة' },
  { key: 'company', label: 'الشركة التابعة' },
]

// إدارة الفلاتر
const filters = ref({
  company_id: '',
  page: 1,
})

const applyFilters = () => {
  filters.value.page = 1 // إعادة الترقيم إلى الصفحة الأولى عند تطبيق فلتر جديد
  fetchReportData()
}

const resetFilters = () => {
  filters.value = { company_id: '', page: 1 }
  fetchReportData()
}

const handlePageChange = (page) => {
  filters.value.page = page
  fetchReportData()
}

const fetchReportData = () => {
  // إزالة المفاتيح الفارغة من كائن الفلاتر قبل إرساله
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([_, v]) => v !== '' && v !== null),
  )

  reportStore.fetchStationReport(cleanFilters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات التقرير.')
  })
}

// جلب البيانات عند تحميل المكون لأول مرة
onMounted(() => {
  fetchReportData()
})
</script>
