<!-- src/components/ui/AppDropdown.vue -->
<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <Dropdown
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :filter="true"
      :loading="loading"
      :required="required"
      :placeholder="placeholder"
      :show-clear="showClear"
      class="w-full"
      :pt="{
        root: {
          class: [
            'w-full inline-flex relative cursor-pointer select-none',
            'bg-gray-50 border-2 border-gray-300 transition-colors duration-200 rounded-md shadow-sm',
            'dark:bg-surface-ground dark:border-surface-border',
            'hover:border-blue-500 dark:hover:border-primary',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'dark:focus:ring-primary dark:focus:border-primary',
          ],
        },
        input: {
          class:
            'w-full p-2 text-gray-900 dark:text-text-primary bg-transparent border-0 focus:outline-none',
        },
        trigger: {
          class:
            'flex items-center justify-center shrink-0 w-12 rounded-r-md text-gray-500 dark:text-gray-400',
        },
        clearIcon: {
          // [جديد] تنسيق أيقونة المسح
          class: 'text-gray-500 dark:text-gray-400 mr-2',
        },
        panel: {
          class:
            'bg-white dark:bg-surface-section border border-gray-300 dark:border-surface-border rounded-md shadow-lg mt-1',
        },
        header: {
          class: 'p-2 border-b border-gray-200 dark:border-surface-border',
        },
        filterInput: {
          class:
            'w-full p-2 border border-gray-300 rounded-md dark:bg-surface-ground dark:text-text-primary dark:border-surface-border',
        },
        list: {
          class: 'p-1',
        },
        item: {
          class: [
            'p-2 rounded-md cursor-pointer overflow-hidden whitespace-nowrap',
            'text-gray-700 dark:text-text-secondary',
            'hover:bg-gray-100 dark:hover:bg-surface-hover',
          ],
        },
        itemGroup: {
          class: 'p-2 font-bold text-gray-500 dark:text-gray-400',
        },
      }"
    />
  </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'

// هذا المكون سيستقبل كل الخصائص ويمررها إلى مكون PrimeVue
defineProps({
  /**
   * المعرف الفريد للمكون والحقل.
   */
  id: { type: String, required: true },

  /**
   * النص الذي يظهر فوق الحقل.
   */
  label: { type: String, default: '' },

  /**
   * القيمة الحالية للمكون (للاستخدام مع v-model).
   */
  modelValue: { type: [String, Number], default: '' },

  /**
   * مصفوفة الخيارات التي ستعرض في القائمة.
   */
  options: { type: Array, default: () => [] },

  /**
   * اسم الخاصية في كائن الخيار التي ستستخدم كنص للعرض.
   */
  optionLabel: { type: String, default: 'name' },

  /**
   * اسم الخاصية في كائن الخيار التي ستستخدم كقيمة.
   */
  optionValue: { type: String, default: 'id' },

  /**
   * النص الذي يظهر عندما لا تكون هناك قيمة محددة.
   */
  placeholder: { type: String, default: 'اختر...' },

  /**
   * لعرض مؤشر التحميل.
   */
  loading: { type: Boolean, default: false },

  /**
   * لجعل الحقل مطلوبًا.
   */
  required: { type: Boolean, default: false },

  /**
   * خاصية لتحديد ما إذا كان سيتم عرض أيقونة المسح (x)
   * التي تسمح للمستخدم بإلغاء التحديد.
   */
  showClear: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>
