<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-4xl max-h-[90vh]">
      <button
        @click="closeModal"
        class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-600 transition-transform transform hover:scale-110 z-10"
        aria-label="إغلاق"
      >
        &times;
      </button>
      <img :src="imageUrl" alt="معاينة الصورة" class="object-contain max-w-full max-h-[85vh]" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  imageUrl: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>
