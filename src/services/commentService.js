// src/services/commentService.js
import apiClient from './apiClient'

export default {
  // إضافة تعليق على مشروع
  postToProject(projectId, body) {
    return apiClient.post(`/projects/${projectId}/comments`, { body })
  },

  // إضافة تعليق على مستند
  postToDocument(documentId, body) {
    return apiClient.post(`/documents/${documentId}/comments`, { body })
  },

  // حذف تعليق (لصاحبه أو المدير)
  delete(commentId) {
    return apiClient.delete(`/comments/${commentId}`)
  },
}
