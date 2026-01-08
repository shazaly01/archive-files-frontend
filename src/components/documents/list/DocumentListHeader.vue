<template>
  <div class="flex items-center justify-between pb-4">
    <div class="relative w-64">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        placeholder="بحث في الملفات..."
        class="w-full pl-4 pr-10 py-2 bg-surface-ground border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary placeholder:text-text-muted transition-shadow"
      />
      <div class="absolute right-3 top-2.5 text-text-muted pointer-events-none">
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

    <div class="flex gap-2">
      <button
        @click="$emit('refresh')"
        class="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-ground"
        title="تحديث القائمة"
        :disabled="loading"
      >
        <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:searchQuery', 'refresh'])
</script>
