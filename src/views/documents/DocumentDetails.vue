<template>
  <div
    v-if="documentStore.loading && !documentStore.currentDocument"
    class="flex h-screen items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="text-text-muted">جارٍ تحميل المستند...</p>
    </div>
  </div>

  <div v-else-if="document" class="flex flex-col h-screen bg-surface-ground overflow-hidden">
    <header
      class="h-16 bg-surface-section border-b border-surface-border flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 -mr-2 rounded-full hover:bg-surface-ground text-text-secondary transition-colors"
          title="عودة"
        >
          <ArrowRightIcon class="w-5 h-5" />
        </button>

        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded bg-primary/10 text-primary">
              <DocumentIcon class="w-5 h-5" />
            </div>
            <h1
              class="text-lg font-bold text-text-primary truncate max-w-md"
              :title="document.title"
            >
              {{ document.title }}
            </h1>
            <span
              v-if="document.is_locked"
              class="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded-full flex items-center gap-1 border border-danger/20"
            >
              <LockClosedIcon class="w-3 h-3" /> محجوز
            </span>
          </div>
          <p class="text-xs text-text-muted mt-0.5 mr-9 font-mono">
            v{{ currentVersion.version_number }} • {{ formatDate(currentVersion.created_at) }} •
            {{ formatSize(currentVersion.size_in_bytes) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <select
            v-model="selectedVersionId"
            class="appearance-none bg-surface-ground border border-surface-border text-text-primary text-sm rounded-lg pl-8 pr-4 py-2 focus:ring-primary focus:border-primary cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option v-for="ver in document.versions" :key="ver.id" :value="ver.id">
              v{{ ver.version_number }} - {{ formatDate(ver.created_at) }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-text-secondary"
          >
            <ClockIcon class="h-4 w-4" />
          </div>
        </div>

        <div class="h-6 w-px bg-surface-border mx-1"></div>

        <a :href="currentVersion.url" target="_blank" download class="btn-icon" title="تحميل الملف">
          <ArrowDownTrayIcon class="w-5 h-5" />
        </a>

        <button class="btn-icon" title="رفع إصدار جديد" @click="showUploadVersionModal = true">
          <CloudArrowUpIcon class="w-5 h-5" />
        </button>

        <button
          class="btn-icon"
          :class="{
            'text-danger bg-danger/10 border-danger/20': document.is_locked,
            'text-text-secondary': !document.is_locked,
          }"
          :title="document.is_locked ? 'فك القفل (Check-in)' : 'حجز للتعديل (Check-out)'"
          @click="handleToggleLock"
        >
          <component :is="document.is_locked ? LockOpenIcon : LockClosedIcon" class="w-5 h-5" />
        </button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <div
        class="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-auto"
      >
        <iframe
          v-if="isPreviewable"
          :src="currentVersion.url"
          class="w-full h-full rounded-lg shadow-sm bg-white border border-gray-200"
          frameborder="0"
        ></iframe>

        <div
          v-else
          class="text-center p-8 bg-surface-section rounded-xl shadow-sm border border-surface-border max-w-md"
        >
          <div
            class="w-20 h-20 bg-surface-ground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner"
          >
            <DocumentIcon class="w-10 h-10 text-text-secondary" />
          </div>
          <h3 class="text-lg font-bold text-text-primary">المعاينة غير متاحة</h3>
          <p class="text-text-muted mt-2 mb-6 text-sm">
            لا يمكن عرض هذا النوع من الملفات مباشرة في المتصفح.
          </p>
          <a
            :href="currentVersion.url"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
            download
          >
            <ArrowDownTrayIcon class="w-4 h-4 ml-2" />
            تحميل الملف للمعاينة
          </a>
        </div>
      </div>

      <aside
        class="w-96 bg-surface-section border-r border-surface-border flex flex-col flex-shrink-0 z-10 shadow-lg"
      >
        <div class="flex border-b border-surface-border bg-surface-ground/50">
          <button
            class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="
              activeSidebarTab === 'info'
                ? 'border-primary text-primary bg-surface-section'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-section/50'
            "
            @click="activeSidebarTab = 'info'"
          >
            <span class="flex items-center justify-center gap-2">
              <InformationCircleIcon class="w-4 h-4" />
              التفاصيل
            </span>
          </button>
          <button
            class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="
              activeSidebarTab === 'comments'
                ? 'border-primary text-primary bg-surface-section'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-section/50'
            "
            @click="activeSidebarTab = 'comments'"
          >
            <span class="flex items-center justify-center gap-2">
              <ChatBubbleLeftRightIcon class="w-4 h-4" />
              التعليقات ({{ commentStore.comments.length }})
            </span>
          </button>
        </div>

        <div class="flex-1 overflow-hidden relative">
          <div v-if="activeSidebarTab === 'info'" class="p-6 space-y-8 overflow-y-auto h-full">
            <div>
              <h4 class="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                تم الرفع بواسطة
              </h4>
              <div
                class="flex items-center gap-3 bg-surface-ground p-3 rounded-lg border border-surface-border"
              >
                <div
                  class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary"
                >
                  {{ getInitials(currentVersion.creator?.name) }}
                </div>
                <div>
                  <p class="text-sm font-bold text-text-primary">
                    {{ currentVersion.creator?.name }}
                  </p>
                  <p class="text-xs text-text-muted dir-ltr text-right">
                    {{ formatDate(currentVersion.created_at) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="document.locker">
              <h4 class="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                محجوز حالياً بواسطة
              </h4>
              <div
                class="flex items-center gap-3 p-3 bg-danger/5 rounded-lg border border-danger/20"
              >
                <LockClosedIcon class="w-5 h-5 text-danger" />
                <div>
                  <p class="text-sm font-bold text-text-primary">{{ document.locker.name }}</p>
                  <p class="text-xs text-text-muted">منذ {{ formatDate(document.locked_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <CommentsSection
            v-else
            :comments="commentStore.comments"
            :loading="commentStore.loading"
            @submit="handlePostComment"
            @delete="handleDeleteComment"
            class="h-full"
          />
        </div>
      </aside>
    </main>

    <DocumentUploadModal
      v-model="showUploadVersionModal"
      :project-id="document.project_id"
      :is-version-update="true"
      :document-id="document.id"
      @uploaded="onVersionUploaded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documentStore'
import { useCommentStore } from '@/stores/commentStore' // [جديد]
import { useAuthStore } from '@/stores/authStore'
import CommentsSection from '@/components/documents/CommentsSection.vue'
import DocumentUploadModal from '@/components/documents/DocumentUploadModal.vue'

import {
  ArrowRightIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const documentStore = useDocumentStore()
const commentStore = useCommentStore() // [جديد]
const authStore = useAuthStore()

const activeSidebarTab = ref('comments')
const selectedVersionId = ref(null)
const showUploadVersionModal = ref(false)

const document = computed(() => documentStore.currentDocument)

// تحديد الإصدار المعروض حالياً
const currentVersion = computed(() => {
  if (!document.value) return {}
  if (selectedVersionId.value) {
    return (
      document.value.versions.find((v) => v.id === selectedVersionId.value) ||
      document.value.latest_version
    )
  }
  return document.value.latest_version
})

// هل يمكن معاينته؟
const isPreviewable = computed(() => {
  const mime = currentVersion.value?.mime_type || ''
  return mime.includes('pdf') || mime.includes('image/')
})

// Helpers
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?')

// Actions
const goBack = () => {
  if (document.value?.project_id) {
    router.push({ name: 'ProjectDetails', params: { id: document.value.project_id } })
  } else {
    router.back()
  }
}

const handleToggleLock = async () => {
  try {
    await documentStore.lockDocument(document.value.id)
  } catch (e) {
    alert(e.message || 'فشلت العملية')
  }
}

// [جديد] التعامل مع التعليقات
const handlePostComment = async (body) => {
  try {
    await commentStore.postToDocument(document.value.id, body, authStore.user)
  } catch (e) {
    // الخطأ مخزن في الستور
  }
}

const handleDeleteComment = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
    await commentStore.deleteComment(id)
  }
}

const onVersionUploaded = async () => {
  // إعادة تحميل المستند لتحديث الإصدارات
  await documentStore.fetchDocument(document.value.id)
  selectedVersionId.value = document.value.latest_version.id
}

// Initial Load
onMounted(async () => {
  const docId = route.params.id
  await documentStore.fetchDocument(docId)

  // [جديد] تهيئة التعليقات في الستور الخاص بها
  if (document.value) {
    commentStore.setComments(document.value.comments)

    if (document.value.latest_version) {
      selectedVersionId.value = document.value.latest_version.id
    }
  }
})

// Watchers
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await documentStore.fetchDocument(newId)
      commentStore.setComments(document.value?.comments)
    }
  },
)
</script>

<style scoped>
.btn-icon {
  @apply p-2 rounded-lg hover:bg-surface-ground text-text-secondary transition-colors border border-transparent hover:border-surface-border;
}
/* تنسيق خاص للعربية */
.dir-ltr {
  direction: ltr;
}
</style>
