<template>
  <div
    class="flex items-center gap-4 p-4 border-b border-surface-border last:border-0 hover:bg-surface-ground/50 transition-colors duration-200"
  >
    <div class="flex-shrink-0">
      <div
        class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg"
      >
        {{ userInitial }}
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-text-primary truncate">
        {{ activity.user }}
      </p>
      <p class="text-sm text-text-secondary truncate">
        {{ activity.action }}
      </p>
    </div>

    <div class="text-xs text-text-muted whitespace-nowrap flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clip-rule="evenodd"
        />
      </svg>
      {{ activity.time_ago }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true,
    // المتوقع: { id, user, action, time_ago }
  },
})

// استخراج الحرف الأول من اسم المستخدم
const userInitial = computed(() => {
  return props.activity.user ? props.activity.user.charAt(0).toUpperCase() : '?'
})
</script>
