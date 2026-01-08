<!-- src/components/forms/StationsDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <AppDropdown
    :id="id"
    :label="label"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :options="stations"
    :loading="loading"
    :required="required"
    placeholder="اختر محطة (اختياري)"
  />
  <!-- لاحظ كيف اختفى كل كود التصميم من هنا -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useStationStore } from '@/stores/stationStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المحطة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const stationStore = useStationStore()
const { stations, loading } = storeToRefs(stationStore)

// جلب قائمة المحطات عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (stations.value.length === 0) {
    try {
      await stationStore.fetchStations({ per_page: 1000 })
    } catch (err) {
      console.error('Failed to fetch stations for dropdown:', err)
      // يمكنك إضافة رسالة خطأ هنا إذا أردت
    }
  }
})
</script>
