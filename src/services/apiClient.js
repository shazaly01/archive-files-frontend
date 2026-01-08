// src/services/apiClient.js
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore' // سننشئ هذا الملف لاحقًا

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    // ملاحظة: يجب استدعاء الـ store داخل الـ interceptor لتجنب التحميل الدائري
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient
