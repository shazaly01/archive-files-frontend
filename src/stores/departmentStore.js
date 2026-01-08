// src/stores/departmentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import departmentService from '@/services/departmentService'

export const useDepartmentStore = defineStore('department', () => {
  // --- State ---
  const departments = ref([])
  const pagination = ref({}) // لتخزين معلومات الصفحات (meta & links)
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---

  // 1. عرض الأقسام (يدعم رقم الصفحة)
  async function fetchDepartments(page = 1) {
    loading.value = true
    error.value = null
    try {
      // نفترض أن الـ Service يدعم تمرير رقم الصفحة كـ query param
      // مثال: apiClient.get(`/departments?page=${page}`)
      // ستحتاج لتعديل بسيط في Service إذا لم يكن يدعم المعاملات، لكن عادة Axios يقبلها
      const response = await departmentService.getAll({ page })

      // Laravel Resource Collection with Pagination structure:
      departments.value = response.data.data
      pagination.value = response.data.meta // أو response.data حسب هيكلة الرد الدقيقة
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'فشل في جلب البيانات.'
    } finally {
      loading.value = false
    }
  }

  // 2. إنشاء قسم جديد
  async function createDepartment(payload) {
    loading.value = true
    error.value = null
    try {
      await departmentService.create(payload)
      // بعد الإضافة، نعيد تحميل القائمة (الصفحة الأولى) لرؤية العنصر الجديد
      await fetchDepartments(1)
      return true // نجاح
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء القسم.'
      throw err // نمرر الخطأ للواجهة لعرض التنبيهات
    } finally {
      loading.value = false
    }
  }

  // 3. تعديل قسم
  async function updateDepartment(id, payload) {
    loading.value = true
    error.value = null
    try {
      await departmentService.update(id, payload)
      // تحديث القائمة الحالية لتعكس التغييرات
      await fetchDepartments(pagination.value.current_page || 1)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث القسم.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. حذف قسم
  async function deleteDepartment(id) {
    loading.value = true
    error.value = null
    try {
      await departmentService.delete(id)
      // تحديث القائمة
      await fetchDepartments(pagination.value.current_page || 1)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف القسم.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    departments,
    pagination,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
})
