<template>
  <div
    class="group bg-surface-section border border-surface-border rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
    @click="$emit('click')"
  >
    <div
      class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    ></div>

    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3">
        <div
          class="p-2 rounded-lg bg-surface-ground text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300"
        >
          <component :is="scopeIcon" class="w-6 h-6" />
        </div>
        <div>
          <h3
            class="font-bold text-lg text-text-primary line-clamp-1 group-hover:text-primary transition-colors"
          >
            {{ project.title }}
          </h3>
          <p class="text-xs text-text-muted mt-0.5">
            تم التحديث {{ formatDate(project.created_at) }}
          </p>
        </div>
      </div>

      <ProjectStatusBadge :status="project.status" />
    </div>

    <p class="text-sm text-text-secondary mb-4 line-clamp-2 h-10">
      {{ project.description || 'لا يوجد وصف للمشروع.' }}
    </p>

    <div class="flex items-center justify-between pt-4 border-t border-surface-border">
      <div class="flex -space-x-2 space-x-reverse overflow-hidden">
        <div
          v-if="project.creator"
          class="w-8 h-8 rounded-full border-2 border-surface-section bg-primary/10 flex items-center justify-center text-xs font-bold text-primary"
          title="مدير المشروع"
        >
          {{ getInitials(project.creator.name) }}
        </div>
        <div
          v-if="project.members_count > 0"
          class="w-8 h-8 rounded-full border-2 border-surface-section bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-text-secondary"
        >
          +{{ project.members_count }}
        </div>
      </div>

      <div
        v-if="project.department"
        class="flex items-center gap-1 text-xs text-text-muted bg-surface-ground px-2 py-1 rounded-md"
      >
        <BuildingOfficeIcon class="w-3 h-3" />
        <span>{{ project.department.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { GlobeAltIcon, LockClosedIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline'
import ProjectStatusBadge from './ProjectStatusBadge.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

// تحديد أيقونة النطاق
const scopeIcon = computed(() => {
  switch (props.project.visibility_scope) {
    case 'public':
      return GlobeAltIcon
    case 'private':
      return LockClosedIcon
    default:
      return BuildingOfficeIcon
  }
})

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ar-EG')
}

function getInitials(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}
</script>
