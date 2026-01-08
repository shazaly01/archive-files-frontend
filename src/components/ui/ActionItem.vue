<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer group"
    :class="colorClasses.bg"
  >
    <div
      class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
      :class="colorClasses.iconBg"
    >
      <component :is="icon" class="w-5 h-5" :class="colorClasses.icon" />
    </div>

    <div class="flex-grow">
      <p class="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
        {{ title }}
      </p>
      <p class="text-xs text-text-muted">
        {{ subtitle }}
      </p>
    </div>

    <ChevronLeftIcon
      class="w-5 h-5 text-text-muted transition-transform duration-300 group-hover:-translate-x-1"
    />
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  to: {
    type: Object,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'primary', // can be 'primary', 'warning', 'info', 'secondary'
  },
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'warning':
      return {
        bg: 'hover:bg-amber-500/10',
        iconBg: 'bg-amber-500/10',
        icon: 'text-amber-500',
      }
    case 'info':
      return {
        bg: 'hover:bg-blue-500/10',
        iconBg: 'bg-blue-500/10',
        icon: 'text-blue-500',
      }
    case 'secondary':
      return {
        bg: 'hover:bg-slate-500/10',
        iconBg: 'bg-slate-500/10',
        icon: 'text-slate-500',
      }
    default: // primary
      return {
        bg: 'hover:bg-primary/10',
        iconBg: 'bg-primary/10',
        icon: 'text-primary',
      }
  }
})
</script>
