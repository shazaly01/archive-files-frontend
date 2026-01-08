// src/stores/projectStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import projectService from '@/services/projectService'

export const useProjectStore = defineStore('project', () => {
  // --- State ---
  const projects = ref([])
  const pagination = ref({})
  const currentProject = ref(null) // يحمل تفاصيل المشروع الحالي + الأعضاء
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب قائمة المشاريع (مع البحث والصفحات)
   */
  async function fetchProjects(page = 1, search = '', scope = 'all') {
    loading.value = true
    error.value = null
    try {
      // نمرر الـ scope للخدمة
      const response = await projectService.get(page, search, scope)
      projects.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في تحميل قائمة المشاريع.'
      console.error(err)
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل مشروع واحد
   */
  async function fetchProject(id) {
    loading.value = true
    error.value = null
    currentProject.value = null
    try {
      const response = await projectService.find(id)
      currentProject.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل المشروع.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * إنشاء مشروع جديد
   */
  async function createProject(payload) {
    loading.value = true
    error.value = null
    try {
      await projectService.create(payload)
      // لا نحتاج لتحديث القائمة هنا لأننا عادة نوجه المستخدم للصفحة الرئيسية بعدها
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء المشروع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث مشروع
   */
  async function updateProject(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await projectService.update(id, payload)
      // تحديث البيانات محلياً إذا كنا داخل صفحة المشروع
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = { ...currentProject.value, ...response.data.data }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث المشروع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف مشروع
   */
  async function deleteProject(id) {
    loading.value = true
    error.value = null
    try {
      await projectService.delete(id)
      // حذف المشروع من القائمة المحلية لتحديث الواجهة فوراً
      projects.value = projects.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المشروع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- إدارة الأعضاء (خاص بالمشاريع) ---

  async function addMember(projectId, payload) {
    loading.value = true
    try {
      await projectService.addMember(projectId, payload)
      // بعد الإضافة الناجحة، نعيد جلب المشروع لتحديث قائمة الأعضاء
      // (أو يمكننا إضافته يدوياً للمصفوفة إذا أردنا توفير الطلب)
      await fetchProject(projectId)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إضافة العضو.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeMember(projectId, userId) {
    loading.value = true
    try {
      await projectService.removeMember(projectId, userId)
      // تحديث القائمة محلياً
      if (currentProject.value && currentProject.value.members) {
        currentProject.value.members = currentProject.value.members.filter((m) => m.id !== userId)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إزالة العضو.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    projects,
    pagination,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  }
})
