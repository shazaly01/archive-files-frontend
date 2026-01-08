<template>
  <div class="print-landscape-container bg-white text-black p-8 font-sans" dir="rtl">
    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-6 mb-8">
      <div class="flex items-center gap-6">
        <img src="/MainLogo2.png" alt="Logo" class="w-20 h-20 object-contain" />
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">نظام حصر الديون</h1>
          <p class="text-lg font-bold text-gray-600">تقرير كشف حساب شركة تفصيلي</p>
        </div>
      </div>

      <div class="text-left text-sm font-medium text-gray-500 border-r-2 border-gray-200 pr-6">
        <p>تاريخ التقرير: {{ currentDate }}</p>
        <p>وقت الاستخراج: {{ currentTime }}</p>
        <p>الصفحة: 1 من 1</p>
      </div>
    </div>

    <div v-if="reportData?.company" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase mb-1">اسم الشركة</p>
          <p class="text-xl font-black text-gray-900">{{ reportData.company.name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase mb-1">الرقم الضريبي</p>
          <p class="text-lg font-bold text-gray-800 font-mono">
            {{ reportData.company.tax_number || '-' }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold uppercase mb-1">رئيس مجلس الادارة</p>
          <p class="text-lg font-bold text-gray-800">{{ reportData.company.owner_name || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="border-2 border-gray-100 p-4 rounded-lg flex flex-col justify-center">
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي العقود الكلية</p>
        <p class="text-2xl font-black text-gray-700">
          {{ formatCurrency(reportData?.summary?.total_contract_value || 0) }}
        </p>
      </div>

      <div class="border-2 border-gray-100 p-4 rounded-lg flex flex-col justify-center">
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي القيمة المستحقة</p>
        <!-- 1. تغيير النص -->
        <p class="text-2xl font-black text-black">
          {{ formatCurrency(reportData?.summary?.total_due_value || 0) }}
          <!-- 2. تغيير المفتاح -->
        </p>
      </div>

      <div class="border-2 border-gray-100 p-4 rounded-lg flex flex-col justify-center">
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">إجمالي المقبوضات</p>
        <p class="text-2xl font-black text-emerald-700">
          {{ formatCurrency(reportData?.summary?.total_payments_received || 0) }}
        </p>
      </div>

      <div class="border-2 border-gray-100 p-4 rounded-lg flex flex-col justify-center">
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">الرصيد المتبقي</p>
        <p class="text-2xl font-black text-rose-700">
          {{ formatCurrency(reportData?.summary?.total_remaining || 0) }}
        </p>
      </div>

      <div class="border-2 border-gray-100 p-4 rounded-lg flex flex-col justify-center">
        <p class="text-gray-500 text-xs font-bold mb-1 uppercase">عدد المشاريع</p>
        <p class="text-2xl font-black text-gray-800">
          {{ reportData?.projects?.length || 0 }}
          <span class="text-sm font-normal text-gray-500">مشروع</span>
        </p>
      </div>
    </div>

    <div class="w-full mb-8">
      <table class="w-full text-right border-collapse table-auto">
        <thead>
          <tr class="bg-gray-800 text-white print:bg-gray-200 print:text-black">
            <th class="p-3 border border-gray-800 w-12 text-center">#</th>
            <th class="p-3 border border-gray-800">اسم المشروع</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">قيمة العقد</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">القيمة المستحقة</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">إجمالي المدفوع</th>
            <th class="p-3 border border-gray-800 w-48 font-bold">المتبقي</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr
            v-for="(project, index) in reportData?.projects"
            :key="project.id"
            class="border-b border-gray-300"
          >
            <td class="p-3 border border-gray-300 text-center font-bold">{{ index + 1 }}</td>
            <td class="p-3 border border-gray-300 font-bold text-base">{{ project.name }}</td>

            <td class="p-3 border border-gray-300 text-gray-600">
              {{ formatCurrency(project.contract_value) }}
            </td>

            <td class="p-3 border border-gray-300">
              {{ formatCurrency(project.due_value) }}
            </td>
            <td class="p-3 border border-gray-300 text-emerald-800 font-bold">
              {{ formatCurrency(project.total_paid) }}
            </td>
            <td class="p-3 border border-gray-300 font-black text-rose-800">
              {{ formatCurrency(project.due_value - project.total_paid) }}
            </td>
          </tr>

          <tr v-if="!reportData?.projects?.length">
            <td colspan="5" class="p-8 text-center text-gray-500">
              لا توجد مشاريع مسجلة لهذه الشركة
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

const reportData = ref(null)
const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG')

onMounted(() => {
  // قراءة البيانات المرسلة من الصفحة السابقة
  // سنستخدم المفتاح 'printStatementData' لتمييزه عن التقرير الآخر
  const savedData = sessionStorage.getItem('printStatementData')

  if (savedData) {
    try {
      reportData.value = JSON.parse(savedData)

      // تأخير بسيط لضمان اكتمال الرندر ثم الطباعة
      setTimeout(() => {
        window.print()
      }, 1000)
    } catch (e) {
      console.error('Error parsing print data', e)
    }
  }
})
</script>

<style scoped>
/* إعدادات الطباعة */
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
}

.print-landscape-container {
  width: 100%;
  max-width: 29.7cm; /* عرض A4 Landscape */
  margin: 0 auto;
  min-height: 21cm;
}

table {
  border-spacing: 0;
  width: 100%;
}
</style>
