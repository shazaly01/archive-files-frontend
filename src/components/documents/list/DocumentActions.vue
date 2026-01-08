<template>
  <div class="flex items-center justify-end gap-2">
    <a
      v-if="item.latest_version?.url"
      :href="item.latest_version.url"
      target="_blank"
      class="p-1.5 text-text-muted hover:text-primary transition-colors rounded-md hover:bg-surface-ground"
      title="تحميل الملف"
    >
      <ArrowDownTrayIcon class="w-5 h-5" />
    </a>

    <button
      @click="$emit('toggle-lock', item)"
      class="p-1.5 transition-colors rounded-md hover:bg-surface-ground"
      :class="[
        item.is_locked
          ? isLockedByMe(item)
            ? 'text-warning hover:text-warning-hover' // محجوز لي (أصفر)
            : 'text-gray-300 cursor-not-allowed' // محجوز لغيري (رمادي باهت)
          : 'text-text-muted hover:text-danger', // متاح (رمادي غامق)
      ]"
      :title="getLockTitle(item)"
      :disabled="item.is_locked && !isLockedByMe(item)"
    >
      <component :is="item.is_locked ? LockOpenIcon : LockClosedIcon" class="w-5 h-5" />
    </button>

    <button
      v-if="!item.is_locked"
      @click="$emit('delete', item)"
      class="p-1.5 text-text-muted hover:text-danger transition-colors rounded-md hover:bg-surface-ground"
      title="حذف الملف"
    >
      <TrashIcon class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
import {
  ArrowDownTrayIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(['toggle-lock', 'delete'])

const authStore = useAuthStore()

// التحقق مما إذا كان المستخدم الحالي هو من حجز الملف
function isLockedByMe(item) {
  return item.locked_by === authStore.user?.id
}

// تحديد نص التلميح (Tooltip) بناءً على الحالة
function getLockTitle(item) {
  if (!item.is_locked) return 'حجز الملف للتعديل (Check-out)'
  if (isLockedByMe(item)) return 'إلغاء الحجز (Check-in)'
  return 'الملف محجوز بواسطة مستخدم آخر'
}
</script>
