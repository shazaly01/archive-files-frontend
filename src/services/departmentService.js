import apiClient from './apiClient'
const resource = '/departments'

export default {
  getAll(params = {}) {
    return apiClient.get(resource, { params })
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
