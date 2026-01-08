<!-- src/components/forms/WorkNaturesDropdown.vue -->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="workNatures"
      :loading="loading"
      :required="required"
      placeholder="اختر طبيعة العمل (اختياري)"
      option-label="name"
      option-value="id"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWorkNatureStore } from '@/stores/workNatureStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

// تعريف الـ props والـ emits
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'طبيعة العمل' },
  modelValue: { type: [String, Number, null], default: null },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات
const workNatureStore = useWorkNatureStore()
const { workNatures, loading } = storeToRefs(workNatureStore)
const error = ref(null)

// جلب قائمة "طبائع العمل" عند تحميل المكون
onMounted(async () => {
  // نجلب البيانات فقط إذا كانت القائمة فارغة لتجنب الطلبات المتكررة
  if (workNatures.value.length === 0) {
    try {
      // نطلب كل البيانات مرة واحدة بدون ترقيم لهذه القائمة
      await workNatureStore.fetchWorkNatures()
    } catch (err) {
      error.value = 'فشل تحميل قائمة طبيعة العمل.'
      console.error('Failed to fetch work natures for dropdown:', err)
    }
  }
})
</script>
