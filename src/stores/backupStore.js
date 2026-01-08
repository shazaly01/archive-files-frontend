import { defineStore } from 'pinia'
import backupService from '@/services/backupService'

export const useBackupStore = defineStore('backup', {
  state: () => ({
    backups: [],
    loading: false, // لحالة جلب القائمة
    creating: false, // لحالة زر "إنشاء نسخة"
    // --- الإضافة الجديدة ---
    // لتتبع تقدم التحميل لملف معين
    downloadProgress: {
      fileName: null, // اسم الملف الذي يتم تحميله حالياً
      percentage: 0, // نسبة التحميل
    },
    // --------------------
  }),

  actions: {
    // جلب البيانات
    async fetchBackups() {
      this.loading = true
      try {
        const response = await backupService.getAll()
        this.backups = response.data.data
      } catch (error) {
        console.error('Failed to fetch backups', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // إنشاء نسخة جديدة
    async createBackup() {
      this.creating = true
      try {
        await backupService.create()
        // تحديث القائمة فوراً بعد الإنشاء الناجح
        await this.fetchBackups()
      } catch (error) {
        console.error('Failed to create backup', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    // حذف نسخة
    async deleteBackup(fileName) {
      try {
        await backupService.delete(fileName)
        // حذف العنصر محلياً لتحديث الواجهة بسرعة
        this.backups = this.backups.filter((item) => item.name !== fileName)
      } catch (error) {
        console.error('Failed to delete backup', error)
        throw error
      }
    },

    // --- تعديل دالة التحميل ---
    async downloadBackup(fileName) {
      // 1. تفعيل حالة التحميل
      this.downloadProgress.fileName = fileName
      this.downloadProgress.percentage = 0

      try {
        // 2. تعريف دالة لتحديث التقدم
        const onProgress = (progressEvent) => {
          // التأكد من وجود progressEvent.total لتجنب القسمة على صفر
          if (progressEvent.total > 0) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            this.downloadProgress.percentage = percentCompleted
          }
        }

        // 3. تمرير الدالة إلى السيرفس
        const response = await backupService.download(fileName, onProgress)

        // إنشاء رابط وهمي في الذاكرة لتنزيل الملف
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()

        // تنظيف الذاكرة
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download backup', error)
        throw error
      } finally {
        // 4. إعادة تعيين حالة التحميل بعد الانتهاء أو الفشل
        this.downloadProgress.fileName = null
        this.downloadProgress.percentage = 0
      }
    },
  },
})
