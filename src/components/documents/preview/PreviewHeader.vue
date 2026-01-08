<template>
  <header
    class="h-16 bg-surface-section border-b border-surface-border flex items-center justify-between px-4 flex-shrink-0 shadow-sm"
  >
    <div class="flex items-center gap-4 min-w-0">
      <button
        @click="$emit('close')"
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
        :class="badgeClass"
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
        :value="selectedVersionId"
        @change="$emit('update:selectedVersionId', Number($event.target.value))"
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

      <button class="btn-icon" title="رفع إصدار جديد" @click="$emit('upload')">
        <CloudArrowUpIcon class="w-5 h-5" />
      </button>

      <button
        v-if="canRequestApproval"
        class="btn-icon text-primary hover:bg-primary/10"
        title="طلب اعتماد"
        @click="$emit('request-approval')"
      >
        <CheckBadgeIcon class="w-5 h-5" />
      </button>

      <button
        class="btn-icon"
        :class="{ 'text-danger bg-danger/10': document?.is_locked }"
        @click="$emit('toggle-lock')"
        :title="document?.is_locked ? 'فك القفل' : 'حجز للتعديل'"
      >
        <component :is="document?.is_locked ? LockOpenIcon : LockClosedIcon" class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import {
  XMarkIcon,
  DocumentIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/vue/24/outline'

// استقبال البيانات من المكون الأب
const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
  currentVersion: {
    type: Object,
    default: null,
  },
  selectedVersionId: {
    type: [Number, String],
    default: null,
  },
  currentApproval: {
    type: Object,
    default: null,
  },
  canRequestApproval: {
    type: Boolean,
    default: false,
  },
})

// تعريف الأحداث التي يرسلها هذا المكون للأب
const emit = defineEmits([
  'close',
  'update:selectedVersionId',
  'upload',
  'request-approval',
  'toggle-lock',
])

// حساب حالة الاعتماد الحالية لتحديد لون الشارة
const approvalStatus = computed(() => props.currentApproval?.status)

// تحديد كلاسات الشارة بناءً على الحالة
const badgeClass = computed(() => ({
  'bg-yellow-50 text-yellow-700 border-yellow-200': approvalStatus.value === 'pending',
  'bg-green-50 text-green-700 border-green-200': approvalStatus.value === 'approved',
  'bg-red-50 text-red-700 border-red-200': approvalStatus.value === 'rejected',
}))

// دالة تنسيق الحجم (نسخناها هنا لتكون متاحة للعرض)
function formatSize(bytes) {
  if (!bytes) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB'][i]
}
</script>

<style scoped>
.btn-icon {
  @apply p-2 rounded-lg hover:bg-surface-ground text-text-secondary transition-colors;
}
</style>
