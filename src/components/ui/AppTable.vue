<template>
  <!-- الحاوية الخارجية الرئيسية (لا تغيير هنا) -->
  <div
    class="bg-surface-section shadow-lg shadow-primary/5 rounded-xl border border-surface-border overflow-hidden"
  >
    <!-- الحاوية الداخلية المسؤولة عن التمرير (تم تعديلها لتكون شرطية) -->
    <div
      :class="{
        'overflow-x-auto': !isPrintable, // طبّق التمرير فقط إذا لم نكن في وضع الطباعة
        'overflow-visible': isPrintable, // اسمح بالتمدد في وضع الطباعة
      }"
    >
      <table class="min-w-full w-full divide-y-2 divide-surface-border">
        <thead class="bg-surface-ground">
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider"
              :class="header.class"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-surface-section">
          <!-- حالة التحميل -->
          <tr v-if="isLoading">
            <td :colspan="headers.length" class="px-6 py-16 text-center">
              <svg
                class="animate-spin h-8 w-8 text-primary mx-auto"
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
            </td>
          </tr>
          <!-- حالة عدم وجود بيانات -->
          <tr v-else-if="items.length === 0">
            <td :colspan="headers.length" class="px-6 py-16 text-center text-text-muted">
              لا توجد بيانات لعرضها.
            </td>
          </tr>
          <!-- عرض الصفوف -->
          <tr
            v-else
            v-for="item in items"
            :key="item.id"
            @click="handleRowClick(item)"
            class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
            :class="{ 'cursor-pointer': rowClickable }"
          >
            <td
              v-for="header in headers"
              :key="header.key"
              class="px-6 py-4 whitespace-nowrap text-sm border-t border-surface-border"
              :class="header.cellClass"
            >
              <slot :name="`cell-${header.key}`" :item="item">
                <span class="text-text-secondary">{{ item[header.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// تعريف الـ props والـ emits بشكل صريح
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
  // خاصية جديدة للتحكم في وضع الطباعة
  isPrintable: {
    type: Boolean,
    default: false,
  },
  // خاصية جديدة للتحكم في إمكانية النقر على الصف
  rowClickable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['row-click'])

// دالة جديدة لمعالجة النقر على الصف
function handleRowClick(item) {
  // لا تصدر الحدث إلا إذا كان النقر على الصف مفعّلاً
  if (props.rowClickable) {
    emit('row-click', item)
  }
}
</script>
