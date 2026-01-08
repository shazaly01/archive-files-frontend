<template>
  <div class="bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-xl p-4 shadow-sm mt-4">
    <div class="flex items-start gap-3 mb-3">
      <div class="p-2 bg-primary/10 rounded-full text-primary">
        <ScaleIcon class="w-6 h-6" />
      </div>
      <div>
        <h3 class="font-bold text-text-primary">مطلوب قرارك</h3>
        <p class="text-sm text-text-secondary">أنت المسؤول عن اعتماد هذا الإصدار.</p>
      </div>
    </div>

    <form @submit.prevent class="space-y-3">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">ملاحظات (اختياري)</label>
        <textarea
          v-model="feedback"
          rows="2"
          class="w-full bg-surface-ground border border-surface-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
          placeholder="اكتب سبب الرفض أو ملاحظات الموافقة..."
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          @click="submitDecision('approved')"
          :disabled="loading"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircleIcon class="w-5 h-5" />
          موافق
        </button>

        <button
          @click="submitDecision('rejected')"
          :disabled="loading"
          class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <XCircleIcon class="w-5 h-5" />
          رفض
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApprovalStore } from '@/stores/approvalStore'
import { ScaleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  approvalId: { type: [Number, String], required: true },
})

const emit = defineEmits(['decided'])
const store = useApprovalStore()
const feedback = ref('')
const loading = ref(false)

async function submitDecision(status) {
  if (status === 'rejected' && !feedback.value.trim()) {
    if (!confirm('هل أنت متأكد من الرفض بدون ملاحظات؟')) return
  }

  loading.value = true
  try {
    await store.decide(props.approvalId, status, feedback.value)
    emit('decided') // إشعار لتحديث الواجهة
  } catch (error) {
    alert(store.error || 'حدث خطأ')
  } finally {
    loading.value = false
  }
}
</script>
