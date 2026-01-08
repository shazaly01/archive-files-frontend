<!-- src/components/forms/RegionsDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <div>
    <!-- [تم التعديل هنا] استخدام AppDropdown بدلاً من Dropdown مباشرة -->
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="regions"
      :loading="loading"
      :required="required"
      placeholder="اختر منطقة (اختياري)"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegionStore } from '@/stores/regionStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المنطقة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const regionStore = useRegionStore()
const { regions, loading } = storeToRefs(regionStore)
const error = ref(null)

// جلب قائمة المناطق عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (regions.value.length === 0) {
    try {
      await regionStore.fetchRegions({ per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المناطق.'
      console.error('Failed to fetch regions for dropdown:', err)
    }
  }
})
</script>
