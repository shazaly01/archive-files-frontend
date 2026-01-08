<!-- src/views/roles/PermissionsModal.vue -->
<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
    @click.self="close"
  >
    <div
      class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-3xl transform transition-all duration-300 scale-95"
      :class="{ 'scale-100': modelValue }"
    >
      <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-semibold text-text-primary">
          تعديل صلاحيات دور: <span class="font-bold text-primary">{{ role?.name }}</span>
        </h3>
        <button
          @click="close"
          class="text-text-muted hover:text-text-primary text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto pr-2">
        <PermissionsChecklist v-model:selectedPermissions="selectedPermissions" />
      </div>

      <div class="mt-8 flex justify-end gap-4">
        <AppButton type="button" variant="secondary" @click="close"> إلغاء </AppButton>
        <AppButton @click="handleSave" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>حفظ الصلاحيات</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  role: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const selectedPermissions = ref([])

// هذا الـ watcher مهم لتعبئة الصلاحيات عند فتح النافذة
watch(
  () => props.role,
  (newRole) => {
    if (newRole && props.modelValue) {
      // املأ الصلاحيات الحالية للدور
      selectedPermissions.value = newRole.permissions ? newRole.permissions.map((p) => p.name) : []
    }
  },
  { immediate: true }, // immediate: true تضمن تشغيله عند تحميل المكون لأول مرة
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSave = () => {
  // تأكد من وجود الدور قبل إرسال البيانات
  if (!props.role) return

  const payload = {
    id: props.role.id,
    name: props.role.name, // يجب إرسال الاسم لتجنب فشل التحقق في الـ Backend
    permissions: selectedPermissions.value,
  }
  emit('save', payload)
}
</script>
