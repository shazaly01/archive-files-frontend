<template>
  <div class="print-landscape-container bg-white text-black p-8 font-sans" dir="rtl">
    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-6 mb-8">
      <div class="flex items-center gap-6">
        <img src="/MainLogo2.png" alt="Logo" class="w-20 h-20 object-contain" />
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">نظام حصر الديون</h1>
          <p class="text-lg font-bold text-gray-600">تقرير ملخص الأرصدة والمديونيات الشامل</p>
        </div>
      </div>

      <div class="text-left text-sm font-medium text-gray-500 border-r-2 border-gray-200 pr-6">
        <p>تاريخ التقرير: {{ currentDate }}</p>
        <p>وقت الاستخراج: {{ currentTime }}</p>
        <p>الصفحة: 1 من 1</p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-10">
      <div
        class="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/50 flex flex-col justify-center"
      >
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي العقود الكلية</p>
        <p class="text-2xl font-black text-gray-700">
          {{ formatCurrency(grandSummary?.grand_total_contract_value) }}
        </p>
      </div>

      <div
        class="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/50 flex flex-col justify-center"
      >
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي القيمة المستحقة</p>
        <!-- 1. تغيير النص -->
        <p class="text-2xl font-black text-black">
          {{ formatCurrency(grandSummary?.grand_total_due_value) }}
          <!-- 2. تغيير المفتاح -->
        </p>
      </div>

      <div
        class="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/50 flex flex-col justify-center"
      >
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي المدفوعات</p>
        <p class="text-2xl font-black text-emerald-700">
          {{ formatCurrency(grandSummary?.grand_total_paid) }}
        </p>
      </div>

      <div
        class="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/50 flex flex-col justify-center"
      >
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي المتبقي</p>
        <p class="text-2xl font-black text-rose-700">
          {{ formatCurrency(grandSummary?.grand_total_remaining) }}
        </p>
      </div>

      <div
        class="border-2 border-gray-100 p-4 rounded-lg bg-gray-50/50 flex flex-col justify-center"
      >
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إحصائيات الكيانات</p>
        <p class="text-xl font-black text-black">
          {{ grandSummary?.total_companies }} شركة / {{ grandSummary?.total_projects }} مشروع
        </p>
      </div>
    </div>

    <div class="w-full">
      <table class="w-full text-right border-collapse table-auto">
        <thead>
          <tr class="bg-gray-800 text-white print:bg-gray-200 print:text-black">
            <th class="p-3 border border-gray-800 w-12 text-center">#</th>
            <th class="p-3 border border-gray-800 min-w-[250px]">اسم الشركة</th>
            <th class="p-3 border border-gray-800 w-40">رقم الرخصة</th>
            <th class="p-3 border border-gray-800 w-24 text-center">المشاريع</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">قيمة العقد</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">القيمة المستحقة</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">المدفوع</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">المتبقي</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="(item, index) in items" :key="item.id" class="border-b border-gray-300">
            <td class="p-3 border border-gray-300 text-center font-bold">{{ index + 1 }}</td>
            <td class="p-3 border border-gray-300 font-black text-base">{{ item.name }}</td>
            <td class="p-3 border border-gray-300">{{ item.license_number }}</td>
            <td class="p-3 border border-gray-300 text-center font-bold">
              {{ item.projects_count }}
            </td>
            <td class="p-3 border border-gray-300 text-gray-600">
              {{ formatCurrency(item.total_contract_value) }}
            </td>

            <td class="p-3 border border-gray-300">
              {{ formatCurrency(item.total_due_value) }}
            </td>
            <td class="p-3 border border-gray-300 text-emerald-800 font-bold">
              {{ formatCurrency(item.total_paid) }}
            </td>
            <td class="p-3 border border-gray-300 font-black text-rose-800">
              {{ formatCurrency(item.total_remaining) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-16 grid grid-cols-3 gap-8 text-center pt-8 border-t border-gray-100">
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-lg">المحاسب المسؤول</p>
        <div class="border-b border-gray-400 w-48 mx-auto"></div>
      </div>
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-lg">المراجعة والتدقيق</p>
        <div class="border-b border-gray-400 w-48 mx-auto"></div>
      </div>
      <div class="space-y-12">
        <p class="font-bold text-gray-800 text-lg">يعتمد / المدير العام</p>
        <div class="border-b border-gray-400 w-48 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const grandSummary = ref(null)
const items = ref([])
const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG')

onMounted(() => {
  const savedData = sessionStorage.getItem('printData')
  if (savedData) {
    const parsed = JSON.parse(savedData)
    grandSummary.value = parsed.grandSummary
    items.value = parsed.companiesSummary

    // الانتظار للتأكد من رندر المحتوى ثم الطباعة
    setTimeout(() => {
      window.print()
    }, 1000)
  }
})
</script>

<style scoped>
/* إعدادات إجبار الطباعة العرضية Landscape */
@media print {
  @page {
    size: A4 landscape;
    margin: 1cm;
  }

  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* إخفاء أي هوامش ترويسة المتصفح (اختياري) */
  header,
  footer {
    display: none !important;
  }
}

.print-landscape-container {
  width: 100%;
  max-width: 29.7cm; /* عرض ورقة A4 Landscape */
  margin: 0 auto;
  min-height: 21cm;
}

/* توزيع الأعمدة بارتياح */
table {
  border-spacing: 0;
  width: 100%;
}

th,
td {
  word-break: break-word;
}
</style>
