<template>
  <div class="bg-gray-100 print:bg-white font-sans p-4" dir="rtl">
    <!-- 1. شريط الإجراءات مع زر الطباعة (يختفي عند الطباعة) -->
    <div
      class="print-hide max-w-6xl mx-auto mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
    >
      <h1 class="text-lg font-bold text-gray-700">معاينة طباعة تقرير السائقين</h1>
      <AppButton @click="triggerPrint" :disabled="isLoading" variant="primary">
        <PrinterIcon class="w-5 h-5 ml-2" />
        اطبع الآن
      </AppButton>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div v-if="isLoading" class="text-center p-20 bg-white rounded-lg shadow max-w-6xl mx-auto">
      <p>جاري تحميل بيانات التقرير للطباعة...</p>
    </div>
    <div v-else-if="error" class="text-center p-20 bg-white rounded-lg shadow max-w-6xl mx-auto">
      <p class="text-red-500 font-semibold">{{ error }}</p>
    </div>
    <div
      v-else-if="!reportData || reportData.length === 0"
      class="text-center p-20 bg-white rounded-lg shadow max-w-6xl mx-auto"
    >
      <p class="text-gray-500">لا توجد بيانات لطباعتها.</p>
    </div>

    <!-- محتوى التقرير الفعلي للطباعة -->
    <div v-else id="report-to-print" class="max-w-6xl mx-auto bg-white p-6">
      <table class="w-full report-container border-collapse">
        <!-- رأس الجدول (Header) -->
        <thead class="report-header">
          <tr>
            <th class="p-0 align-top" :colspan="tableHeaders.length">
              <div class="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-300">
                <!-- القسم الأيمن: عنوان التقرير والتاريخ -->
                <div class="flex flex-col items-center justify-center">
                  <div class="border-2 border-black py-2 px-8 bg-gray-200">
                    <h1 class="text-3xl font-bold">تقرير السائقين</h1>
                  </div>
                  <p class="text-sm text-gray-600 mt-2">
                    تاريخ الطباعة:
                    {{
                      new Date().toLocaleDateString('ar-LY', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                    }}
                  </p>
                </div>

                <!-- القسم الأيسر: الشعار واسم الشركة -->
                <div class="flex items-center">
                  <div class="text-left ml-4">
                    <h2 class="text-2xl font-bold">شركة الأسطول</h2>
                    <p class="font-semibold text-sm">لنقل الوقود ومشتقاته</p>
                  </div>
                  <img src="/logo2.png" alt="شعار الشركة" class="h-20 w-20" />
                </div>
              </div>
            </th>
          </tr>
          <tr class="text-sm">
            <th
              v-for="header in tableHeaders"
              :key="header.key"
              class="border-2 border-black p-2 font-bold bg-gray-100"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <!-- محتوى الجدول -->
        <tbody class="report-body text-sm">
          <tr v-for="(item, index) in reportData" :key="item.id" class="page-break-inside-avoid">
            <td class="border-2 border-black p-2 text-center">{{ index + 1 }}</td>
            <td class="border-2 border-black p-2 text-center">{{ item.name }}</td>
            <td class="border-2 border-black p-2 text-center">{{ item.license_number }}</td>
            <td class="border-2 border-black p-2 text-center ltr-text">{{ item.phone_number }}</td>
            <td class="border-2 border-black p-2 text-center">
              {{ item.truck?.truck_number || '--' }}
            </td>
            <td class="border-2 border-black p-2 text-center">
              {{ item.truck?.truck_type || '--' }}
            </td>
            <td class="border-2 border-black p-2 text-center">
              {{ item.truck?.trailer_number || '--' }}
            </td>
          </tr>
        </tbody>
        <!-- تذييل الجدول -->
        <tfoot class="report-footer">
          <tr>
            <td :colspan="tableHeaders.length" class="p-0">
              <div class="page-number"></div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
// --- [تم التعديل هنا] ---
import { useReportStore } from '@/stores/reportStore' // استيراد المخزن الصحيح
// --- [نهاية التعديل] ---
import { storeToRefs } from 'pinia'
import AppButton from '@/components/ui/AppButton.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
// --- [تم التعديل هنا] ---
const reportStore = useReportStore() // استخدام المخزن الصحيح

// استهداف البيانات الصحيحة من المخزن
const { driverReport } = storeToRefs(reportStore)
const reportData = computed(() => driverReport.value.data)
const isLoading = computed(() => driverReport.value.loading)
// --- [نهاية التعديل] ---
const error = ref(null)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم السائق' },
  { key: 'license_number', label: 'رقم الرخصة' },
  { key: 'phone_number', label: 'رقم الهاتف' },
  { key: 'truck_number', label: 'رقم الشاحنة' },
  { key: 'truck_type', label: 'نوع الشاحنة' },
  { key: 'trailer_number', label: 'رقم المقطورة' },
]

onMounted(async () => {
  try {
    // --- [تم التعديل هنا] ---
    // جلب كل البيانات للتقرير عن طريق تمرير per_page: -1
    const filters = { ...route.query, per_page: -1 }
    // استدعاء الدالة الصحيحة من المخزن الصحيح
    await reportStore.fetchDriverReport(filters)
    // --- [نهاية التعديل] ---
  } catch (err) {
    error.value = 'فشل تحميل بيانات التقرير.'
    console.error(err)
  }
})

const triggerPrint = () => window.print()
</script>

<style>
/* ... (لا تغييرات في قسم الـ style) ... */
.ltr-text {
  direction: ltr;
  text-align: center;
}
@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
  }
  #report-to-print {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  @page {
    size: A4 landscape;
    margin: 1.5cm;
  }
  .page-break-inside-avoid {
    page-break-inside: avoid;
  }
  .report-header {
    display: table-header-group;
  }
  .report-footer {
    display: table-footer-group;
  }
  .report-footer td {
    border: none !important;
    padding: 0 !important;
  }
  .page-number::before {
    counter-increment: page;
    content: 'صفحة ' counter(page);
    position: fixed;
    bottom: 0.5cm;
    left: 1.5cm;
    font-size: 9pt;
    color: #888;
  }
  table,
  .bg-gray-100,
  .bg-gray-200 {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .border-black {
    border-color: #000 !important;
  }
}
#report-to-print {
  counter-reset: page;
}
</style>
