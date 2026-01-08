<template>
  <div class="bg-gray-100 print:bg-white font-sans p-4" dir="rtl">
    <!-- شريط الإجراءات (يختفي عند الطباعة) -->
    <div
      class="print-hide max-w-6xl mx-auto mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
    >
      <h1 class="text-lg font-bold text-gray-700">معاينة طباعة أمر الحركة</h1>
      <AppButton
        @click="triggerPrint"
        :disabled="store.movementOrderReport.loading"
        variant="primary"
      >
        <PrinterIcon class="w-5 h-5 ml-2" />
        اطبع الآن
      </AppButton>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div
      v-if="store.movementOrderReport.loading"
      class="text-center p-20 bg-white rounded-lg shadow max-w-6xl mx-auto"
    >
      <p>جاري تحميل بيانات التقرير...</p>
    </div>
    <div
      v-else-if="store.movementOrderReport.error"
      class="text-center p-20 bg-white rounded-lg shadow max-w-6xl mx-auto"
    >
      <p class="text-red-500 font-semibold">{{ store.movementOrderReport.error }}</p>
    </div>

    <!-- محتوى التقرير الفعلي -->
    <div v-else-if="reportData" id="report-to-print" class="max-w-6xl mx-auto bg-white p-6">
      <div v-for="(orderChunk, pageIndex) in chunkedOrders" :key="pageIndex" class="printable-page">
        <!-- [تعديل] تم دمج التذييل داخل الجدول الرئيسي باستخدام tfoot -->
        <table class="w-full report-container border-collapse">
          <!-- 1. رأس الجدول (Header) -->
          <thead class="report-header">
            <tr>
              <th class="p-0 align-top" :colspan="9">
                <!-- الهيدر العلوي -->
                <div class="grid grid-cols-12 gap-x-4 mb-4 pb-4 border-b-2 border-gray-300">
                  <div class="col-span-4 flex">
                    <img src="/logo2.png" alt="شعار الشركة" class="h-20 w-20 ml-4" />
                    <div class="text-right">
                      <h2 class="text-2xl font-bold">شركة الأسطول</h2>
                      <p class="font-semibold text-sm">لنقل الوقود ومشتقاته</p>
                      <p class="font-mono text-xs mt-1 ltr-text">📞 091 544 5681</p>
                      <p class="text-xs">📍 العنوان، ليبيا - بنغازي</p>
                    </div>
                  </div>
                  <div class="col-span-5 flex flex-col items-center justify-start">
                    <div class="border-2 border-black py-2 px-8 bg-gray-200">
                      <h1 class="text-3xl font-bold">أمر حركة</h1>
                    </div>
                    <p class="text-lg font-mono mt-1">{{ reportData.reference_number }}</p>
                  </div>
                  <div
                    class="col-span-3 border border-gray-400 rounded-tl-xl rounded-br-xl p-2 text-xs text-center flex items-center justify-center shadow-offset-dark"
                  >
                    <p>
                      يتحمل السائق كامل المسؤولية القانونية والعملية عن حمولة الشاحنة اعتباراً من
                      لحظة مغادرته المستودع، ويلتزم بالمحافظة عليها وضمان سلامتها حتى تسليمها في
                      موقع التفريغ المذكور أدناه، دون أي إعفاء من المسؤولية تحت أي ظرف.
                    </p>
                  </div>
                </div>
                <!-- معلومات الإخوة والتاريخ -->
                <div class="grid grid-cols-2 gap-x-8 mb-4 text-lg">
                  <div class="flex items-baseline">
                    <strong class="font-bold whitespace-nowrap">الإخوة:</strong>
                    <span
                      class="w-full border-b-2 border-dotted border-black mx-2 relative -bottom-1 text-center font-bold"
                      >{{ reportData.company.name }}</span
                    >
                  </div>
                  <div class="flex items-baseline">
                    <strong class="font-bold whitespace-nowrap">التاريخ:</strong>
                    <span
                      class="w-full border-b-2 border-dotted border-black mx-2 relative -bottom-1 text-center font-mono"
                      >{{ reportData.report_date }}</span
                    >
                  </div>
                </div>
              </th>
            </tr>
            <tr class="text-sm">
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-12">م</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-48">اسم السائق</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-32">رقم السيارة</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-32">رقم المقطورة</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-24">الحمولة</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-24">نوع الوقود</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-auto">المحطة</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-32">رقم الإشعار</th>
              <th class="border-2 border-black p-2 font-bold bg-gray-100 w-32">رقم الهاتف</th>
            </tr>
          </thead>

          <!-- 2. محتوى الجدول (Body) -->
          <tbody class="report-body text-sm">
            <tr v-for="(order, orderIndex) in orderChunk" :key="order.id">
              <!-- [تعديل] حساب الترقيم التسلسلي الصحيح -->
              <td class="border-2 border-black p-2 text-center">
                {{ pageIndex * 10 + orderIndex + 1 }}
              </td>

              <td class="border-2 border-black p-2 text-center">{{ order.driver?.name }}</td>
              <td class="border-2 border-black p-2 text-center">
                {{ order.driver?.truck?.truck_number }}
              </td>
              <td class="border-2 border-black p-2 text-center">
                {{ order.driver?.truck?.trailer_number }}
              </td>
              <td class="border-2 border-black p-2 text-center">{{ parseInt(order.quantity) }}</td>
              <td class="border-2 border-black p-2 text-center font-semibold">
                {{ order.product?.name }}
              </td>
              <td class="border-2 border-black p-2 text-center">{{ order.station?.name }}</td>
              <td class="border-2 border-black p-2 text-center">{{ order.notification_number }}</td>
              <td class="border-2 border-black p-2 text-center">
                {{ order.driver?.phone_number }}
              </td>
            </tr>
            <!-- [إضافة] إضافة صفوف فارغة لإكمال 10 صفوف في كل صفحة -->
            <template v-if="orderChunk.length < 10">
              <tr v-for="n in 10 - orderChunk.length" :key="`empty-${n}`">
                <td class="border-2 border-black p-2 text-center empty-row-filler">&nbsp;</td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
                <td class="border-2 border-black p-2 empty-row-filler"></td>
              </tr>
            </template>
          </tbody>

          <!-- 3. تذييل الجدول (Footer) -->
          <tfoot class="report-footer">
            <tr>
              <td :colspan="9" class="p-0">
                <!-- مساحة فارغة فوق التذييل لتجنب التداخل -->
                <div class="h-24"></div>
                <!-- حاوية التذييل الفعلية -->
                <div class="grid grid-cols-2 gap-x-8 items-end">
                  <!-- توقيع المكلف -->
                  <div class="flex flex-col items-center">
                    <span class="w-full border-b-2 border-dotted border-black"></span>
                    <strong class="mt-2 font-bold">توقيع المكلف</strong>
                  </div>
                  <!-- اعتماد الختم -->
                  <div class="relative flex flex-col items-center">
                    <!-- صورة الختم -->
                    <img
                      src="/stamp.png"
                      alt="ختم الشركة"
                      class="absolute bottom-2 h-28 w-28 opacity-90"
                    />
                    <span class="w-full border-b-2 border-dotted border-black"></span>
                    <strong class="mt-2 font-bold">اعتماد الختم</strong>
                  </div>
                </div>
                <div class="page-number"></div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// ... السكريبت يبقى كما هو بدون تغيير
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import AppButton from '@/components/ui/AppButton.vue'
import { PrinterIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const store = useReportStore()
const reportData = computed(() => store.movementOrderReport.data)

const chunkedOrders = computed(() => {
  if (!reportData.value || !reportData.value.orders) {
    return []
  }
  const chunkSize = 10 // عدد الصفوف في كل صفحة
  const chunks = []
  const orders = reportData.value.orders
  for (let i = 0; i < orders.length; i += chunkSize) {
    chunks.push(orders.slice(i, i + chunkSize))
  }
  return chunks
})

onMounted(() => {
  store.movementOrderReport.data = null
  store.movementOrderReport.error = null
  const { date, company_id } = route.query
  if (!date || !company_id) {
    store.movementOrderReport.error = 'بيانات التقرير (التاريخ والشركة) غير متوفرة في الرابط.'
    return
  }
  store.fetchMovementOrderReport({ date, company_id }).catch((err) => console.error(err))
})

const triggerPrint = () => window.print()
</script>

<style>
.ltr-text {
  direction: ltr;
  text-align: center; /* إعادة المحاذاة للمنتصف بعد تغيير الاتجاه */
}
.shadow-offset-dark {
  box-shadow: -4px -4px 5px 0px rgb(0 0 0 / 0.5);
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
    border: none !important;
    box-shadow: none !important;
  }

  @page {
    size: A4 landscape;
    margin: 1.5cm;
  }

  /* --- [تمت الإضافة هنا] --- */
  .printable-page {
    page-break-before: always;
  }
  /* منع فاصل الصفحة قبل العنصر الأول */
  #report-to-print > .printable-page:first-child {
    page-break-before: avoid;
  }
  /* --- [نهاية الإضافة] --- */

  .page-break-inside-avoid {
    page-break-inside: avoid;
  }

  /* --- [بداية التعديل هنا] --- */
  /* ضمان تكرار رأس وتذييل الجدول على كل صفحة */
  .report-header {
    display: table-header-group;
  }
  .report-footer {
    display: table-footer-group;
  }
  /* إزالة أي حدود أو padding من الخلية الحاوية للتذييل */
  .report-footer td {
    border: none !important;
    padding: 0 !important;
  }
  /* --- [نهاية التعديل هنا] --- */

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

/* CSS لإجبار الصفوف الفارغة على ملء المساحة ودفع التذييل للأسفل */
.empty-row-filler {
  height: 30px; /* ارتفاع تقريبي للصف الواحد */
}

#report-to-print {
  counter-reset: page;
}
</style>
