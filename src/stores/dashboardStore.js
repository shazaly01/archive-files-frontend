import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  // الحالة (State) مطابقة لهيكل الباك إند
  const stats = ref({}) // سيحمل الأرقام (counters)
  const activities = ref([]) // سيحمل قائمة النشاطات recent_activities

  const loading = ref(false)
  const error = ref(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardService.getStats()
      // تحديث البيانات بناءً على رد الباك إند الجديد
      stats.value = response.data.stats
      activities.value = response.data.recent_activities
    } catch (err) {
      console.error(err)
      error.value = 'فشل تحميل الإحصائيات'
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    activities,
    loading,
    error,
    fetchStats,
  }
})
