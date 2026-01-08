<template>
  <AppTable :headers="headers" :items="items" :is-loading="isLoading" :row-clickable="false">
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
      <div v-if="item.is_locked" class="flex items-center justify-center gap-1.5 text-danger">
        <LockClosedIcon class="w-4 h-4" />
        <span class="text-xs font-medium">
          {{ isLockedByMe(item) ? 'محجوز بواسطتك' : 'محجوز' }}
        </span>

        <div v-if="!isLockedByMe(item)" class="group relative">
          <InformationCircleIcon class="w-4 h-4 text-text-muted cursor-help" />
          <div
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10"
          >
            بواسطة: {{ item.locked_by_user?.name || 'مستخدم آخر' }}
          </div>
        </div>
      </div>

      <div v-else class="text-success flex items-center justify-center gap-1">
        <span class="w-2 h-2 rounded-full bg-success"></span>
        <span class="text-xs">متاح</span>
      </div>
    </template>

    <template #cell-actions="{ item }">
      <DocumentActions
        :item="item"
        @toggle-lock="$emit('toggle-lock', item)"
        @delete="$emit('delete', item)"
      />
    </template>
  </AppTable>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import AppTable from '@/components/ui/AppTable.vue'
import DocumentActions from './DocumentActions.vue'

// استيراد الأيقونات
import {
  DocumentIcon,
  PhotoIcon,
  TableCellsIcon,
  DocumentTextIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['preview', 'toggle-lock', 'delete'])

const authStore = useAuthStore()

// --- دوال مساعدة للعرض ---

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
  return item.locked_by === authStore.user?.id
}
</script>
