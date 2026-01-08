// src/services/userService.js
import apiClient from './apiClient'

const resource = '/users'

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
  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
