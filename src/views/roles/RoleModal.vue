<!-- src/views/roles/RoleModal.vue -->
<template>
  <!-- لقد افترضت أن لديك مكون AppDialog، إذا لم يكن كذلك، يمكنك استخدام الكود الأصلي للنافذة -->
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AppInput
        id="role-name"
        label="اسم الدور"
        v-model="form.name"
        type="text"
        required
        placeholder="مثال: مشرف محتوى"
        :disabled="isDefaultRole"
      />
      <p v-if="isDefaultRole" class="text-sm text-yellow-500 mt-1">
        لا يمكن تعديل اسم الأدوار الافتراضية.
      </p>
      <!-- يمكنك إضافة عرض الأخطاء هنا إذا أردت -->
      <!-- <p v-if="errors.name" class="text-sm text-danger mt-1">{{ errors.name[0] }}</p> -->

      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
// تأكد من أن مسارات هذه المكونات صحيحة
import AppDialog from '@/components/ui/AppDialog.vue' // قد تحتاج لتعديل المسار
import AppInput from '@/components/ui/AppInput.vue' // قد تحتاج لتعديل المسار
import AppButton from '@/components/ui/AppButton.vue' // قد تحتاج لتعديل المسار

const props = defineProps({
  modelValue: Boolean,
  // تم تغيير الاسم من role إلى initialData لمطابقة المرجع
  initialData: {
    type: Object,
    default: () => null,
  },
  isSubmitting: Boolean,
  // errors: Object, // يمكنك إضافة هذا لاحقًا إذا احتجت لعرض أخطاء التحقق
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({ id: null, name: '' })

const dialogTitle = computed(() => (props.initialData?.id ? 'تعديل اسم الدور' : 'إضافة دور جديد'))

const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User'].includes(form.value.name)
})

watch(
  () => props.initialData,
  (newData) => {
    // استخدام spread operator لنسخ البيانات وتجنب الربط المباشر
    form.value = newData ? { ...newData } : { id: null, name: '' }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
