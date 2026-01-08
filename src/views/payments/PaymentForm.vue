<template>
  <!-- تم تغيير @submit.prevent إلى النموذج نفسه -->
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5 bg-surface-ground p-4 rounded-md">
      <h4 class="text-md font-semibold text-text-secondary border-b border-surface-border pb-2">
        {{ form.id ? 'تعديل الدفعة' : 'إضافة دفعة جديدة' }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- حقل مبلغ الدفعة -->
        <AppInput
          id="payment-amount"
          label="مبلغ الدفعة"
          v-model="form.amount"
          type="number"
          step="0.01"
          placeholder="ادخل مبلغ الدفعة"
          required
        />

        <!-- === [تعديل هنا] === -->
        <!-- حقل تاريخ الدفعة -->
        <AppInput
          id="payment-date"
          label="تاريخ الدفعة"
          v-model="form.payment_date"
          type="date"
          required
        />
      </div>

      <!-- حقل الملاحظات -->
      <AppTextarea
        id="payment-notes"
        label="ملاحظات (اختياري)"
        v-model="form.notes"
        placeholder="ادخل أي ملاحظات تخص هذه الدفعة"
        rows="3"
      />
    </div>

    <!-- أزرار الإجراءات -->
    <div class="mt-6 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

// استيراد مكونات UI
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  projectId: { type: Number, required: true },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

// === [تعديل هنا] ===
// دالة لإنشاء نموذج فارغ مع project_id
const createFreshForm = () => ({
  id: null,
  project_id: props.projectId,
  amount: '',
  payment_date: new Date().toISOString().split('T')[0], // تم تغيير الاسم
  notes: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // === [تعديل هنا] ===
      // املأ النموذج للتعديل
      form.value = {
        id: newData.id,
        project_id: newData.project_id,
        amount: newData.amount,
        payment_date: new Date(newData.payment_date).toISOString().split('T')[0], // تم تغيير الاسم
        notes: newData.notes || '',
      }
    } else {
      // أعد التعيين للإضافة
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // لم يعد هناك حاجة لتعديل payload هنا لأن الأسماء متطابقة
  emit('submit', { ...form.value, amount: parseFloat(form.value.amount) })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
