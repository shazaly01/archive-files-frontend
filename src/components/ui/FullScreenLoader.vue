<template>
  <!--
    استخدمنا Transition لجعل ظهور واختفاء شاشة التحميل أكثر سلاسة.
  -->
  <Transition
    enter-active-class="transition-opacity ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <!--
      v-if="show": يتحكم في ظهور المكون.
      z-50: يضمن أن شاشة التحميل فوق كل العناصر الأخرى.
      fixed inset-0: يجعلها تملأ الشاشة بأكملها.
      bg-black bg-opacity-75: خلفية سوداء شبه شفافة.
      flex items-center justify-center: لتوسيط محتوى التحميل.
    -->
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75"
    >
      <!-- أيقونة التحميل (Spinner) -->
      <svg
        class="h-12 w-12 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <!-- رسالة نصية اختيارية -->
      <p v-if="message" class="mt-4 text-lg text-white">{{ message }}</p>
    </div>
  </Transition>
</template>

<script setup>
// المكون يستقبل خاصيتين:
// show: للتحكم في ظهوره (true/false ).
// message: لعرض رسالة اختيارية تحت أيقونة التحميل.
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: 'جاري التحميل...', // رسالة افتراضية
  },
})
</script>
