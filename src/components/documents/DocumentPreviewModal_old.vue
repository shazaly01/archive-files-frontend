<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col bg-surface-ground">
      <header
        class="h-16 bg-surface-section border-b border-surface-border flex items-center justify-between px-4 flex-shrink-0 shadow-sm"
      >
        <div class="flex items-center gap-4 min-w-0">
          <button
            @click="closeModal"
            class="p-2 rounded-full hover:bg-surface-ground text-text-secondary transition-colors"
            title="إغلاق (Esc)"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>

          <div class="min-w-0 flex items-center gap-3">
            <div class="p-1.5 rounded bg-primary/10 text-primary flex-shrink-0">
              <DocumentIcon class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h1 class="text-base font-bold text-text-primary truncate max-w-md">
                {{ document?.title }}
              </h1>
              <p v-if="currentVersion" class="text-xs text-text-muted mt-0.5 font-mono">
                v{{ currentVersion.version_number }} •
                {{ formatSize(currentVersion.size_in_bytes) }}
              </p>
            </div>
          </div>

          <div
            v-if="currentApproval"
            class="hidden md:flex px-3 py-1 rounded-full text-xs font-bold items-center gap-1 border transition-colors"
            :class="{
              'bg-yellow-50 text-yellow-700 border-yellow-200': approvalStatus === 'pending',
              'bg-green-50 text-green-700 border-green-200': approvalStatus === 'approved',
              'bg-red-50 text-red-700 border-red-200': approvalStatus === 'rejected',
            }"
          >
            <span v-if="approvalStatus === 'pending'" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              قيد المراجعة
            </span>
            <span v-else-if="approvalStatus === 'approved'" class="flex items-center gap-1">
              <CheckBadgeIcon class="w-4 h-4" />
              معتمد رسمياً
            </span>
            <span v-else-if="approvalStatus === 'rejected'">❌ مرفوض</span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <select
            v-if="document"
            v-model="selectedVersionId"
            class="hidden sm:block appearance-none bg-surface-ground border border-surface-border text-text-primary text-sm rounded-lg pl-8 pr-4 py-1.5 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option v-for="ver in document.versions" :key="ver.id" :value="ver.id">
              v{{ ver.version_number }}
            </option>
          </select>

          <div class="h-6 w-px bg-surface-border mx-1 hidden sm:block"></div>

          <a :href="currentVersion?.url" target="_blank" download class="btn-icon" title="تحميل">
            <ArrowDownTrayIcon class="w-5 h-5" />
          </a>

          <button class="btn-icon" title="رفع إصدار جديد" @click="showUploadVersionModal = true">
            <CloudArrowUpIcon class="w-5 h-5" />
          </button>

          <button
            v-if="canRequestApproval"
            class="btn-icon text-primary hover:bg-primary/10"
            title="طلب اعتماد"
            @click="showApprovalModal = true"
          >
            <CheckBadgeIcon class="w-5 h-5" />
          </button>

          <button
            class="btn-icon"
            :class="{ 'text-danger bg-danger/10': document?.is_locked }"
            @click="handleToggleLock"
            :title="document?.is_locked ? 'فك القفل' : 'حجز للتعديل'"
          >
            <component :is="document?.is_locked ? LockOpenIcon : LockClosedIcon" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden relative">
        <div
          v-if="loading"
          class="absolute inset-0 z-10 bg-surface-ground flex items-center justify-center"
        >
          <div
            class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <div
          class="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-auto"
        >
          <iframe
            v-if="isPreviewable && currentVersion?.url"
            :src="currentVersion.url"
            class="w-full h-full rounded-lg shadow-sm bg-white border border-gray-200"
            frameborder="0"
          ></iframe>

          <div
            v-else-if="currentVersion"
            class="text-center p-8 bg-surface-section rounded-xl shadow-sm border border-surface-border"
          >
            <DocumentIcon class="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 class="font-bold text-text-primary">المعاينة غير متاحة</h3>
            <p class="text-text-muted mt-2 text-sm">صيغة الملف غير مدعومة للعرض المباشر.</p>
            <a
              :href="currentVersion.url"
              class="mt-4 inline-flex items-center text-primary hover:underline"
              download
            >
              تحميل الملف
            </a>
          </div>
        </div>

        <aside
          class="w-80 sm:w-96 bg-surface-section border-r border-surface-border flex flex-col flex-shrink-0 z-10 shadow-xl"
        >
          <div class="flex border-b border-surface-border bg-surface-ground/50">
            <button
              class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="
                activeSidebarTab === 'comments'
                  ? 'border-primary text-primary bg-surface-section'
                  : 'border-transparent text-text-muted hover:bg-surface-section/50'
              "
              @click="activeSidebarTab = 'comments'"
            >
              التعليقات ({{ commentStore.comments.length }})
            </button>
            <button
              class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="
                activeSidebarTab === 'info'
                  ? 'border-primary text-primary bg-surface-section'
                  : 'border-transparent text-text-muted hover:bg-surface-section/50'
              "
              @click="activeSidebarTab = 'info'"
            >
              التفاصيل
            </button>
          </div>

          <div class="flex-1 overflow-hidden relative">
            <div v-if="activeSidebarTab === 'info'" class="p-6 space-y-6 overflow-y-auto h-full">
              <ApprovalAction
                v-if="isMyPendingApproval"
                :approval-id="currentApproval.id"
                @decided="onDecisionMade"
              />

              <div>
                <h4 class="text-xs font-bold text-text-muted uppercase mb-2">معلومات الملف</h4>
                <p class="text-sm text-text-primary break-all">{{ document?.title }}</p>
              </div>
              <div>
                <h4 class="text-xs font-bold text-text-muted uppercase mb-2">تم الرفع بواسطة</h4>
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"
                  >
                    {{ getInitials(currentVersion?.creator?.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-text-primary">
                      {{ currentVersion?.creator?.name }}
                    </p>
                    <p class="text-xs text-text-muted">
                      {{ formatDate(currentVersion?.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="document?.locker">
                <h4 class="text-xs font-bold text-text-muted uppercase mb-2">محجوز بواسطة</h4>
                <p class="text-sm text-danger font-bold flex items-center gap-1">
                  <LockClosedIcon class="w-4 h-4" />
                  {{ document.locker.name }}
                </p>
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
      </div>

      <DocumentUploadModal
        v-if="document"
        v-model="showUploadVersionModal"
        :project-id="document.project_id"
        :is-version-update="true"
        :document-id="document.id"
        @uploaded="onVersionUploaded"
      />

      <RequestApprovalModal
        v-if="currentVersion"
        v-model="showApprovalModal"
        :version-id="currentVersion.id"
        :version-number="currentVersion.version_number"
        :members="projectMembers"
        @requested="onRequestSuccess"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { useCommentStore } from '@/stores/commentStore'
import { useAuthStore } from '@/stores/authStore'
import { useApprovalStore } from '@/stores/approvalStore'
import { useProjectStore } from '@/stores/projectStore'

// استيراد المكونات الفرعية
import CommentsSection from './CommentsSection.vue'
import DocumentUploadModal from './DocumentUploadModal.vue'
import RequestApprovalModal from '@/components/approvals/RequestApprovalModal.vue'
import ApprovalAction from '@/components/approvals/ApprovalAction.vue' // [جديد]

// استيراد الأيقونات
import {
  XMarkIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  CheckBadgeIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Boolean,
  documentId: [Number, String],
  initialVersionId: [Number, String], // <--- أضف هذا السطر
})

const emit = defineEmits(['update:modelValue', 'closed'])

// Stores
const documentStore = useDocumentStore()
const commentStore = useCommentStore()
const authStore = useAuthStore()
const approvalStore = useApprovalStore()
const projectStore = useProjectStore()

// State
const loading = ref(false)
const activeSidebarTab = ref('comments')
const selectedVersionId = ref(null)
const showUploadVersionModal = ref(false)
const showApprovalModal = ref(false)

// Computed
const document = computed(() => documentStore.currentDocument)

const currentVersion = computed(() => {
  if (!document.value) return null
  if (selectedVersionId.value) {
    return (
      document.value.versions.find((v) => v.id === selectedVersionId.value) ||
      document.value.latest_version
    )
  }
  return document.value.latest_version
})

// حالة الاعتماد الحالية
const currentApproval = computed(() => {
  if (!currentVersion.value || !approvalStore.approvals.length) return null

  return approvalStore.approvals.find((a) => {
    // المحاولة 1: البحث عن الحقل المباشر (للاحتياط)
    if (a.document_version_id === currentVersion.value.id) return true

    // المحاولة 2 (وهي الحل لمشكلتك): البحث داخل الكائن المتداخل
    if (a.document_version && a.document_version.id === currentVersion.value.id) return true

    return false
  })
})

const approvalStatus = computed(() => currentApproval.value?.status)

// هل المستخدم الحالي هو المسؤول عن الاعتماد؟
const isMyPendingApproval = computed(() => {
  const approval = currentApproval.value
  if (!approval || approval.status !== 'pending') return false
  return authStore.user && authStore.user.id === approval.approver_id
})

// --- [جديد] منطق الصلاحيات المحسنة ---

// هل يحق للمستخدم الحالي طلب الاعتماد؟
// (المالك أو المدير) + (لا يوجد طلب معلق حالياً)
const canRequestApproval = computed(() => {
  if (!currentVersion.value || !authStore.user) return false

  // منع الطلب إذا كان هناك طلب معلق
  if (currentApproval.value && currentApproval.value.status === 'pending') return false

  // التحقق: هل أنا المالك؟
  const isCreator = currentVersion.value.created_by == authStore.user.id

  // التحقق: هل أنا مدير المشروع؟
  const isManager = projectMembers.value.some(
    (m) => m.id === authStore.user.id && m.pivot?.role === 'manager',
  )

  return isCreator || isManager
})

// هل يسمح برفع إصدار جديد؟ (تجميد الملف)
// نمنع الرفع إذا كان الملف قيد المراجعة
const canEditDocument = computed(() => {
  // 1. إذا كان الملف محجوزاً (Locked) من قبل شخص آخر (موجود سابقاً)
  if (document.value?.is_locked && document.value.locked_by !== authStore.user?.id) return false

  // 2. [جديد] إذا كان قيد المراجعة (Pending Approval)، يمنع التعديل نهائياً للجميع
  if (currentApproval.value && currentApproval.value.status === 'pending') return false

  // 3. خلاف ذلك، نطبق صلاحيات الرفع العادية (المالك أو المدير أو المساهم)
  // (يمكنك تبسيطها بإرجاع true والسماح للباك إند بالتحقق، أو نسخ منطق الصلاحية هنا)
  return true
})

// قائمة الأعضاء للمودال
const projectMembers = computed(() => {
  return document.value?.project?.members || projectStore.currentProject?.members || []
})

const isPreviewable = computed(() => {
  const mime = currentVersion.value?.mime_type || ''
  return mime.includes('pdf') || mime.includes('image/')
})

// Helpers
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '')
const formatSize = (b) => {
  if (!b) return '0 B'
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return (b / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB'][i]
}
const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?')

// Actions
function closeModal() {
  emit('update:modelValue', false)
  emit('closed')
}

async function loadDocumentData() {
  if (!props.documentId) return

  loading.value = true
  try {
    // 1. جلب بيانات المستند
    await documentStore.fetchDocument(props.documentId)

    if (document.value) {
      commentStore.setComments(document.value.comments)
      await approvalStore.fetchHistory(props.documentId)

      // 2. [تعديل هام] تحديد الإصدار المعروض
      // إذا تم تمرير رقم إصدار محدد (من جدول الاعتمادات)، نستخدمه
      if (props.initialVersionId) {
        selectedVersionId.value = props.initialVersionId
      }
      // وإلا، نستخدم أحدث إصدار كالمعتاد
      else if (document.value.latest_version) {
        selectedVersionId.value = document.value.latest_version.id
      }

      // 3. [تعديل UX] فتح تبويب التفاصيل تلقائياً للمشرف
      // ننتظر قليلاً حتى يتم تحديث القيم المحسوبة (computed values)
      setTimeout(() => {
        if (isMyPendingApproval.value) {
          activeSidebarTab.value = 'info'
        } else {
          activeSidebarTab.value = 'comments' // العودة للافتراضي للحالات الأخرى
        }
      }, 50)
    }
  } finally {
    loading.value = false
  }
}

async function handleToggleLock() {
  try {
    await documentStore.lockDocument(document.value.id)
  } catch (e) {}
}

async function handlePostComment(body) {
  await commentStore.postToDocument(document.value.id, body, authStore.user)
}

async function handleDeleteComment(id) {
  if (confirm('حذف التعليق؟')) await commentStore.deleteComment(id)
}

async function onVersionUploaded() {
  await loadDocumentData()
}

async function onRequestSuccess() {
  await approvalStore.fetchHistory(props.documentId)
}

async function onDecisionMade() {
  await loadDocumentData() // تحديث البيانات لإخفاء اللوحة وتحديث الشارة
}

// Shortcuts
const handleEsc = (e) => {
  if (e.key === 'Escape' && props.modelValue) closeModal()
}

// Watchers
watch(
  () => props.documentId,
  (newId) => {
    if (newId && props.modelValue) loadDocumentData()
  },
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) loadDocumentData()
  },
)

onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.btn-icon {
  @apply p-2 rounded-lg hover:bg-surface-ground text-text-secondary transition-colors;
}
</style>
