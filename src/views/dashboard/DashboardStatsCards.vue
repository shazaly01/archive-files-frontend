<!-- src/views/dashboard/DashboardStatsCards.vue -->
<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- حالة التحميل: عرض الهياكل العظمية -->
    <template v-if="isLoading">
      <SkeletonCard v-for="i in 4" :key="`skeleton-${i}`" />
    </template>

    <!-- عرض البيانات الفعلية بعد التحميل -->
    <template v-else-if="stats">
      <StatCard
        title="إجمالي الشركات"
        :value="stats.companies_count"
        :icon="BuildingOffice2Icon"
        icon-bg-color="bg-sky-500/20"
        icon-color="text-sky-400"
      />
      <StatCard
        title="إجمالي المشاريع"
        :value="stats.projects_count"
        :icon="ClipboardDocumentListIcon"
        icon-bg-color="bg-amber-500/20"
        icon-color="text-amber-400"
      />
      <StatCard
        title="قيمة العقود الإجمالية"
        :value="formatCurrency(stats.total_due_value)"
        :icon="BanknotesIcon"
        icon-bg-color="bg-green-500/20"
        icon-color="text-green-400"
      />
      <StatCard
        title="إجمالي المدفوعات"
        :value="formatCurrency(stats.total_payments_value)"
        :icon="ReceiptPercentIcon"
        icon-bg-color="bg-indigo-500/20"
        icon-color="text-indigo-400"
      />
    </template>
  </div>
</template>

<script setup>
import StatCard from '@/components/ui/StatCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
// --- [تعديل 1]: استيراد الأيقونات الجديدة ---
import {
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from '@heroicons/vue/24/outline'

// تعريف الـ props (يبقى كما هو)
defineProps({
  stats: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
})

// --- [تعديل 2]: إضافة دالة لتنسيق العملة ---
function formatCurrency(value) {
  if (value === null || value === undefined) return 'N/A'

  // 1. تنسيق الرقم فقط مع فواصل الآلاف وبدون أرقام عشرية
  const numberPart = new Intl.NumberFormat('en-US', {
    // 'ar-EG' يعطي فواصل آلاف عربية جيدة
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

  // 2. إضافة الرمز يدويًا مع مسافة قبله
  return `${numberPart} د.ل`
}
</script>
