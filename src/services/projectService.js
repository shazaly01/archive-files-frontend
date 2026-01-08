// src/services/projectService.js
import apiClient from './apiClient'

const resource = '/projects'

export default {
  // [تحديث] إضافة معامل scope
  get(page = 1, search = '', scope = 'all') {
    return apiClient.get(resource, {
      params: { page, search, scope },
    })
  },

  // جلب تفاصيل مشروع واحد (مع مستنداته إذا أردت)
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  // إنشاء مشروع جديد
  create(payload) {
    return apiClient.post(resource, payload)
  },

  // تحديث مشروع
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  // حذف مشروع (Soft Delete)
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },

  // --- إدارة الأعضاء (للمشاريع الخاصة) ---

  // إضافة عضو للمشروع
  addMember(projectId, payload) {
    // payload: { user_id: 1, role: 'contributor' }
    return apiClient.post(`${resource}/${projectId}/members`, payload)
  },

  // حذف عضو من المشروع
  removeMember(projectId, userId) {
    return apiClient.delete(`${resource}/${projectId}/members/${userId}`)
  },
}
