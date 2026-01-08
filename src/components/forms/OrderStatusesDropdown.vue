<!-- src/components/forms/OrderStatusesDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <div>
    <!-- [تم التعديل هنا] استخدام AppDropdown بدلاً من select مباشرة -->
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="orderStatuses"
      :loading="loading"
      :required="required"
      placeholder="اختر حالة الطلب (اختياري)"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStatusStore } from '@/stores/orderStatusStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'حالة الطلب' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const orderStatusStore = useOrderStatusStore()
const { orderStatuses, loading } = storeToRefs(orderStatusStore)
const error = ref(null)

// جلب قائمة الحالات عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (orderStatuses.value.length === 0) {
    try {
      await orderStatusStore.fetchOrderStatuses()
    } catch (err) {
      error.value = 'فشل تحميل قائمة الحالات.'
      console.error('Failed to fetch order statuses for dropdown:', err)
    }
  }
})
</script>
