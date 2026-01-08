<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :class="statusClasses"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotClasses"></span>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true, // active, completed, archived, on_hold
  },
})

const statusLabel = computed(() => {
  const labels = {
    active: 'نشط',
    completed: 'مكتمل',
    archived: 'مؤرشف',
    on_hold: 'معلق',
  }
  return labels[props.status] || props.status
})

const statusClasses = computed(() => {
  switch (props.status) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'archived':
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    case 'on_hold':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
})

const dotClasses = computed(() => {
  switch (props.status) {
    case 'active':
      return 'bg-green-500'
    case 'completed':
      return 'bg-blue-500'
    case 'archived':
      return 'bg-gray-500'
    case 'on_hold':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
})
</script>
