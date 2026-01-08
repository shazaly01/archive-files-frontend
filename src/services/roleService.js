// src/services/roleService.js
import apiClient from './apiClient'

const resource = '/roles'

export default {
  get(page = 1) {
    return apiClient.get(`${resource}?page=${page}`)
  },
  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },
  create(payload) {
    return apiClient.post(resource, payload)
  },
  // --- [تعديل] ---
  // هذه الدالة الآن هي المسؤولة عن جميع تحديثات الدور (الاسم والصلاحيات)
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },
  // --- [نهاية التعديل] ---
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
  getAllPermissions() {
    return apiClient.get(`${resource}/permissions`)
  },
  // --- [حذف] ---
  // تم حذف دالة updatePermissions لأنها غير ضرورية وتستدعي مسارًا خاطئًا
  // --- [نهاية الحذف] ---
}
