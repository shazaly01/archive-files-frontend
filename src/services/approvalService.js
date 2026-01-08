// src/services/approvalService.js
import apiClient from './apiClient'

export default {
  /**
   * جلب سجل الاعتمادات لمستند معين
   */
  getHistory(documentId) {
    return apiClient.get(`/documents/${documentId}/approvals`)
  },

  /**
   * طلب اعتماد لنسخة محددة
   */
  requestApproval(versionId, approverId) {
    return apiClient.post(`/versions/${versionId}/request-approval`, {
      approver_id: approverId,
    })
  },

  /**
   * اتخاذ قرار (موافقة أو رفض) - خاص بالمدير
   */
  decide(approvalId, status, feedbackNote = '') {
    // status: 'approved' | 'rejected'
    return apiClient.post(`/approvals/${approvalId}/decide`, {
      status: status,
      feedback_note: feedbackNote,
    })
  },

  // أضف هذه الدوال داخل الكائن export default
  getIncoming(page = 1) {
    return apiClient.get('/approvals/incoming', { params: { page } })
  },

  getOutgoing(page = 1) {
    return apiClient.get('/approvals/outgoing', { params: { page } })
  },
}
