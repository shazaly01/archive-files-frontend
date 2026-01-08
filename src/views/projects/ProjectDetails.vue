<template>
  <div
    v-if="projectStore.loading && !projectStore.currentProject"
    class="flex h-screen items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="text-text-muted">جارٍ تحميل البيانات...</p>
    </div>
  </div>

  <div v-else-if="projectStore.currentProject" class="min-h-screen bg-surface-ground pb-10">
    <header class="bg-surface-section border-b border-surface-border sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push({ name: 'ProjectsList' })"
            class="p-2 rounded-full hover:bg-surface-ground text-text-secondary transition-colors"
            title="عودة للقائمة"
          >
            <ArrowRightIcon class="w-5 h-5" />
          </button>

          <div>
            <div class="flex items-center gap-2 text-xs text-text-muted mb-0.5">
              <span>المشاريع</span>
              <span class="text-gray-300">/</span>
              <span>{{ project.visibility_scope === 'private' ? 'خاص' : 'عام' }}</span>
            </div>
            <h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
              {{ project.title }}
              <ProjectStatusBadge :status="project.status" />
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="isManager" class="relative">
            <button
              @click="toggleSettingsMenu"
              class="p-2 text-text-muted hover:text-primary transition-colors rounded-full"
              :class="{ 'bg-gray-100 text-primary': showSettingsMenu }"
            >
              <Cog6ToothIcon class="w-6 h-6" />
            </button>
            <div
              v-if="showSettingsMenu"
              class="absolute left-0 mt-2 w-48 bg-white dark:bg-surface-section border border-gray-200 dark:border-surface-border rounded-lg shadow-lg py-1 z-50"
            >
              <button
                @click="openEditModal"
                class="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-surface-ground flex gap-2"
              >
                <PencilSquareIcon class="w-4 h-4 text-blue-500" /> تعديل البيانات
              </button>
              <button
                @click="handleArchiveProject"
                class="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-surface-ground flex gap-2"
              >
                <ArchiveBoxIcon class="w-4 h-4 text-orange-500" /> أرشفة المشروع
              </button>
              <button
                @click="handleDeleteProject"
                class="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex gap-2 border-t dark:border-gray-700"
              >
                <TrashIcon class="w-4 h-4" /> حذف المشروع
              </button>
            </div>
            <div
              v-if="showSettingsMenu"
              class="fixed inset-0 z-40"
              @click="showSettingsMenu = false"
            ></div>
          </div>

          <AppButton variant="primary" @click="openUploadModal">
            <span class="flex items-center gap-2">
              <CloudArrowUpIcon class="w-5 h-5" />
              <span class="hidden sm:inline">رفع ملف</span>
            </span>
          </AppButton>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside class="lg:col-span-1 space-y-6">
          <div class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-text-primary mb-4 border-b border-surface-border pb-2">
              حول المشروع
            </h3>

            <p class="text-sm text-text-secondary leading-relaxed mb-6">
              {{ project.description || 'لا يوجد وصف متاح لهذا المشروع.' }}
            </p>

            <div class="space-y-4">
              <div v-if="project.department" class="flex items-start gap-3">
                <BuildingOfficeIcon class="w-5 h-5 text-text-muted mt-0.5" />
                <div>
                  <p class="text-xs text-text-muted">القسم التابع له</p>
                  <p class="text-sm font-medium text-text-primary">{{ project.department.name }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <CalendarIcon class="w-5 h-5 text-text-muted mt-0.5" />
                <div>
                  <p class="text-xs text-text-muted">تاريخ البدء</p>
                  <p class="text-sm font-medium text-text-primary">
                    {{ formatDate(project.created_at) }}
                  </p>
                </div>
              </div>

              <div v-if="project.creator" class="flex items-start gap-3">
                <UserCircleIcon class="w-5 h-5 text-text-muted mt-0.5" />
                <div>
                  <p class="text-xs text-text-muted">مدير المشروع</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div
                      class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold"
                    >
                      {{ getInitials(project.creator?.full_name) }}
                    </div>
                    <span class="text-sm text-text-primary">{{ project.creator?.full_name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4 border-b border-surface-border pb-2">
              <h3 class="font-bold text-text-primary">فريق العمل</h3>
              <span class="text-xs bg-surface-ground px-2 py-1 rounded-full text-text-muted">
                {{ project.members ? project.members.length : 0 }}
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="member in project.members"
                :key="member.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-ground transition-colors group"
              >
                <div
                  class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-text-secondary flex-shrink-0"
                >
                  {{ getInitials(member.full_name) }}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-text-primary truncate">
                    {{ member.full_name }}
                  </p>
                  <p class="text-xs text-text-muted flex items-center gap-1">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="member.pivot?.role === 'manager' ? 'bg-purple-500' : 'bg-blue-500'"
                    ></span>
                    {{ member.pivot?.role === 'manager' ? 'مدير المشروع' : 'عضو فريق' }}
                  </p>
                </div>
              </div>

              <button
                v-if="isManager"
                @click="showMembersModal = true"
                class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-ground transition-colors text-primary border border-dashed border-primary/30 hover:border-primary mt-2 group"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors"
                >
                  <PlusIcon class="w-5 h-5" />
                </div>
                <span class="text-sm font-medium">إضافة عضو جديد</span>
              </button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-3">
          <div class="border-b border-surface-border mb-6">
            <nav class="flex gap-6" aria-label="Tabs">
              <button
                class="border-b-2 py-4 px-1 text-sm font-medium transition-colors"
                :class="[
                  activeTab === 'files'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-gray-300',
                ]"
                @click="activeTab = 'files'"
              >
                الملفات والمستندات
              </button>
              <button
                class="border-b-2 py-4 px-1 text-sm font-medium transition-colors"
                :class="[
                  activeTab === 'activity'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-gray-300',
                ]"
                @click="activeTab = 'activity'"
              >
                سجل النشاطات
              </button>
            </nav>
          </div>

          <div v-if="activeTab === 'files'">
            <DocumentList v-if="project.id" :project-id="project.id" @preview="openPreview" />
          </div>

          <div v-else class="text-center py-12 text-text-muted">قريباً: سجل نشاطات المشروع</div>
        </div>
      </div>
    </main>

    <DocumentUploadModal
      v-model="showUploadModal"
      :project-id="project.id"
      @uploaded="onDocumentUploaded"
    />

    <DocumentPreviewModal v-model="showPreview" :document-id="selectedDocumentId" />

    <ProjectMembersModal
      v-if="project.id"
      v-model="showMembersModal"
      :project-id="project.id"
      :project-creator-id="project.created_by"
      :current-members="project.members"
      @refresh="refreshProjectData"
    />

    <ProjectModal
      v-if="project.id"
      v-model="showEditModal"
      :item-to-edit="project"
      @saved="refreshProjectData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentStore } from '@/stores/documentStore'

// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import ProjectStatusBadge from '@/components/projects/ProjectStatusBadge.vue'
import DocumentUploadModal from '@/components/documents/DocumentUploadModal.vue'
import DocumentList from '@/components/documents/DocumentList.vue'
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal.vue'
import ProjectMembersModal from '@/components/projects/ProjectMembersModal.vue' // [جديد]
import ProjectModal from '@/views/projects/ProjectModal.vue'

// استيراد الأيقونات
import {
  ArrowRightIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const documentStore = useDocumentStore()

// الحالة المحلية
const activeTab = ref('files')
const showUploadModal = ref(false)
const showPreview = ref(false)
const showMembersModal = ref(false) // [جديد]
const showEditModal = ref(false)
const showSettingsMenu = ref(false)
const selectedDocumentId = ref(null)

// البيانات المحسوبة
const project = computed(() => projectStore.currentProject || {})

const isManager = computed(() => {
  if (!project.value.members || !authStore.user) return false
  if (project.value.created_by === authStore.user.id) return true
  const memberRecord = project.value.members.find((m) => m.id === authStore.user.id)
  return memberRecord && memberRecord.pivot && memberRecord.pivot.role === 'manager'
})

// الدوال المساعدة
function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function openUploadModal() {
  showUploadModal.value = true
}

function openPreview(document) {
  selectedDocumentId.value = document.id
  showPreview.value = true
}

function onDocumentUploaded() {
  if (project.value.id) {
    documentStore.fetchProjectDocuments(project.value.id)
  }
}

// [جديد] دالة تحديث بيانات المشروع (بعد إضافة/حذف عضو)
function refreshProjectData() {
  const projectId = route.params.id
  projectStore.fetchProject(projectId)
}

function toggleSettingsMenu() {
  showSettingsMenu.value = !showSettingsMenu.value
}

function openEditModal() {
  showSettingsMenu.value = false
  showEditModal.value = true
}

async function handleArchiveProject() {
  showSettingsMenu.value = false
  if (!confirm('هل أنت متأكد من تغيير حالة أرشفة هذا المشروع؟')) return
  await projectStore.archiveProject(project.value.id)
  refreshProjectData()
}

async function handleDeleteProject() {
  showSettingsMenu.value = false
  if (!confirm('تحذير: هل أنت متأكد من حذف المشروع نهائياً؟')) return
  await projectStore.deleteProject(project.value.id)
  router.push({ name: 'ProjectsList' })
}

// جلب البيانات عند التحميل
onMounted(() => {
  const projectId = route.params.id
  projectStore.fetchProject(projectId)
})

// أضف هذا للمراقبة
import { watch } from 'vue'

watch(
  () => projectStore.currentProject,
  (newVal) => {
    if (newVal && newVal.members) {
      console.log('🔥 Project Data Loaded:', newVal)
      console.log('👤 Current User ID:', authStore.user?.id)
      console.log('👑 Project Creator ID:', newVal.created_by)
      console.log('👥 Members List:', newVal.members)

      // فحص أول عضو لنرى هيكل البيانات
      if (newVal.members.length > 0) {
        console.log('🔍 First Member Structure:', newVal.members[0])
        // هل الحقل هو pivot.role أم project_role ؟
      }
    }
  },
)
</script>
