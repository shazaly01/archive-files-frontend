<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="closeModal"
    :title="isVersionUpdate ? 'رفع إصدار جديد' : 'رفع ملف جديد'"
  >
    <form @submit.prevent="handleUpload" class="space-y-6">
      <AppInput
        v-if="!isVersionUpdate"
        id="doc-title"
        label="عنوان المستند"
        v-model="title"
        placeholder="مثلاً: تقرير الميزانية Q1"
        :required="true"
      />

      <div class="space-y-2">
        <label class="block text-sm font-medium text-text-secondary">الملف المرفق</label>

        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
          :class="[
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-surface-border hover:border-primary/50 hover:bg-surface-ground',
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <input
            type="file"
            ref="fileInputRef"
            class="hidden"
            @change="onFileSelected"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png"
          />

          <div v-if="!selectedFile" class="flex flex-col items-center gap-2">
            <div class="p-3 bg-surface-ground rounded-full text-text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p class="text-sm text-text-primary font-medium">
              اضغط هنا لاختيار ملف أو قم بسحبه وإفلاته
            </p>
            <p class="text-xs text-text-muted">PDF, Word, Excel, Images (Max 20MB)</p>
          </div>

          <div
            v-else
            class="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-primary/30 shadow-sm"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="p-2 bg-primary/10 rounded-lg text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="text-right truncate">
                <p class="text-sm font-medium text-text-primary truncate">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs text-text-muted">{{ formatSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button
              type="button"
              @click.stop="clearFile"
              class="text-text-muted hover:text-danger p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="p-3 rounded-md bg-danger/10 text-danger text-sm flex items-start gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
        <AppButton variant="outline" type="button" @click="closeModal" :disabled="isUploading">
          إلغاء
        </AppButton>
        <AppButton variant="primary" type="submit" :disabled="!isValid || isUploading">
          <span v-if="isUploading" class="flex items-center gap-2">
            <svg
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            جارٍ الرفع...
          </span>
          <span v-else>{{ isVersionUpdate ? 'رفع الإصدار' : 'رفع الملف' }}</span>
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  projectId: { type: [Number, String], required: true },
  isVersionUpdate: { type: Boolean, default: false },
  documentId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const store = useDocumentStore()
const fileInputRef = ref(null)

const title = ref('')
const selectedFile = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')

const isValid = computed(() => {
  if (props.isVersionUpdate) return selectedFile.value !== null
  return title.value.trim() !== '' && selectedFile.value !== null
})

function triggerFileInput() {
  fileInputRef.value.click()
}

function onFileSelected(event) {
  const file = event.target.files[0]
  if (file) handleFile(file)
}

function onDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) handleFile(file)
}

function handleFile(file) {
  if (file.size > 20 * 1024 * 1024) {
    errorMessage.value = 'حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت.'
    return
  }
  selectedFile.value = file
  errorMessage.value = ''
  if (!title.value && !props.isVersionUpdate) {
    title.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

function clearFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function closeModal() {
  if (isUploading.value) return
  emit('update:modelValue', false)
  setTimeout(() => {
    title.value = ''
    clearFile()
    errorMessage.value = ''
  }, 300)
}

async function handleUpload() {
  if (!isValid.value) return
  isUploading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    if (props.isVersionUpdate) {
      await store.uploadVersion(props.documentId, formData)
    } else {
      formData.append('title', title.value)
      await store.createDocument(props.projectId, formData)
    }

    emit('uploaded')

    // التعديل هنا: نفك القفل أولاً ثم نغلق
    isUploading.value = false
    closeModal()
  } catch (error) {
    console.error(error)
    errorMessage.value = store.error || 'حدث خطأ أثناء رفع الملف.'
    // في حالة الخطأ، نفك القفل لتمكين المحاولة مرة أخرى
    isUploading.value = false
  }
  // تمت إزالة finally لأننا عالجنا القفل في الحالتين (النجاح والفشل) يدوياً
}
</script>
