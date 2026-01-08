<template>
  <div class="bg-gray-100 font-sans print:bg-white">
    <div class="max-w-5xl mx-auto p-4">
      <!-- شريط الإجراءات (يختفي عند الطباعة) -->
      <div
        class="print-hide mb-6 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
      >
        <h1 class="text-lg font-bold text-gray-700">معاينة طباعة التقرير</h1>
        <AppButton @click="triggerPrint" :disabled="loading" variant="primary">
          <PrinterIcon class="w-5 h-5 ml-2" />
          اطبع الآن
        </AppButton>
      </div>

      <!-- رسائل التحميل والخطأ -->
      <div v-if="loading" class="text-center p-10 bg-white rounded-lg shadow">
        <p class="text-gray-600">جاري جلب بيانات التقرير...</p>
      </div>
      <div v-else-if="error" class="text-center p-10 bg-white rounded-lg shadow">
        <p class="text-red-500 font-semibold">{{ error }}</p>
      </div>

      <!-- محتوى التقرير بالتصميم الجديد -->
      <div v-else id="report-to-print" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- 1. رأس التقرير المبتكر -->
        <header class="relative text-white p-8 bg-wave">
          <div class="relative z-10 flex justify-between items-start">
            <div>
              <h2 class="text-3xl font-bold">تقرير طلبات الوقود</h2>
              <p class="text-base opacity-80 mt-1">شركة الأسطول لنقل الوقود ومشتقاته</p>
            </div>
            <div class="text-right text-sm">
              <p class="font-semibold">تاريخ الطباعة</p>
              <p class="font-mono opacity-90">{{ new Date().toLocaleDateString('ar-SA') }}</p>
            </div>
          </div>
          <div class="wave-shape"></div>
        </header>

        <main class="p-8">
          <!-- 2. قسم خيارات التقرير (الفلاتر) -->
          <section v-if="hasActiveFilters" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">خيارات التقرير المحددة</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(value, key) in displayFilters"
                :key="key"
                class="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <p class="text-xs text-gray-500 uppercase">{{ filterLabels[key] || key }}</p>
                <p class="text-sm font-bold text-gray-800">{{ value }}</p>
              </div>
            </div>
          </section>

          <!-- 3. جدول البيانات المحسّن -->
          <section>
            <div class="overflow-hidden rounded-lg border border-gray-200">
              <table class="w-full text-right">
                <thead class="bg-gray-800 text-sm text-white uppercase">
                  <tr>
                    <th
                      v-for="header in tableHeaders"
                      :key="header.key"
                      class="py-3 px-4 font-semibold"
                    >
                      {{ header.label }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <template v-if="reportData && reportData.length > 0">
                    <tr
                      v-for="item in reportData"
                      :key="item.id"
                      class="text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <td class="py-3 px-4 font-mono">{{ item.id }}</td>
                      <td class="py-3 px-4">
                        <span
                          v-if="item.status"
                          class="py-1 px-2.5 rounded-full font-semibold text-xs text-white"
                          :style="{ backgroundColor: item.status.color || '#6c757d' }"
                        >
                          {{ item.status.name }}
                        </span>
                      </td>
                      <td class="py-3 px-4">{{ item.driver?.name || 'N/A' }}</td>
                      <td class="py-3 px-4">{{ item.station?.name || 'N/A' }}</td>
                      <td class="py-3 px-4">{{ item.product?.name || 'N/A' }}</td>
                      <td class="py-3 px-4 font-mono font-semibold">
                        {{ new Intl.NumberFormat().format(item.quantity) }}
                      </td>
                      <td class="py-3 px-4 font-mono">{{ item.order_date }}</td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td :colspan="tableHeaders.length" class="text-center p-8">
                      <p class="text-gray-500">لا توجد بيانات تطابق خيارات التقرير المحددة.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <!-- 4. تذييل التقرير -->
        <footer class="p-6 text-center text-xs text-gray-500 border-t">
          <p>جميع الحقوق محفوظة © {{ new Date().getFullYear() }} شركة الأسطول</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- قسم السكريبت يبقى كما هو بدون أي تغيير ---
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import fuelOrderService from '@/services/fuelOrderService'
import companyService from '@/services/companyService'
import regionService from '@/services/regionService'
import stationService from '@/services/stationService'
import driverService from '@/services/driverService'
import productService from '@/services/productService'
import orderStatusService from '@/services/orderStatusService'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const reportData = ref([])
const displayFilters = ref({})

const hasActiveFilters = computed(() => Object.keys(displayFilters.value).length > 0)

onMounted(async () => {
  try {
    const reportResponse = await fuelOrderService.get(route.query)
    reportData.value = reportResponse.data.data

    const filters = route.query
    const labels = {}
    const promises = []
    const keys = []

    if (filters.company_id) {
      promises.push(companyService.find(filters.company_id))
      keys.push('company_id')
    }
    if (filters.region_id) {
      promises.push(regionService.find(filters.region_id))
      keys.push('region_id')
    }
    if (filters.station_id) {
      promises.push(stationService.find(filters.station_id))
      keys.push('station_id')
    }
    if (filters.driver_id) {
      promises.push(driverService.find(filters.driver_id))
      keys.push('driver_id')
    }
    if (filters.product_id) {
      promises.push(productService.find(filters.product_id))
      keys.push('product_id')
    }
    if (filters.order_status_id) {
      promises.push(orderStatusService.find(filters.order_status_id))
      keys.push('order_status_id')
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises)
      results.forEach((res, index) => {
        const key = keys[index]
        labels[key] = res.data.name
      })
    }

    if (filters.start_date) labels.start_date = filters.start_date
    if (filters.end_date) labels.end_date = filters.end_date

    displayFilters.value = labels
  } catch (e) {
    console.error('Failed to fetch printable report data:', e)
    error.value = 'حدث خطأ أثناء جلب بيانات التقرير.'
  } finally {
    loading.value = false
  }
})

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'status', label: 'الحالة' },
  { key: 'driver', label: 'السائق' },
  { key: 'station', label: 'المحطة' },
  { key: 'product', label: 'المنتج' },
  { key: 'quantity', label: 'الكمية' },
  { key: 'order_date', label: 'تاريخ الطلب' },
]

const filterLabels = {
  company_id: 'الشركة',
  region_id: 'المنطقة',
  station_id: 'المحطة',
  driver_id: 'السائق',
  product_id: 'المنتج',
  order_status_id: 'الحالة',
  start_date: 'من تاريخ',
  end_date: 'إلى تاريخ',
}

const triggerPrint = () => window.print()
</script>

<style>
/* تصميم الأمواج والتدرج اللوني */
.bg-wave {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  position: relative;
  overflow: hidden;
}

.wave-shape {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,149.3C672,117,768,107,864,128C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 5;
}

/* إعدادات الطباعة */
@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #report-to-print {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .bg-wave,
  thead.bg-gray-800 {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  thead.bg-gray-800,
  thead.bg-gray-800 * {
    color: white !important;
  }
  main {
    padding: 1.5rem !important;
  }
}
</style>
