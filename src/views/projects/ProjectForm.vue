<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <AppInput
      id="project-title"
      label="اسم قسم الارشيف"
      v-model="form.title"
      placeholder="مثلاً: قسم الميزانية السنوية"
      :required="true"
    />

    <AppTextarea
      id="project-description"
      label="وصف القسم"
      v-model="form.description"
      placeholder="اكتب نبذة مختصرة عن أهداف هذا القسم..."
      rows="3"
    />

    <AppDropdown
      id="project-scope"
      label="نطاق الظهور"
      v-model="form.visibility_scope"
      :options="scopeOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="اختر من يشاهد هذا القسم"
      :required="true"
    />

    <div
      v-if="form.visibility_scope === 'private'"
      class="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md flex items-start gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      <span>
        المشاريع الخاصة تتطلب إضافة أعضاء يدوياً بعد الإنشاء. ستكون أنت (المدير) العضو الوحيد
        مبدئياً.
      </span>
    </div>

    <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-border">
      <AppButton type="button" variant="outline" @click="$emit('cancel')" :disabled="isLoading">
        إلغاء
      </AppButton>

      <AppButton type="submit" variant="primary" :disabled="isLoading">
        <span v-if="isLoading">جارٍ الحفظ...</span>
        <span v-else>حفظ القسم</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue' // تأكد من وجود هذا المكون أو استخدم textarea عادي

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// خيارات النطاق
const scopeOptions = [
  { label: 'عام (Public) - متاح للجميع', value: 'public' },
  { label: 'محدود بالقسم (Department)', value: 'department' },
  { label: 'خاص (Private) - دعوات فقط', value: 'private' },
]

const form = reactive({
  title: '',
  description: '',
  visibility_scope: 'public', // القيمة الافتراضية
})

// تعبئة البيانات عند التعديل
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.title = newData.title
      form.description = newData.description
      form.visibility_scope = newData.visibility_scope
    } else {
      // تصفير النموذج
      form.title = ''
      form.description = ''
      form.visibility_scope = 'public'
    }
  },
  { immediate: true },
)

function handleSubmit() {
  // إرسال البيانات للأب
  emit('submit', { ...form })
}
</script>
