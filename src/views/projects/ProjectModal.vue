<template>
  <AppDialog :model-value="modelValue" @update:model-value="closeModal" :title="dialogTitle">
    <ProjectForm
      :initial-data="itemToEdit"
      :is-loading="store.loading"
      @submit="handleSave"
      @cancel="closeModal"
    />
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore' // 1. استيراد ستور المصادقة
import ProjectForm from './ProjectForm.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  itemToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const store = useProjectStore()
const authStore = useAuthStore() // 2. تهيئة الستور

const dialogTitle = computed(() => {
  return props.itemToEdit ? 'تعديل بيانات المشروع' : 'إنشاء مشروع جديد'
})

function closeModal() {
  emit('update:modelValue', false)
}

async function handleSave(formData) {
  // 3. المنطق الجديد: التحقق من النطاق وإضافة القسم تلقائياً
  // نقوم بإنشاء نسخة من البيانات لتعديلها
  const payload = { ...formData }

  if (payload.visibility_scope === 'department') {
    // إذا لم يكن هناك قسم محدد يدوياً، نستخدم قسم المستخدم الحالي
    if (!payload.department_id && authStore.user?.department_id) {
      payload.department_id = authStore.user.department_id
    }

    // حماية إضافية: إذا بقي القسم فارغاً رغم اختيار نطاق القسم
    if (!payload.department_id) {
      // يمكنك إظهار تنبيه هنا أو ترك الباك إند يعيد الخطأ
      console.warn('تنبيه: محاولة إنشاء مشروع لنطاق القسم بدون تحديد قسم')
    }
  }

  try {
    if (props.itemToEdit) {
      // نرسل الـ payload المعدل بدلاً من formData الخام
      await store.updateProject(props.itemToEdit.id, payload)
    } else {
      await store.createProject(payload)
    }

    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Operation failed:', error)
  }
}
</script>
