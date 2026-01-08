<template>
  <div>
    <!-- ... (الكود الخاص بالـ label والسحب والإفلات يبقى كما هو) ... -->
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'ring-2 ring-primary': isDragging }"
      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-surface-border border-dashed rounded-md transition-all"
    >
      <div class="space-y-1 text-center">
        <!-- --- بداية التعديل --- -->
        <!-- عرض المعاينة (أصبحت قابلة للنقر) -->
        <div v-if="imagePreviewUrl" class="mb-4">
          <button
            type="button"
            @click.prevent="isPreviewModalOpen = true"
            class="cursor-pointer hover:opacity-80 transition-opacity"
            title="اضغط لعرض الصورة بالحجم الكامل"
          >
            <img
              :src="imagePreviewUrl"
              alt="Image Preview"
              class="mx-auto h-32 w-auto rounded-md object-cover"
            />
          </button>
          <button
            type="button"
            @click="removeImage"
            class="mt-2 text-sm font-medium text-rose-500 hover:text-rose-700"
          >
            إزالة الصورة
          </button>
        </div>
        <!-- --- نهاية التعديل --- -->

        <!-- زر الرفع (يبقى كما هو) -->
        <div v-else>
          <!-- ... (الكود الخاص بأيقونة الرفع والنصوص يبقى كما هو) ... -->
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div class="flex text-sm text-gray-600 dark:text-text-secondary">
            <label
              :for="id"
              class="relative cursor-pointer bg-white dark:bg-surface-section rounded-md font-medium text-primary hover:text-indigo-500 focus-within:outline-none"
            >
              <span>ارفع ملفًا</span>
              <input
                :id="id"
                :name="id"
                type="file"
                class="sr-only"
                @change="handleFileChange"
                accept="image/*"
              />
            </label>
            <p class="pl-1">أو اسحب وأفلت</p>
          </div>
          <p class="text-xs text-gray-500 dark:text-text-muted">PNG, JPG, GIF up to 2MB</p>
        </div>
      </div>
    </div>

    <!-- --- بداية الإضافة --- -->
    <!-- استدعاء نافذة المعاينة -->
    <ImagePreviewModal v-model="isPreviewModalOpen" :image-url="imagePreviewUrl" />
    <!-- --- نهاية الإضافة --- -->
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
// --- بداية الإضافة ---
import ImagePreviewModal from './ImagePreviewModal.vue' // استيراد المكون الجديد
// --- نهاية الإضافة ---

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'صورة المستند' },
  modelValue: { type: [Object, String, null], default: null },
})

const emit = defineEmits(['update:modelValue'])

const imagePreviewUrl = ref(null)
const isDragging = ref(false)
// --- بداية الإضافة ---
const isPreviewModalOpen = ref(false) // متغير حالة للتحكم في النافذة المنبثقة
// --- نهاية الإضافة ---

// ... (دوال processFile, handleFileChange, handleDrop, removeImage تبقى كما هي) ...
const processFile = (file) => {
  if (file && file.type.startsWith('image/')) {
    imagePreviewUrl.value = URL.createObjectURL(file)
    emit('update:modelValue', file)
  }
}

const handleFileChange = (event) => {
  processFile(event.target.files[0])
}

const handleDrop = (event) => {
  isDragging.value = false
  processFile(event.dataTransfer.files[0])
}

const removeImage = () => {
  imagePreviewUrl.value = null
  emit('update:modelValue', null)
}

// ... (دالة watch تبقى كما هي) ...
watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === 'string') {
      imagePreviewUrl.value = newValue
    } else if (!newValue) {
      imagePreviewUrl.value = null
    }
  },
  { immediate: true },
)
</script>
