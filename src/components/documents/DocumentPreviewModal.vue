<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      ></div>

      <div
        class="relative w-full max-w-[95rem] h-[90vh] bg-surface-ground rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-surface-border ring-1 ring-white/10"
      >
        <PreviewHeader
          :document="document"
          :current-version="currentVersion"
          :selected-version-id="selectedVersionId"
          :current-approval="currentApproval"
          :can-request-approval="canRequestApproval"
          @close="closeModal"
          @update:selected-version-id="selectedVersionId = $event"
          @upload="showUploadVersionModal = true"
          @request-approval="showApprovalModal = true"
          @toggle-lock="handleToggleLock"
        />

        <div class="flex-1 flex overflow-hidden relative">
          <PreviewContent
            :url="currentVersion?.url"
            :is-previewable="isPreviewable"
            :loading="loading"
          />

          <PreviewSidebar
            :active-tab="activeSidebarTab"
            @update:active-tab="activeSidebarTab = $event"
            :tabs="[
              { id: 'comments', label: `التعليقات (${commentStore.comments.length})` },
              { id: 'info', label: 'التفاصيل' },
            ]"
          >
            <template #info-content>
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
            </template>

            <template #comments-content>
              <CommentsSection
                :comments="commentStore.comments"
                :loading="commentStore.loading"
                @submit="handlePostComment"
                @delete="handleDeleteComment"
                class="h-full"
              />
            </template>
          </PreviewSidebar>
        </div>
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

// استيراد المكونات الفرعية الجديدة (مكعبات الليغو)
import PreviewHeader from './preview/PreviewHeader.vue'
import PreviewContent from './preview/PreviewContent.vue'
import PreviewSidebar from './preview/PreviewSidebar.vue'

// استيراد المكونات الأخرى
import CommentsSection from './CommentsSection.vue'
import DocumentUploadModal from './DocumentUploadModal.vue'
import RequestApprovalModal from '@/components/approvals/RequestApprovalModal.vue'
import ApprovalAction from '@/components/approvals/ApprovalAction.vue'

// نحتاج استيراد أيقونة القفل فقط لاستخدامها داخل الـ Slot
import { LockClosedIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Boolean,
  documentId: [Number, String],
  initialVersionId: [Number, String],
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

// --- Computed Properties ---

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

const currentApproval = computed(() => {
  if (!currentVersion.value || !approvalStore.approvals.length) return null
  return approvalStore.approvals.find((a) => {
    if (a.document_version_id === currentVersion.value.id) return true
    if (a.document_version && a.document_version.id === currentVersion.value.id) return true
    return false
  })
})

const isMyPendingApproval = computed(() => {
  const approval = currentApproval.value
  if (!approval || approval.status !== 'pending') return false
  return authStore.user && authStore.user.id === approval.approver_id
})

// صلاحيات طلب الاعتماد
const canRequestApproval = computed(() => {
  if (!currentVersion.value || !authStore.user) return false
  if (currentApproval.value && currentApproval.value.status === 'pending') return false

  const isCreator = currentVersion.value.created_by == authStore.user.id
  const isManager = projectMembers.value.some(
    (m) => m.id === authStore.user.id && m.pivot?.role === 'manager',
  )
  return isCreator || isManager
})

// قائمة الأعضاء
const projectMembers = computed(() => {
  return document.value?.project?.members || projectStore.currentProject?.members || []
})

// هل الملف قابل للمعاينة؟
const isPreviewable = computed(() => {
  const mime = currentVersion.value?.mime_type || ''
  return mime.includes('pdf') || mime.includes('image/')
})

// --- Helpers ---
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '')
const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?')

// --- Actions ---

function closeModal() {
  emit('update:modelValue', false)
  emit('closed')
}

async function loadDocumentData() {
  if (!props.documentId) return
  loading.value = true
  try {
    await documentStore.fetchDocument(props.documentId)
    if (document.value) {
      commentStore.setComments(document.value.comments)
      await approvalStore.fetchHistory(props.documentId)

      // تحديد الإصدار
      if (props.initialVersionId) {
        selectedVersionId.value = props.initialVersionId
      } else if (document.value.latest_version) {
        selectedVersionId.value = document.value.latest_version.id
      }

      // فتح تبويب التفاصيل تلقائياً للمشرف
      setTimeout(() => {
        if (isMyPendingApproval.value) {
          activeSidebarTab.value = 'info'
        } else {
          activeSidebarTab.value = 'comments'
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
  await loadDocumentData()
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
</style>
