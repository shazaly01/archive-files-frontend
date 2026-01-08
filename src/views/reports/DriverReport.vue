<!-- src/views/reports/DriverReport.vue -->
<template>
  <div>
    <!-- رأس الصفحة -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">تقرير السائقين</h1>
      <p class="text-gray-600 dark:text-text-secondary mt-1">
        عرض السائقين مع شاحناتهم وإمكانية الفلترة.
      </p>
    </div>

    <!-- قسم الفلاتر (يبقى كما هو) -->
    <AppCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <!-- فلتر الحالة -->
        <div>
          <label
            for="status-filter"
            class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
          >
            فلترة حسب الحالة
          </label>
          <select
            id="status-filter"
            v-model="filters.status"
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary"
          >
            <option value="">الكل</option>
            <option value="available">متاح</option>
            <option value="on_trip">في رحلة</option>
            <option value="unavailable">غير متاح</option>
          </select>
        </div>

        <!-- فلتر سقف الطلبيات -->
        <AppInput
          id="order-limit-filter"
          label="سقف الطلبيات غير المسلمة"
          type="number"
          v-model="filters.order_limit"
          placeholder="مثال: 3"
        />

        <!-- أزرار التحكم -->
        <div class="flex space-x-2 space-x-reverse">
          <AppButton @click="applyFilters"> تطبيق </AppButton>
          <AppButton variant="outline" @click="resetFilters"> إعادة تعيين </AppButton>
          <!-- [تمت الإضافة هنا] -->
          <AppButton
            variant="primary"
            @click="openPrintPage"
            :disabled="!driverReport.data || driverReport.data.length === 0"
          >
            <PrinterIcon class="w-5 h-5 ml-2" />
            طباعة
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- جدول عرض النتائج -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="driverReport.data || []"
        :is-loading="driverReport.loading"
        :row-clickable="false"
      >
        <!-- تخصيص عرض خلية الحالة (يبقى كما هو) -->
        <template #cell-status="{ item }">
          <span
            class="px-3 py-1 text-sm font-semibold rounded-full"
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                item.status === 'available',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                item.status === 'on_trip',
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                item.status === 'unavailable',
            }"
          >
            {{ item.status }}
          </span>
        </template>

        <!-- [إضافة] تخصيص عرض خلايا الشاحنة -->
        <template #cell-truck_number="{ item }">
          <span v-if="item.truck">{{ item.truck.truck_number }}</span>
          <span v-else class="text-text-muted">--</span>
        </template>
        <template #cell-truck_type="{ item }">
          <span v-if="item.truck">{{ item.truck.truck_type }}</span>
          <span v-else class="text-text-muted">--</span>
        </template>
        <template #cell-trailer_number="{ item }">
          <span v-if="item.truck">{{ item.truck.trailer_number }}</span>
          <span v-else class="text-text-muted">--</span>
        </template>
      </AppTable>

      <!-- [حذف] تم حذف مكون الترقيم بالكامل -->
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // <-- 1. استورد useRouter
import { PrinterIcon } from '@heroicons/vue/24/outline' // <-- 2. استورد أيقونة الطباعة
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'

// إعدادات
const reportStore = useReportStore()
const { driverReport } = storeToRefs(reportStore)
const toast = useToast()
const router = useRouter() // <-- 3. قم بتهيئة الراوتر

// [تعديل] تعريف أعمدة الجدول لتشمل بيانات الشاحنة
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم السائق' },
  { key: 'license_number', label: 'رقم الرخصة' },
  { key: 'phone_number', label: 'رقم الهاتف' },
  { key: 'truck_number', label: 'رقم الشاحنة' },
  { key: 'truck_type', label: 'نوع الشاحنة' },
  { key: 'trailer_number', label: 'رقم المقطورة' },
]

// [تعديل] إدارة الفلاتر بدون "page"
const filters = ref({
  status: '',
  order_limit: '',
})

const applyFilters = () => {
  fetchReportData()
}

const resetFilters = () => {
  filters.value = { status: '', order_limit: '' }
  fetchReportData()
}

// [حذف] تم حذف دالة handlePageChange

const fetchReportData = () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([_, v]) => v !== '' && v !== null),
  )

  reportStore.fetchDriverReport(cleanFilters).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات التقرير.')
  })
}

const openPrintPage = () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([_, v]) => v !== '' && v !== null),
  )

  const routeData = router.resolve({
    name: 'DriverReportPrint', // اسم المسار الذي عرفناه
    query: cleanFilters,
  })

  window.open(routeData.href, '_blank')
}

// جلب البيانات عند تحميل المكون لأول مرة
onMounted(() => {
  fetchReportData()
})
</script>
