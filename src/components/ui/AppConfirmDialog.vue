<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': isOpen }"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4">{{ title }}</h3>
      <p class="text-sm text-gray-700 dark:text-text-secondary mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-3 space-x-reverse">
        <AppButton variant="outline" @click="cancel">إلغاء</AppButton>
        <AppButton variant="danger" @click="confirm">تأكيد</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppButton from './AppButton.vue' // تأكد من المسار الصحيح لـ AppButton

const props = defineProps({
  modelValue: {
    // لربطها بـ v-model
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'تأكيد الإجراء',
  },
  message: {
    type: String,
    default: 'هل أنت متأكد من أنك تريد تنفيذ هذا الإجراء؟',
  },
})

const emit = defineEmits(['update:modelValue', 'confirmed'])

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
  },
)

const confirm = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('confirmed', true)
}

const cancel = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}
</script>
