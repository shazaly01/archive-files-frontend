<template>
  <div class="space-y-4">
    <DocumentListHeader
      v-model:searchQuery="searchQuery"
      :loading="store.loading"
      @refresh="fetchData"
    />

    <DocumentTable
      :headers="headers"
      :items="filteredDocuments"
      :is-loading="store.loading"
      @preview="onPreview"
      @toggle-lock="handleLockToggle"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { useAuthStore } from '@/stores/authStore'

// استيراد المكونات الفرعية (مكعبات الليغو)
import DocumentListHeader from './list/DocumentListHeader.vue'
import DocumentTable from './list/DocumentTable.vue'

const props = defineProps({
  projectId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['preview'])

// Stores
const store = useDocumentStore()
const authStore = useAuthStore() // قد نحتاجه هنا أو داخل الستور

// State
const searchQuery = ref('')

// تعريف أعمدة الجدول (يتم تمريرها للمكون الفرعي)
const headers = [
  { key: 'title', label: 'اسم الملف', class: 'text-right min-w-[200px]' },
  { key: 'version', label: 'الإصدار', class: 'text-center' },
  { key: 'size', label: 'الحجم', class: 'text-left font-mono' },
  { key: 'status', label: 'الحالة', class: 'text-center' },
  { key: 'actions', label: '', class: 'text-left w-32' },
]

// --- المنطق البرمجي (Logic) ---

// تصفية الملفات بناءً على البحث
const filteredDocuments = computed(() => {
  const docs = store.documents || []
  if (!searchQuery.value) return docs

  const query = searchQuery.value.toLowerCase()
  return docs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query) ||
      doc.latest_version?.file_name.toLowerCase().includes(query),
  )
})

// جلب البيانات
async function fetchData() {
  await store.fetchProjectDocuments(props.projectId)
}

// التعامل مع معاينة الملف (إرسال الحدث للأب ProjectDetails)
function onPreview(item) {
  emit('preview', item)
}

// التعامل مع القفل/فك القفل
async function handleLockToggle(item) {
  try {
    await store.toggleLock(item)
  } catch (error) {
    alert(store.error || 'فشلت العملية')
  }
}

// التعامل مع الحذف
async function handleDelete(item) {
  if (confirm(`هل أنت متأكد من حذف الملف "${item.title}"؟`)) {
    try {
      await store.deleteDocument(item.id)
    } catch (error) {
      alert('فشل الحذف')
    }
  }
}

// --- Lifecycle & Watchers ---

onMounted(() => {
  fetchData()
})

// إعادة جلب البيانات إذا تغير المشروع (مثلاً عند التنقل بين المشاريع)
watch(
  () => props.projectId,
  () => {
    fetchData()
  },
)
</script>
