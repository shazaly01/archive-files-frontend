// src/stores/commentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import commentService from '@/services/commentService'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([]) // التعليقات المعروضة حالياً
  const loading = ref(false)
  const error = ref(null)

  /**
   * إضافة تعليق لمشروع (وتحديث القائمة فوراً)
   * ملاحظة: عادة ما نعتمد على أن تعليقات المشروع تأتي مع تفاصيل المشروع (currentProject.comments)
   * لكن إذا أردت إدارتها بشكل منفصل، يمكنك استخدام هذا.
   */
  async function postToProject(projectId, body, currentUser) {
    loading.value = true
    // تصفير الخطأ القديم قبل البدء
    error.value = null
    try {
      const response = await commentService.postToProject(projectId, body)

      const newComment = response.data.data
      if (!newComment.user && currentUser) {
        newComment.user = currentUser
      }
      comments.value.unshift(newComment)
      return newComment
    } catch (err) {
      // الآن الـ catch أصبحت مفيدة لأننا نخزن الخطأ
      error.value = err.response?.data?.message || 'فشل في إضافة التعليق.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postToDocument(documentId, body, currentUser) {
    loading.value = true
    error.value = null // 1. تصفير الخطأ
    try {
      const response = await commentService.postToDocument(documentId, body)
      const newComment = response.data.data

      if (!newComment.user && currentUser) {
        newComment.user = currentUser
      }

      comments.value.unshift(newComment)
      return newComment
    } catch (err) {
      // 2. الاستفادة من catch لتخزين الخطأ
      error.value = err.response?.data?.message || 'فشل في إضافة التعليق.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteComment(commentId) {
    // لا نحتاج لـ loading global هنا لعدم تجميد الشاشة
    try {
      await commentService.delete(commentId)
      comments.value = comments.value.filter((c) => c.id !== commentId)
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  // دالة مساعدة لتعيين التعليقات عند فتح صفحة (تأتي من مخزن آخر)
  function setComments(initialComments) {
    comments.value = initialComments || []
  }

  return {
    comments,
    loading,
    error,
    postToProject,
    postToDocument,
    deleteComment,
    setComments,
  }
})
