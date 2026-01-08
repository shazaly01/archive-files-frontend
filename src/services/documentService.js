// src/services/documentService.js
import apiClient from './apiClient'

// ملاحظة: الروابط هنا متغيرة (بعضها تحت projects وبعضها documents مباشرة)
export default {
  /**
   * جلب مستندات مشروع معين
   */
  getByProject(projectId, page = 1, search = '') {
    return apiClient.get(`/projects/${projectId}/documents`, {
      params: { page, search },
    })
  },

  /**
   * جلب تفاصيل مستند واحد (مع سجل الإصدارات)
   */
  find(documentId) {
    return apiClient.get(`/documents/${documentId}`)
  },

  /**
   * رفع ملف جديد (الإصدار الأول) داخل مشروع
   */
  create(projectId, formData) {
    return apiClient.post(`/projects/${projectId}/documents`, formData, {
      headers: {
        // نضع القيمة undefined ليقوم Axios بإزالة الـ JSON header الافتراضي
        // ويسمح للمتصفح بوضع 'multipart/form-data; boundary=...' الصحيح
        'Content-Type': undefined,
      },
    })
  },

  // [تعديل هام]
  uploadVersion(documentId, formData) {
    return apiClient.post(`/documents/${documentId}/versions`, formData, {
      headers: {
        'Content-Type': undefined, // نفس التصحيح هنا
      },
    })
  },

  /**
   * تحميل الملف (Download)
   * versionId اختياري، إذا لم يرسل سيحمل آخر نسخة
   */
  download(documentId, versionId = null) {
    const url = versionId
      ? `/documents/${documentId}/download/${versionId}`
      : `/documents/${documentId}/download`

    return apiClient.get(url, {
      responseType: 'blob', // مهم جداً لاستقبال الملفات وتنزيلها
    })
  },

  /**
   * حذف مستند
   */
  delete(documentId) {
    return apiClient.delete(`/documents/${documentId}`)
  },

  // --- القفل والتحرير (Check-in / Check-out) ---

  lock(documentId) {
    return apiClient.post(`/documents/${documentId}/lock`)
  },

  unlock(documentId) {
    return apiClient.post(`/documents/${documentId}/unlock`)
  },
}
