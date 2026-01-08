import apiClient from './apiClient'

export default {
  getStats() {
    return apiClient.get('/dashboard/stats')
  },
}
