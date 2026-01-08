<template>
  <component
    :is="wrapperComponent"
    :to="to"
    class="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out group border border-transparent"
    :class="[colorClasses.bg, { 'cursor-pointer hover:shadow-md hover:border-primary/20': !!to }]"
  >
    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <p class="font-bold text-text-primary text-sm">{{ title }}</p>
        <component
          :is="icon"
          class="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
          :class="colorClasses.icon"
        />
      </div>
      <p class="text-3xl font-extrabold text-text-primary mt-4">{{ value }}</p>
      <slot name="extra"></slot>
    </div>

    <div
      class="absolute -bottom-6 -end-6 text-current opacity-5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125"
      :class="colorClasses.icon"
    >
      <component :is="icon" class="w-28 h-28" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [Object, String],
    default: null,
  },
  title: String,
  value: [String, Number],
  icon: [Object, Function],
  color: {
    type: String,
    default: 'primary',
  },
})

const wrapperComponent = computed(() => (props.to ? RouterLink : 'div'))

const colorClasses = computed(() => {
  switch (props.color) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20',
        icon: 'text-green-600',
      }
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20',
        icon: 'text-yellow-600',
      }
    case 'purple': // [جديد]
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20',
        icon: 'text-purple-600',
      }
    case 'gray': // [جديد]
      return {
        bg: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
        icon: 'text-gray-600',
      }
    default: // Primary (Blue)
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20',
        icon: 'text-blue-600',
      }
  }
})
</script>
