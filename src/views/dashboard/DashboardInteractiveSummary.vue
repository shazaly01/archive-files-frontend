<!-- src/views/dashboard/InteractiveSummary.vue (النسخة النهائية والمحسّنة) -->
<template>
  <div class="mt-8">
    <h2 class="text-2xl font-semibold text-text-primary mb-4">ملخص الطلبات التفاعلي</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- العمود الأيسر: قائمة ملخص الحالات -->
      <AppCard class="lg:col-span-1">
        <h3 class="font-bold text-lg mb-4 border-b border-surface-border pb-2">حالات الطلبات</h3>
        <div v-if="isLoading" class="space-y-2">
          <div
            v-for="i in 5"
            :key="`summary-skeleton-${i}`"
            class="h-8 bg-surface-ground rounded animate-pulse"
          ></div>
        </div>
        <ul v-else-if="orderSummary && orderSummary.length > 0" class="space-y-2">
          <li
            v-for="status in orderSummary"
            :key="status.id"
            @click="handleStatusClick(status)"
            class="flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors"
            :class="selectedStatusId === status.id ? 'bg-primary/20' : 'hover:bg-surface-section'"
          >
            <span class="font-semibold">{{ status.name }}</span>
            <span
              class="px-3 py-1 text-sm font-bold rounded-full bg-surface-ground text-text-primary"
              >{{ status.count }}</span
            >
          </li>
        </ul>
        <p v-else class="text-text-muted">لا توجد بيانات لعرضها.</p>
      </AppCard>

      <!-- العمود الأيمن: تفاصيل الطلبات للحالة المحددة -->
      <AppCard class="lg:col-span-2">
        <h3 class="font-bold text-lg mb-4 border-b border-surface-border pb-2">
          تفاصيل الطلبات:
          <span class="text-primary">{{ selectedStatusName || 'لم يتم تحديد حالة' }}</span>
        </h3>

        <div v-if="detailsLoading" class="text-center py-10">
          <svg
            class="animate-spin h-8 w-8 text-primary mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <AppTable
          v-else-if="orderDetails.length > 0"
          :headers="detailsTableHeaders"
          :items="orderDetails"
          :row-clickable="false"
        >
          <!-- ==================== [بداية التعديلات] ==================== -->

          <!-- عرض اسم المحطة -->
          <template #cell-station="{ item }">{{ item.station?.name || 'N/A' }}</template>

          <!-- عرض اسم الشركة -->
          <template #cell-company="{ item }">{{ item.station?.company?.name || 'N/A' }}</template>

          <!-- عرض اسم السائق -->
          <template #cell-driver="{ item }">{{ item.driver?.name || 'N/A' }}</template>

          <!-- عرض رقم الإشعار -->
          <template #cell-notification_number="{ item }">{{
            item.notification_number || '-'
          }}</template>

          <!-- عرض قائمة تغيير الحالة -->
          <template #cell-actions="{ item }">
            <div class="w-40">
              <OrderStatusesDropdown
                :id="`status-update-${item.id}`"
                label=""
                :model-value="item.status.id"
                @update:model-value="(newStatusId) => handleStatusChange(item, newStatusId)"
              />
            </div>
          </template>

          <!-- ==================== [نهاية التعديلات] ==================== -->
        </AppTable>

        <div v-else class="text-center py-10 text-text-muted">
          <p>
            {{
              selectedStatusId
                ? 'لا توجد طلبات لهذه الحالة.'
                : 'الرجاء النقر على حالة من القائمة لعرض تفاصيلها.'
            }}
          </p>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import { useFuelOrderStore } from '@/stores/fuelOrderStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import OrderStatusesDropdown from '@/components/forms/OrderStatusesDropdown.vue'

// 1. تعريف الحدث الذي سيتم إطلاقه
const emit = defineEmits(['status-updated'])

// تعريف الـ props
const props = defineProps({
  orderSummary: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: true },
})

// إعدادات الـ Stores
const reportStore = useReportStore()
const fuelOrderStore = useFuelOrderStore()
const toast = useToast()

// حالة عرض التفاصيل
const selectedStatusId = ref(null)
const selectedStatusName = ref(null)
const detailsLoading = ref(false)

const { orderReport } = storeToRefs(reportStore)
const orderDetails = computed(() => orderReport.value.data)

// تحديث أعمدة جدول التفاصيل
const detailsTableHeaders = [
  { key: 'id', label: '#' },
  { key: 'station', label: 'المحطة' },
  { key: 'company', label: 'الشركة' },
  { key: 'driver', label: 'السائق' },
  { key: 'quantity', label: 'الكمية' },
  { key: 'notification_number', label: 'رقم الإشعار' },
  { key: 'order_date', label: 'تاريخ الطلب' },
  { key: 'actions', label: 'تغيير الحالة', class: 'text-left' },
]

// دالة جلب تفاصيل الطلبات عند النقر
const handleStatusClick = async (status) => {
  selectedStatusId.value = status.id
  selectedStatusName.value = status.name
  detailsLoading.value = true
  try {
    await reportStore.fetchOrderReport({ order_status_id: status.id })
  } catch (err) {
    toast.error(`فشل تحميل تفاصيل طلبات الحالة: ${status.name}`)
  } finally {
    detailsLoading.value = false
  }
}

// دالة تحديث حالة الطلب
const handleStatusChange = async (order, newStatusId) => {
  // منع التحديث إذا لم تتغير الحالة
  if (order.status.id === newStatusId) return

  try {
    // استدعاء دالة التحديث من الـ store
    await fuelOrderStore.updateFuelOrder(order.id, { order_status_id: newStatusId })

    toast.success(`تم تحديث حالة الطلب #${order.id} بنجاح.`)

    // إعادة تحميل تفاصيل الحالة الحالية لتعكس التغييرات
    await reportStore.fetchOrderReport({ order_status_id: selectedStatusId.value })

    // 2. إطلاق الحدث لإعلام المكون الأب بضرورة تحديث الإحصائيات
    emit('status-updated')
  } catch (err) {
    toast.error(`فشل تحديث حالة الطلب #${order.id}.`)
  }
}
</script>
