<!-- src/components/forms/DriversDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <div>
    <!-- [تم التعديل هنا] استخدام AppDropdown بدلاً من Dropdown مباشرة -->
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="drivers"
      :loading="loading"
      :required="required"
      placeholder="اختر سائقًا (اختياري)"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'السائق' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const driverStore = useDriverStore()
const { drivers, loading } = storeToRefs(driverStore)
const error = ref(null)

// جلب قائمة السائقين عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (drivers.value.length === 0) {
    try {
      await driverStore.fetchDrivers({ per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة السائقين.'
      console.error('Failed to fetch drivers for dropdown:', err)
    }
  }
})
</script>
