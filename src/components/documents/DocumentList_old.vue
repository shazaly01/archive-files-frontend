<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-4">
      <div class="relative w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="بحث في الملفات..."
          class="w-full pl-4 pr-10 py-2 bg-surface-ground border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary placeholder:text-text-muted"
        />
        <div class="absolute right-3 top-2.5 text-text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="fetchData"
          class="p-2 text-text-muted hover:text-primary transition-colors"
          title="تحديث القائمة"
        >
          <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': store.loading }" />
        </button>
      </div>
    </div>

    <AppTable
      :headers="headers"
      :items="filteredDocuments"
      :is-loading="store.loading"
      :row-clickable="false"
    >
      <template #cell-title="{ item }">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-surface-ground text-text-secondary">
            <component :is="getFileIcon(item.latest_version?.mime_type)" class="w-6 h-6" />
          </div>

          <div class="min-w-0">
            <button
              @click="$emit('preview', item)"
              class="font-medium text-text-primary truncate max-w-[200px] hover:text-primary hover:underline text-left transition-colors"
            >
              {{ item.title }}
            </button>

            <p class="text-xs text-text-muted truncate">
              {{ item.latest_version?.file_name }}
            </p>
          </div>
        </div>
      </template>

      <template #cell-version="{ item }">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        >
          v{{ item.latest_version?.version_number || '1.0' }}
        </span>
      </template>

      <template #cell-size="{ item }">
        <span class="text-xs text-text-secondary font-mono">
          {{ formatSize(item.latest_version?.size_in_bytes) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <div
          v-if="item.is_locked"
          class="flex items-center gap-1.5 text-danger"
          title="الملف محجوز للتعديل"
        >
          <LockClosedIcon class="w-4 h-4" />
          <span class="text-xs font-medium">
            {{ isLockedByMe(item) ? 'محجوز بواسطتك' : 'محجوز' }}
          </span>
          <div v-if="!isLockedByMe(item)" class="group relative">
            <InformationCircleIcon class="w-4 h-4 text-text-muted cursor-help" />
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none"
            >
              بواسطة: {{ item.locked_by_user?.name || 'مستخدم آخر' }}
            </div>
          </div>
        </div>
        <div v-else class="text-success flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-success"></span>
          <span class="text-xs">متاح</span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-2">
          <a
            v-if="item.latest_version?.url"
            :href="item.latest_version.url"
            target="_blank"
            class="p-1.5 text-text-muted hover:text-primary transition-colors rounded-md hover:bg-surface-ground"
            title="تحميل الملف"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
          </a>

          <button
            @click="handleLockToggle(item)"
            class="p-1.5 transition-colors rounded-md hover:bg-surface-ground"
            :class="[
              item.is_locked
                ? isLockedByMe(item)
                  ? 'text-warning hover:text-warning-hover'
                  : 'text-gray-300 cursor-not-allowed'
                : 'text-text-muted hover:text-danger',
            ]"
            :title="getLockTitle(item)"
            :disabled="item.is_locked && !isLockedByMe(item)"
          >
            <component :is="item.is_locked ? LockOpenIcon : LockClosedIcon" class="w-5 h-5" />
          </button>

          <button
            @click="handleDelete(item)"
            class="p-1.5 text-text-muted hover:text-danger transition-colors rounded-md hover:bg-surface-ground"
            title="حذف الملف"
            v-if="!item.is_locked"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { useAuthStore } from '@/stores/authStore'
import AppTable from '@/components/ui/AppTable.vue'

// الأيقونات
import {
  DocumentIcon,
  PhotoIcon,
  TableCellsIcon,
  DocumentTextIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  projectId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['preview'])
const store = useDocumentStore()
const authStore = useAuthStore()

const searchQuery = ref('')

// تعريف الأعمدة
const headers = [
  { key: 'title', label: 'اسم الملف', class: 'text-right min-w-[200px]' },
  { key: 'version', label: 'الإصدار', class: 'text-center' },
  { key: 'size', label: 'الحجم', class: 'text-left font-mono' },
  { key: 'status', label: 'الحالة', class: 'text-center' },
  { key: 'actions', label: '', class: 'text-left w-32' },
]

// تصفية الملفات محلياً للبحث السريع
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

// الدوال المساعدة
function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(mimeType) {
  if (!mimeType) return DocumentIcon
  if (mimeType.includes('image')) return PhotoIcon
  if (mimeType.includes('pdf')) return DocumentTextIcon
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv'))
    return TableCellsIcon
  return DocumentIcon
}

function isLockedByMe(item) {
  // يجب أن يطابق ID المستخدم الحالي
  return item.locked_by === authStore.user?.id
}

function getLockTitle(item) {
  if (!item.is_locked) return 'حجز الملف للتعديل (Check-out)'
  if (isLockedByMe(item)) return 'إلغاء الحجز (Check-in)'
  return 'الملف محجوز بواسطة مستخدم آخر'
}

// الإجراءات
async function fetchData() {
  await store.fetchProjectDocuments(props.projectId)
}

/*
   <button @click="onPreview(item)">{{ item.title }}</button>
*/
function onPreview(item) {
  emit('preview', item)
}

async function handleLockToggle(item) {
  try {
    await store.toggleLock(item)
  } catch (error) {
    alert(store.error || 'فشلت العملية')
  }
}

async function handleDelete(item) {
  if (confirm(`هل أنت متأكد من حذف الملف "${item.title}"؟`)) {
    try {
      await store.deleteDocument(item.id)
    } catch (error) {
      alert('فشل الحذف')
    }
  }
}

// جلب البيانات عند التحميل
onMounted(() => {
  fetchData()
})

// مراقبة تغيير المشروع (في حال تغير الـ ID في الرابط)
watch(
  () => props.projectId,
  () => {
    fetchData()
  },
)
</script>
