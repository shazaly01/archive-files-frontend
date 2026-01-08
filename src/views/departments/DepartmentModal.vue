<template>
  <AppDialog :model-value="modelValue" @update:model-value="closeModal" :title="dialogTitle">
    <DepartmentForm
      :initial-data="itemToEdit"
      :is-loading="store.loading"
      :parent-options="filteredParents"
      @submit="handleSave"
      @cancel="closeModal"
    />
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDepartmentStore } from '@/stores/departmentStore'
import DepartmentForm from './DepartmentForm.vue'
import AppDialog from '@/components/ui/AppDialog.vue'

const props = defineProps({
  // التحكم في فتح/غلق النافذة
  modelValue: {
    type: Boolean,
    required: true,
  },
  // العنصر المراد تعديله (إذا كان null فهذا يعني إضافة جديد)
  itemToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useDepartmentStore()

// --- Computed Properties ---

// عنوان النافذة يتغير ديناميكياً
const dialogTitle = computed(() => {
  return props.itemToEdit ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'
})

// تصفية قائمة الآباء
// المنطق: عند التعديل، لا يجب أن يظهر القسم الحالي كخيار ليكون "أباً" لنفسه
const filteredParents = computed(() => {
  // نحصل على القائمة الكاملة من الستور
  const allDepts = store.departments || []

  if (props.itemToEdit) {
    return allDepts.filter((d) => d.id !== props.itemToEdit.id)
  }

  return allDepts
})

// --- Methods ---

function closeModal() {
  emit('update:modelValue', false)
}

async function handleSave(formData) {
  try {
    if (props.itemToEdit) {
      // حالة التعديل
      await store.updateDepartment(props.itemToEdit.id, formData)
    } else {
      // حالة الإضافة
      await store.createDepartment(formData)
    }

    // إغلاق النافذة وإشعار الأب (لأي غرض إضافي مثل عرض رسالة نجاح)
    emit('saved')
    closeModal()
  } catch (error) {
    // الأخطاء يتم التعامل معها داخل الستور وتخزينها في store.error
    // يمكن هنا إضافة كود لعرض "Toast" إذا كان لديك مكتبة تنبيهات
    console.error('Operation failed:', error)
  }
}
</script>
