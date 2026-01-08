<!-- src/views/companies/CompanyForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <AppInput
        id="company-name"
        label="اسم الشركة"
        v-model="form.name"
        placeholder="ادخل اسم الشركة"
        required
      />
      <AppInput
        id="company-tax-number"
        label="الرقم الضريبي"
        v-model="form.tax_number"
        placeholder="ادخل الرقم الضريبي"
      />

      <AppInput
        id="company-commercial-record"
        label="رقم السجل التجاري"
        v-model="form.commercial_record"
        placeholder="ادخل رقم السجل التجاري"
      />

      <!-- === [تمت الإضافة هنا] === -->
      <AppInput
        id="company-license-number"
        label="رقم الرخصة"
        v-model="form.license_number"
        placeholder="ادخل رقم الرخصة (اختياري)"
      />
      <!-- === [نهاية الإضافة] === -->

      <AppInput
        id="company-owner-name"
        label="رئيس مجلس الادارة"
        v-model="form.owner_name"
        placeholder="ادخل الاسم "
      />
      <AppInput
        id="company-address"
        label="العنوان"
        v-model="form.address"
        placeholder="ادخل عنوان الشركة"
      />
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
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// === [تم التعديل هنا] ===
const createFreshForm = () => ({
  id: null,
  name: '',
  tax_number: '',
  commercial_record: '',
  license_number: '', // تمت إضافة الحقل الجديد
  owner_name: '',
  address: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // === [تم التعديل هنا] ===
      // املأ النموذج بالبيانات الموجودة
      form.value = {
        id: newData.id,
        name: newData.name,
        tax_number: newData.tax_number,
        commercial_record: newData.commercial_record || '',
        license_number: newData.license_number || '', // تمت إضافة الحقل الجديد
        owner_name: newData.owner_name,
        address: newData.address,
      }
    } else {
      // إعادة تعيين النموذج عند الإضافة
      form.value = createFreshForm()
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>
