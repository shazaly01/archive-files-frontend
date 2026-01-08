<template>
  <div class="p-6 space-y-6 min-h-screen">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">مستكشف المشاريع</h1>
        <p class="text-text-secondary mt-1">
          إدارة وتتبع مساحات العمل والمشاريع الخاصة بك وبالشركة.
        </p>
      </div>
      <AppButton variant="primary" @click="openCreateModal">
        <span class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>مشروع جديد</span>
        </span>
      </AppButton>
    </div>

    <div
      class="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-section p-2 rounded-xl border border-surface-border"
    >
      <div class="flex p-1 bg-surface-ground rounded-lg w-full md:w-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="changeTab(tab.value)"
          class="flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
          :class="[
            currentScope === tab.value
              ? 'bg-white dark:bg-surface-section text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="relative w-full md:w-64">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="بحث عن مشروع..."
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
    </div>

    <div
      v-if="store.loading && !store.projects.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div v-for="i in 6" :key="i" class="h-48 bg-surface-border/30 animate-pulse rounded-xl"></div>
    </div>

    <div
      v-else-if="!store.loading && store.projects.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="w-16 h-16 bg-surface-ground rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-text-primary">لا توجد مشاريع</h3>
      <p class="text-text-muted mt-1 max-w-sm">
        لم يتم العثور على مشاريع في هذا النطاق. جرب تغيير التبويب أو إنشاء مشروع جديد.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="project in store.projects"
        :key="project.id"
        :project="project"
        @click="goToProjectDetails(project.id)"
      />
    </div>

    <div
      v-if="store.pagination.meta && store.pagination.meta.last_page > 1"
      class="flex justify-center pt-6"
    >
      <div class="flex gap-2">
        <AppButton
          variant="outline"
          size="sm"
          :disabled="!store.pagination.links?.prev"
          @click="changePage(store.pagination.meta.current_page - 1)"
        >
          السابق
        </AppButton>
        <span
          class="px-4 py-2 text-sm text-text-secondary bg-surface-ground rounded-md border border-surface-border"
        >
          {{ store.pagination.meta.current_page }} / {{ store.pagination.meta.last_page }}
        </span>
        <AppButton
          variant="outline"
          size="sm"
          :disabled="!store.pagination.links?.next"
          @click="changePage(store.pagination.meta.current_page + 1)"
        >
          التالي
        </AppButton>
      </div>
    </div>

    <ProjectModal v-model="showCreateModal" @saved="onProjectCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'

// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectModal from './ProjectModal.vue' // تأكد من المسار

const router = useRouter()
const store = useProjectStore()

// الحالة المحلية
const showCreateModal = ref(false)
const searchQuery = ref('')
const currentScope = ref('mine') // القيمة الافتراضية: مشاريعي

// تعريف التبويبات
const tabs = [
  { label: 'مشاريعي', value: 'mine' },
  { label: 'مشاريع القسم', value: 'department' },
  { label: 'الأرشيف العام', value: 'public' },
]

// دالة جلب البيانات
function fetchProjects(page = 1) {
  store.fetchProjects(page, searchQuery.value, currentScope.value)
}

// عند التحميل
onMounted(() => {
  fetchProjects()
})

// مراقبة البحث (تحديث مع تأخير بسيط يمكن إضافته لاحقاً، الآن مباشر عند الضغط Enter)
function handleSearch() {
  fetchProjects(1) // العودة للصفحة الأولى عند البحث
}

// تغيير التبويب
function changeTab(scope) {
  currentScope.value = scope
  fetchProjects(1) // إعادة تحميل البيانات بالنطاق الجديد
}

// تغيير الصفحة
function changePage(page) {
  fetchProjects(page)
}

// فتح المودال
function openCreateModal() {
  showCreateModal.value = true
}

// عند إنشاء مشروع بنجاح
function onProjectCreated() {
  // نعيد تحميل القائمة (عادة ننتقل لتبويب "مشاريعي" لأن الجديد سيظهر هناك)
  if (currentScope.value !== 'mine') {
    currentScope.value = 'mine'
  }
  fetchProjects(1)
}

// الانتقال للتفاصيل
function goToProjectDetails(id) {
  // نوجه المستخدم لصفحة التفاصيل (التي سنبنيها لاحقاً)
  // تأكد أن هذا الاسم مطابق لما في router/index.js (حالياً هو معلق، سنفعله قريباً)
  router.push({ name: 'ProjectDetails', params: { id } })
}

// مراقبة تغيير البحث لتنفيذه تلقائياً عند مسح النص
watch(searchQuery, (newVal) => {
  if (newVal === '') {
    fetchProjects(1)
  }
})
</script>
