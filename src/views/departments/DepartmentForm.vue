<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <AppInput
      id="dept-name"
      label="اسم الادارة"
      v-model="form.name"
      placeholder="أدخل اسم الادارة (مثلاً: الموارد البشرية)"
      :required="true"
    />

    <AppDropdown
      id="dept-parent"
      label="الادارة الرئيسية (اختياري)"
      v-model="form.parent_id"
      :options="parentOptions"
      optionLabel="name"
      optionValue="id"
      placeholder="بدون ادارة رئيسية (قسم جذري)"
      :showClear="true"
    />

    <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-border">
      <AppButton type="button" variant="outline" @click="$emit('cancel')" :disabled="isLoading">
        إلغاء
      </AppButton>

      <AppButton type="submit" variant="primary" :disabled="isLoading">
        <span v-if="isLoading">جارٍ الحفظ...</span>
        <span v-else>حفظ البيانات</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

// المكونات المستوردة (تأكد من مسار الاستيراد الصحيح لديك)
// افترضت أنها مسجلة عالمياً أو موجودة في ui/
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  // البيانات الأولية (في حالة التعديل)
  initialData: {
    type: Object,
    default: () => null,
  },
  // حالة التحميل (لتعطيل الأزرار)
  isLoading: {
    type: Boolean,
    default: false,
  },
  // قائمة الأقسام المتاحة للأب (تأتي مفلترة من الخارج)
  parentOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit', 'cancel'])

// الحالة المحلية للنموذج
const form = reactive({
  name: '',
  parent_id: null,
})

// مراقبة البيانات الأولية لتعبئة النموذج عند الفتح للتعديل
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.name = newData.name
      // التأكد من أن parent_id رقم أو null (حسب ما يرجع من الـ API)
      form.parent_id = newData.parent_id || null
    } else {
      // تصفير النموذج في حالة الإضافة
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  form.name = ''
  form.parent_id = null
}

function handleSubmit() {
  // إرسال نسخة من البيانات لتجنب التعديل بالمرجع
  emit('submit', { ...form })
}
</script>
