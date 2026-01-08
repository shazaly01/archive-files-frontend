// src/services/authService.js
import apiClient from './apiClient'

export default {
  login(credentials) {
    return apiClient.post('/login', credentials)
  },
  logout() {
    return apiClient.post('/logout')
  },
  getUser() {
    return apiClient.get('/user')
  },
}
