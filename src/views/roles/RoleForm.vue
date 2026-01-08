<!-- src/views/roles/RoleForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <!-- حقل اسم الدور -->
      <AppInput
        id="role-name"
        label="اسم الدور"
        v-model="form.name"
        placeholder="ادخل اسم الدور"
        required
        :disabled="isDefaultRole"
      />
      <p v-if="isDefaultRole" class="text-sm text-yellow-500 -mt-2">
        لا يمكن تعديل اسم الأدوار الافتراضية.
      </p>

      <!-- مكون قائمة الصلاحيات -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
          الصلاحيات
        </label>
        <PermissionsChecklist v-model:selectedPermissions="form.permissions" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// تعريف بنية النموذج
const form = ref({
  id: null,
  name: '',
  permissions: [], // مصفوفة من أسماء الصلاحيات
})

// التحقق مما إذا كان الدور هو دور افتراضي لا يمكن تعديل اسمه
const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User'].includes(form.value.name)
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        name: newData.name,
        // استخراج أسماء الصلاحيات فقط من الكائنات
        permissions: newData.permissions ? newData.permissions.map((p) => p.name) : [],
      }
    } else {
      // إعادة تعيين النموذج عند إضافة دور جديد
      form.value = { id: null, name: '', permissions: [] }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
