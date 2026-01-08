<!-- src/views/companies/CompanyModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
        <button @click="close" class="text-text-muted hover:text-text-primary">&times;</button>
      </div>

      <CompanyForm :initial-data="companyData" :is-saving="isSaving" @submit="handleFormSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CompanyForm from './CompanyForm.vue'

const props = defineProps({
  modelValue: {
    // v-model
    type: Boolean,
    default: false,
  },
  company: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const companyData = ref(props.company)

const title = computed(() =>
  props.company && props.company.id ? 'تعديل شركة' : 'إضافة شركة جديدة',
)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(
  () => props.company,
  (val) => {
    companyData.value = val
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
