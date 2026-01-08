<!-- src/views/reports/OrderReportFilters.vue -->
<template>
  <AppCard class="mb-6">
    <!-- [تعديل] تم إضافة أحداث @update:model-value لاستدعاء الفلترة التلقائية -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- الفلاتر الأساسية -->
      <CompaniesDropdown
        id="company-filter"
        label="الشركة"
        v-model="filters.company_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <RegionsDropdown
        id="region-filter"
        label="المنطقة"
        v-model="filters.region_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <StationsDropdown
        id="station-filter"
        label="المحطة"
        v-model="filters.station_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <DriversDropdown
        id="driver-filter"
        label="السائق"
        v-model="filters.driver_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <ProductsDropdown
        id="product-filter"
        label="المنتج"
        v-model="filters.product_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <OrderStatusesDropdown
        id="status-filter"
        label="الحالة"
        v-model="filters.order_status_id"
        :required="false"
        @update:model-value="debouncedApplyFilters"
      />
      <AppInput
        id="notification-number-filter"
        label="رقم الإشعار"
        v-model="filters.notification_number"
        placeholder="ابحث برقم الإشعار..."
        @input="debouncedApplyFilters"
      />

      <!-- قسم فلترة التاريخ المرن -->
      <div
        class="col-span-full lg:col-span-2 border-t-2 border-surface-border pt-4 mt-4 lg:border-t-0 lg:border-r-2 lg:border-surface-border lg:pr-4 lg:mt-0"
      >
        <!-- ... (منطق التاريخ يبقى كما هو، ولكن سنضيف استدعاء للدالة عند التغيير) ... -->
        <div class="flex items-center space-x-4 space-x-reverse mb-4">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="dateFilterMode"
              value="period"
              class="form-radio"
              @change="debouncedApplyFilters"
            />
            <span class="mr-2">فترة سريعة</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="dateFilterMode"
              value="range"
              class="form-radio"
              @change="debouncedApplyFilters"
            />
            <span class="mr-2">نطاق مخصص</span>
          </label>
        </div>

        <div v-if="dateFilterMode === 'period'" class="flex items-center space-x-2 space-x-reverse">
          <label for="days-period">آخر</label>
          <AppInput
            id="days-period"
            type="number"
            v-model.number="daysPeriod"
            class="w-24 text-center"
            placeholder="أيام"
            @input="debouncedApplyFilters"
          />
          <label>أيام</label>
        </div>

        <div v-if="dateFilterMode === 'range'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            id="start-date"
            label="من تاريخ"
            type="date"
            v-model="customStartDate"
            @change="debouncedApplyFilters"
          />
          <AppInput
            id="end-date"
            label="إلى تاريخ"
            type="date"
            v-model="customEndDate"
            @change="debouncedApplyFilters"
          />
        </div>
      </div>
    </div>

    <!-- أزرار التحكم -->
    <div
      class="flex justify-end space-x-2 space-x-reverse mt-6 border-t border-surface-border pt-4"
    >
      <!-- [حذف] تم حذف زر "تطبيق الفلاتر" -->
      <AppButton variant="outline" @click="resetFilters">إعادة تعيين</AppButton>
    </div>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'
// [إضافة] استيراد دالة الدي باونس
import { useDebounceFn } from '@vueuse/core'

// ... (باقي الاستيرادات كما هي)
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import RegionsDropdown from '@/components/forms/RegionsDropdown.vue'
import StationsDropdown from '@/components/forms/StationsDropdown.vue'
import DriversDropdown from '@/components/forms/DriversDropdown.vue'
import ProductsDropdown from '@/components/forms/ProductsDropdown.vue'
import OrderStatusesDropdown from '@/components/forms/OrderStatusesDropdown.vue'

const emit = defineEmits(['apply-filters']) // [تعديل] حذف 'reset-filters' لأننا سنتعامل معه داخليًا

const filters = ref({
  company_id: '',
  region_id: '',
  station_id: '',
  driver_id: '',
  product_id: '',
  order_status_id: '',
  notification_number: '',
})

const dateFilterMode = ref('period')
const daysPeriod = ref(7)
const customStartDate = ref('')
const customEndDate = ref('')

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// [تعديل] دالة applyFilters الآن لا تحتاج لمعاملات
const applyFilters = () => {
  let finalFilters = { ...filters.value }

  if (dateFilterMode.value === 'period' && daysPeriod.value > 0) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - (daysPeriod.value - 1))
    finalFilters.start_date = formatDate(startDate)
    finalFilters.end_date = formatDate(endDate)
  } else if (dateFilterMode.value === 'range') {
    finalFilters.start_date = customStartDate.value || null
    finalFilters.end_date = customEndDate.value || null
  }

  emit('apply-filters', finalFilters)
}

// [إضافة] إنشاء نسخة مؤجلة من دالة تطبيق الفلاتر
const debouncedApplyFilters = useDebounceFn(applyFilters, 500) // 500ms delay

const resetFilters = () => {
  filters.value = {
    company_id: '',
    region_id: '',
    station_id: '',
    driver_id: '',
    product_id: '',
    order_status_id: '',
    notification_number: '',
  }
  daysPeriod.value = 7
  customStartDate.value = ''
  customEndDate.value = ''
  dateFilterMode.value = 'period'

  // [تعديل] استدعاء applyFilters مباشرة بعد إعادة التعيين لإعادة تحميل القائمة الأصلية
  applyFilters()
}
</script>
