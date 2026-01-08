<!-- src/components/forms/CompaniesDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <div>
    <!-- [تم التعديل هنا] استخدام AppDropdown بدلاً من Dropdown مباشرة -->
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="companies"
      :loading="loading"
      :required="required"
      placeholder="اختر شركة"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/companyStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الشركة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const companyStore = useCompanyStore()
const { companies, loading } = storeToRefs(companyStore)
const error = ref(null)

// جلب قائمة الشركات عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (companies.value.length === 0) {
    try {
      await companyStore.fetchCompanies({ per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة الشركات.'
      console.error('Failed to fetch companies for dropdown:', err)
    }
  }
})
</script>
