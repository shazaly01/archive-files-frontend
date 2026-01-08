<template>
  <AppCard class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Risk Zone -->
      <div class="border-e-0 md:border-e md:pe-6 border-danger/20">
        <h3 class="text-xl font-bold text-danger mb-4 flex items-center gap-2">
          <ShieldExclamationIcon class="w-6 h-6" />
          منطقة الخطر
        </h3>
        <div class="space-y-3">
          <p v-if="!hasRisks" class="text-center py-10 text-text-muted">لا توجد مخاطر حالية.</p>
          <!-- Overdue Invoices -->
          <ZoneItem
            v-for="invoice in riskZone.overdue_invoices"
            :key="`risk-inv-${invoice.id}`"
            :to="{ name: 'invoice-details', params: { id: invoice.id } }"
            :icon="ExclamationCircleIcon"
            :title="`فاتورة متأخرة: ${invoice.invoice_number}`"
            :subtitle="`${invoice.customer.name} - ${formatCurrency(invoice.total_amount)}`"
          />
          <!-- Expired Devices -->
          <ZoneItem
            v-for="device in riskZone.recently_expired_devices"
            :key="`risk-dev-${device.id}`"
            :to="{ name: 'device-details', params: { id: device.id } }"
            :icon="NoSymbolIcon"
            :title="`جهاز منتهي: ${device.serial_number}`"
            :subtitle="device.customer.name"
          />
        </div>
      </div>

      <!-- Opportunity Zone -->
      <div>
        <h3 class="text-xl font-bold text-success mb-4 flex items-center gap-2">
          <SparklesIcon class="w-6 h-6" />
          منطقة الفرص
        </h3>
        <div class="space-y-3">
          <p v-if="!hasOpportunities" class="text-center py-10 text-text-muted">
            لا توجد فرص متاحة.
          </p>
          <!-- Pending Check -->
          <ZoneItem
            v-for="device in opportunities.devices_pending_check"
            :key="`opp-check-${device.id}`"
            :to="{ name: 'device-details', params: { id: device.id } }"
            :icon="QuestionMarkCircleIcon"
            title="متابعة تجديد"
            :subtitle="`${device.customer.name} - ${device.serial_number}`"
            color="success"
          />
          <!-- Pending Payment -->
          <ZoneItem
            v-for="device in opportunities.devices_pending_payment"
            :key="`opp-pay-${device.id}`"
            :to="{ name: 'device-details', params: { id: device.id } }"
            :icon="BanknotesIcon"
            title="تأكيد الدفع"
            :subtitle="`${device.customer.name} - ${device.serial_number}`"
            color="success"
          />
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/useDashboardStore'
import AppCard from '@/components/ui/AppCard.vue'
import ZoneItem from '@/components/ui/ZoneItem.vue' // We will create this next
import {
  ShieldExclamationIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  QuestionMarkCircleIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline'

const dashboardStore = useDashboardStore()
const riskZone = computed(() => dashboardStore.risk_zone || {})
const opportunities = computed(() => dashboardStore.actionableItems || {})

const hasRisks = computed(
  () =>
    riskZone.value.overdue_invoices?.length > 0 ||
    riskZone.value.recently_expired_devices?.length > 0,
)

const hasOpportunities = computed(
  () =>
    opportunities.value.devices_pending_check?.length > 0 ||
    opportunities.value.devices_pending_payment?.length > 0,
)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ar-LY', { style: 'currency', currency: 'LYD' }).format(value || 0)
}
</script>
