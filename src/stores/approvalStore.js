// src/stores/approvalStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import approvalService from '@/services/approvalService'

export const useApprovalStore = defineStore('approval', () => {
  const approvals = ref([]) // قائمة الاعتمادات (سجل لملف معين)
  const loading = ref(false)
  const error = ref(null)
  const incomingApprovals = ref([])
  const outgoingApprovals = ref([])
  const pagination = ref({})
  /**
   * جلب سجل الاعتمادات لمستند معين
   */
  async function fetchHistory(documentId) {
    loading.value = true
    error.value = null
    try {
      const response = await approvalService.getHistory(documentId)
      approvals.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل سجل الاعتمادات.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إرسال طلب اعتماد جديد
   */
  async function requestApproval(versionId, approverId) {
    loading.value = true
    try {
      await approvalService.requestApproval(versionId, approverId)
      // لا نحتاج لتحديث القائمة هنا فوراً إلا إذا كنا نعرضها
      // لكن من الأفضل إعادة جلب السجل للتأكد
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إرسال طلب الاعتماد.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اتخاذ قرار (موافقة/رفض)
   */
  async function decide(approvalId, status, feedbackNote) {
    loading.value = true
    try {
      const response = await approvalService.decide(approvalId, status, feedbackNote)

      // تحديث الحالة محلياً في القائمة (لتنعكس فوراً في الواجهة)
      const index = approvals.value.findIndex((a) => a.id === approvalId)
      if (index !== -1) {
        // نحدث الحالة وتاريخ القرار
        approvals.value[index] = {
          ...approvals.value[index],
          status: status,
          feedback_note: feedbackNote,
          decided_at: new Date().toISOString(),
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تسجيل القرار.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchIncoming(page = 1) {
    loading.value = true
    try {
      const response = await approvalService.getIncoming(page)
      incomingApprovals.value = response.data.data
      pagination.value = response.data.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchOutgoing(page = 1) {
    loading.value = true
    try {
      const response = await approvalService.getOutgoing(page)
      outgoingApprovals.value = response.data.data
      pagination.value = response.data.meta
    } finally {
      loading.value = false
    }
  }

  return {
    approvals,
    loading,
    error,
    incomingApprovals,
    outgoingApprovals,
    fetchHistory,
    requestApproval,
    decide,
    fetchIncoming,
    fetchOutgoing,
  }
})
