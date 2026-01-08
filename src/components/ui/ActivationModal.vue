<template>
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <AppCard class="w-full max-w-lg transform transition-transform scale-100">
      <form @submit.prevent="handleSubmit">
        <h2
          class="text-2xl font-bold text-gray-800 dark:text-text-primary border-b border-gray-200 dark:border-surface-border pb-4 mb-6"
        >
          تفعيل اشتراك الجهاز
        </h2>

        <div class="space-y-4">
          <div>
            <AppInput
              id="start_date"
              label="تاريخ بدء الاشتراك"
              v-model="formData.startDate"
              type="date"
              required
            />
          </div>

          <!-- [تعديل 1] تم إخفاء حقل مدة الاشتراك. لم يعد المستخدم بحاجة لإدخاله. -->
          <!-- يمكنك حذفه تمامًا إذا أردت، أو إبقاؤه كـ type="hidden" -->
          <input type="hidden" v-model="formData.durationMonths" />

          <div>
            <AppInput
              id="check_period_days"
              label="فترة الفحص (بالأيام قبل الانتهاء)"
              v-model="formData.checkPeriodDays"
              type="number"
              min="1"
              required
            />
          </div>

          <!-- [تعديل 2] عرض تاريخ الانتهاء المتوقع (الآن بتنسيق رقمي) -->
          <div
            v-if="expectedEndDate"
            class="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-center"
          >
            <span class="text-sm text-blue-700 dark:text-blue-300 font-medium">
              تاريخ الانتهاء المتوقع:
              <strong class="font-bold" style="direction: ltr; display: inline-block">{{
                expectedEndDate
              }}</strong>
            </span>
          </div>
        </div>

        <div
          class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-gray-200 dark:border-surface-border pt-6"
        >
          <AppButton type="button" variant="outline" @click="$emit('close')"> إلغاء </AppButton>
          <AppButton type="submit"> تفعيل </AppButton>
        </div>
      </form>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const emit = defineEmits(['close', 'activate'])

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// [تعديل 3] تبسيط بيانات النموذج
const formData = ref({
  startDate: getTodayDate(),
  durationMonths: 1, // القيمة الآن ثابتة على 1
  checkPeriodDays: 7,
})

// [تعديل 4] تحديث الخاصية المحسوبة لتنسيق التاريخ بالأرقام
const expectedEndDate = computed(() => {
  if (!formData.value.startDate) {
    return null
  }
  try {
    const startDate = new Date(formData.value.startDate)
    const duration = 1 // المدة ثابتة دائمًا على شهر واحد
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + duration))

    // تنسيق التاريخ ليكون YYYY/MM/DD
    const year = endDate.getFullYear()
    const month = String(endDate.getMonth() + 1).padStart(2, '0') // +1 لأن الشهور تبدأ من 0
    const day = String(endDate.getDate()).padStart(2, '0')

    return `${year}/${month}/${day}`
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null
  }
})

// دالة الإرسال لم تتغير، وسترسل دائمًا شهرًا واحدًا
const handleSubmit = () => {
  emit('activate', {
    subscription_start_date: formData.value.startDate,
    subscription_duration_months: formData.value.durationMonths, // سترسل دائمًا 1
    check_period_days: parseInt(formData.value.checkPeriodDays, 10),
  })
}
</script>
