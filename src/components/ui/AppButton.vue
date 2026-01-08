<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-bold rounded-lg shadow-md focus:outline-none transition-all duration-200 ease-in-out"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger, outline
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const buttonClasses = computed(() => {
  const classes = []

  // --- كلاسات الحجم (لم تتغير) ---
  if (props.size === 'sm') {
    classes.push('px-3 py-1.5 text-sm')
  } else if (props.size === 'lg') {
    classes.push('px-6 py-3 text-lg')
  } else {
    classes.push('px-4 py-2 text-base') // md (default)
  }

  switch (props.variant) {
    // [الإضافة الجديدة هنا]
    case 'success':
      // لون أخضر ثابت في كلا الوضعين
      classes.push(
        'bg-green-600 text-white focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:focus:ring-green-500',
      )
      break

    // [الإضافة الجديدة هنا]
    case 'warning':
      // لون أصفر/برتقالي ثابت في كلا الوضعين
      classes.push(
        'bg-yellow-500 text-white focus:ring-2 focus:ring-yellow-400 dark:bg-yellow-600 dark:focus:ring-yellow-600',
      )
      break

    case 'danger':
      // لون أحمر ثابت في كلا الوضعين
      classes.push('bg-danger text-white focus:ring-2 focus:ring-danger')
      break
    case 'secondary':
      // لون رمادي في الوضع الفاتح، ولون سماوي في الوضع الليلي
      classes.push(
        'bg-gray-200 text-gray-800 focus:ring-2 focus:ring-gray-400 dark:bg-secondary dark:text-black dark:focus:ring-secondary',
      )
      break
    case 'outline':
      // حدود رمادية في الوضع الفاتح، وحدود داكنة في الوضع الليلي
      classes.push(
        'bg-transparent border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-surface-border dark:text-text-secondary dark:hover:bg-surface-section dark:hover:text-primary dark:focus:ring-primary',
      )
      break
    default: // primary
      // لون أزرق في الوضع الفاتح، ولون بنفسجي في الوضع الليلي
      classes.push(
        'bg-blue-600 text-white focus:ring-2 focus:ring-blue-500 dark:bg-primary dark:focus:ring-primary',
      )
      break
  }

  // --- حالة التعطيل ---
  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed')
  } else {
    // تأثير حركة عند المرور
    classes.push('hover:-translate-y-0.5')
  }

  return classes.join(' ')
})
</script>
