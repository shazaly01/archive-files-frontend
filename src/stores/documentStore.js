// src/stores/documentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import documentService from '@/services/documentService'

export const useDocumentStore = defineStore('document', () => {
  // --- State ---
  const documents = ref([]) // قائمة ملفات المشروع
  const pagination = ref({})
  const currentDocument = ref(null) // الملف المفتوح حالياً للمعاينة
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب ملفات مشروع معين
   */
  async function fetchProjectDocuments(projectId, page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await documentService.getByProject(projectId, page, search)
      documents.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في تحميل المستندات.'
      console.error(err)
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل ملف واحد (مع تاريخ الإصدارات)
   */
  async function fetchDocument(id) {
    loading.value = true
    error.value = null
    currentDocument.value = null
    try {
      const response = await documentService.find(id)
      currentDocument.value = response.data.data
    } catch (err) {
      error.value = 'فشل في تحميل تفاصيل المستند.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * رفع مستند جديد
   */
  async function createDocument(projectId, payload) {
    loading.value = true
    try {
      await documentService.create(projectId, payload)
      // نعيد تحميل القائمة لنرى الملف الجديد
      await fetchProjectDocuments(projectId)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في رفع المستند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * رفع إصدار جديد لمستند
   */
  async function uploadVersion(documentId, file) {
    loading.value = true
    try {
      const response = await documentService.uploadVersion(documentId, file)
      // إذا كنا نعرض الملف حالياً، نحدث بياناته (رقم الإصدار الجديد)
      if (currentDocument.value && currentDocument.value.id === documentId) {
        // الخيار الأفضل هو إعادة جلب الملف بالكامل لضمان تحديث كل الحقول
        await fetchDocument(documentId)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في رفع الإصدار الجديد.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف مستند
   */
  async function deleteDocument(id) {
    loading.value = true
    try {
      await documentService.delete(id)
      documents.value = documents.value.filter((d) => d.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المستند.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- عمليات القفل والتحرير (Check-in / Check-out) ---

  async function lockDocument(id) {
    // 1. تصفير الخطأ قبل البدء
    error.value = null

    try {
      const response = await documentService.lock(id)

      // تحديث الحالة محلياً في القائمة
      const docInList = documents.value.find((d) => d.id === id)
      if (docInList) {
        docInList.is_locked = true
        docInList.locked_by = response.data.data.locked_by
      }

      // تحديث الحالة محلياً في العارض
      if (currentDocument.value && currentDocument.value.id === id) {
        currentDocument.value.is_locked = true
        currentDocument.value.locked_by = response.data.data.locked_by
      }
    } catch (err) {
      // 2. الحل: تخزين رسالة الخطأ هنا
      error.value = err.response?.data?.message || 'فشل في قفل المستند.'
      throw err
    }
  }

  async function unlockDocument(id) {
    // يفضل تصفير الخطأ قبل البدء
    error.value = null

    try {
      await documentService.unlock(id)

      // تحديث الحالة محلياً
      const docInList = documents.value.find((d) => d.id === id)
      if (docInList) {
        docInList.is_locked = false
        docInList.locked_by = null
      }

      if (currentDocument.value && currentDocument.value.id === id) {
        currentDocument.value.is_locked = false
        currentDocument.value.locked_by = null
      }
    } catch (err) {
      // ✅ الحل: تخزين رسالة الخطأ هنا لتصبح الـ catch مفيدة
      error.value = err.response?.data?.message || 'فشل في إلغاء قفل المستند.'
      throw err
    }
  }

  return {
    documents,
    pagination,
    currentDocument,
    loading,
    error,
    fetchProjectDocuments,
    fetchDocument,
    createDocument,
    uploadVersion,
    deleteDocument,
    lockDocument,
    unlockDocument,
  }
})
