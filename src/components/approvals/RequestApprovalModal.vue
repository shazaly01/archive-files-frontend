<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="طلب اعتماد للمستند"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div
        class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
      >
        <p class="text-sm text-blue-800 dark:text-blue-200 flex gap-2">
          <InformationCircleIcon class="w-5 h-5 flex-shrink-0" />
          <span>
            أنت بصدد طلب اعتماد للإصدار رقم <span class="font-bold">v{{ versionNumber }}</span
            >. بمجرد الإرسال، سيتم إشعار المدير ولن تتمكن من تعديل الملف حتى يتم الرد.
          </span>
        </p>
      </div>

      <div class="space-y-1">
        <label class="block text-sm font-medium text-text-primary">اختر المسؤول عن الاعتماد</label>
        <div class="relative">
          <select
            v-model="selectedApproverId"
            class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2.5 pl-10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            required
          >
            <option value="" disabled>-- اختر من القائمة --</option>
            <option v-for="member in members" :key="member.id" :value="member.id">
              {{ member.full_name }} ({{ member.pivot?.role === 'manager' ? 'مدير' : 'عضو' }})
            </option>
          </select>
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
          >
            <UserCircleIcon class="w-5 h-5" />
          </div>
        </div>
      </div>

      <div v-if="store.error" class="text-xs text-danger mt-1">
        {{ store.error }}
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-surface-border mt-4">
        <AppButton variant="outline" type="button" @click="$emit('update:modelValue', false)"
          >إلغاء</AppButton
        >
        <AppButton variant="primary" type="submit" :disabled="!selectedApproverId || loading">
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            جارٍ الإرسال...
          </span>
          <span v-else>إرسال الطلب</span>
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref } from 'vue'
import { useApprovalStore } from '@/stores/approvalStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { InformationCircleIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Boolean,
  versionId: { type: [Number, String], required: true },
  versionNumber: { type: [Number, String], required: true },
  members: { type: Array, default: () => [] }, // قائمة الأعضاء (للاختيار منهم)
})

const emit = defineEmits(['update:modelValue', 'requested'])
const store = useApprovalStore()

const selectedApproverId = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!selectedApproverId.value) return

  loading.value = true
  try {
    await store.requestApproval(props.versionId, selectedApproverId.value)
    emit('requested') // إشعار بنجاح العملية
    emit('update:modelValue', false) // إغلاق المودال
    selectedApproverId.value = '' // تصفير الاختيار
  } catch (error) {
    // الخطأ معروض بالفعل عبر store.error
  } finally {
    loading.value = false
  }
}
</script>
