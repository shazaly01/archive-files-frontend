<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-12" preserveAspectRatio="none">
    <path
      :d="sparklinePath"
      :stroke="color"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  width: { type: Number, default: 100 },
  height: { type: Number, default: 40 },
  color: { type: String, default: 'currentColor' },
})

const sparklinePath = computed(() => {
  if (!props.data || props.data.length < 2) return ''
  const max = Math.max(...props.data)
  const min = Math.min(...props.data)
  const range = max - min || 1
  const points = props.data.map((d, i) => {
    const x = (i / (props.data.length - 1)) * props.width
    const y = props.height - ((d - min) / range) * props.height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  return `M ${points.join(' L ')}`
})
</script>
