<template>
  <div>
    <!-- العنوان (Label) -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2"
    >
      {{ label }}
    </label>

    <!-- مجموعة الأزرار -->
    <div class="flex items-center space-x-2 space-x-reverse mb-2">
      <button
        v-for="quantity in predefinedQuantities"
        :key="quantity"
        type="button"
        @click="selectQuantity(quantity)"
        :class="[
          'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
          modelValue == quantity
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-surface-hover dark:text-text-secondary dark:hover:bg-surface-border',
        ]"
      >
        {{ quantity.toLocaleString('ar-EG') }} لتر
      </button>
    </div>

    <!-- حقل الإدخال اليدوي -->
    <AppInput
      :id="id"
      type="number"
      :step="step"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الكمية' },
  modelValue: { type: [Number, String, null], default: null },
  step: { type: String, default: '0.01' },
  placeholder: { type: String, default: 'أو أدخل كمية مخصصة' },
})

const emit = defineEmits(['update:modelValue'])

// الكميات المحددة مسبقًا
const predefinedQuantities = [40000, 50000]

// دالة لتحديث القيمة عند النقر على زر
const selectQuantity = (quantity) => {
  emit('update:modelValue', quantity)
}

// دالة لتحديث القيمة عند الكتابة في الحقل
const updateValue = (value) => {
  // تحويل القيمة إلى رقم قبل إرسالها
  const numericValue = value === '' || value === null ? null : parseFloat(value)
  emit('update:modelValue', numericValue)
}
</script>
