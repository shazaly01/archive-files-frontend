<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-black text-white tracking-tight">تقرير ملخص الشركات</h1>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة احترافية
        </AppButton>

        <AppButton
          @click="handleRefresh"
          :loading="loading"
          variant="secondary"
          class="border-gray-600 text-gray-200"
        >
          <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
          تحديث
        </AppButton>
      </div>
    </div>

    <div v-if="grandSummary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-gray-500 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-gray-400/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي العقود الكلية
        </div>
        <div class="text-2xl font-black text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]">
          {{ formatCurrency(grandSummary.grand_total_contract_value) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-cyan-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-cyan-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي القيمة المستحقة
          <!-- 1. تم تغيير النص هنا -->
        </div>
        <div class="text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {{ formatCurrency(grandSummary.grand_total_due_value) }}
          <!-- 2. تم تغيير المفتاح هنا -->
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي المدفوعات
        </div>
        <div
          class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        >
          {{ formatCurrency(grandSummary.grand_total_paid) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-rose-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-rose-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي المتبقي
        </div>
        <div class="text-2xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]">
          {{ formatCurrency(grandSummary.grand_total_remaining) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-fuchsia-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-fuchsia-200/60 uppercase tracking-widest mb-2 font-bold">
          الشركات / المشاريع
        </div>
        <div
          class="text-2xl font-black text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
        >
          {{ grandSummary.total_companies }} <span class="text-sm font-normal">شركة</span> /
          {{ grandSummary.total_projects }} <span class="text-sm font-normal">مشروع</span>
        </div>
      </AppCard>
    </div>

    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="companiesSummary" :is-loading="loading">
        <template #cell-name="{ item }">
          <span
            class="font-bold text-cyan-300 hover:text-cyan-100 cursor-pointer transition-all duration-300"
          >
            {{ item.name }}
          </span>
        </template>

        <template #cell-total_contract_value="{ item }">
          <span class="text-gray-400 font-medium">{{
            formatCurrency(item.total_contract_value)
          }}</span>
        </template>

        <template #cell-total_due_value="{ item }">
          <span class="text-gray-100 font-medium">{{ formatCurrency(item.total_due_value) }}</span>
        </template>

        <template #cell-total_paid="{ item }">
          <span class="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
            {{ formatCurrency(item.total_paid) }}
          </span>
        </template>

        <template #cell-total_remaining="{ item }">
          <span
            class="font-black drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]"
            :class="item.total_remaining > 0 ? 'text-rose-400' : 'text-gray-500'"
          >
            {{ formatCurrency(item.total_remaining) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

// استيراد المكونات
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const reportStore = useReportStore()
const { companiesSummary, grandSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'الشركة' },
  { key: 'license_number', label: 'رقم الرخصة' },
  { key: 'projects_count', label: 'المشاريع' },
  { key: 'total_contract_value', label: 'قيمة العقود الكلية' },
  { key: 'total_due_value', label: 'القيمة المستحقة' },
  { key: 'total_paid', label: 'المدفوع' },
  { key: 'total_remaining', label: 'المتبقي' },
]

const handleRefresh = () => {
  reportStore.fetchCompaniesSummary()
}

// دالة الطباعة الجديدة التي تفتح النافذة المستقلة
const handlePrint = () => {
  if (!grandSummary.value || companiesSummary.value.length === 0) return

  // حفظ البيانات للنافذة الجديدة
  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: grandSummary.value,
      companiesSummary: companiesSummary.value,
    }),
  )

  // فتح مسار الطباعة الذي عرفناه في الـ Router خارج الـ Layout
  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  handleRefresh()
})
</script>

<style scoped>
/* إضافة تأثير زجاجي خفيف وتحسين الوضوح */
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-4 border-b border-gray-800/50;
}
</style>
