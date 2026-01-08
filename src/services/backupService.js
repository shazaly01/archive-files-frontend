import apiClient from './apiClient'

const resource = '/backups'

export default {
  // جلب كل النسخ
  getAll() {
    return apiClient.get(resource)
  },

  // إنشاء نسخة جديدة
  create() {
    return apiClient.post(resource)
  },

  // حذف نسخة (نرسل اسم الملف كـ parameter)
  delete(fileName) {
    return apiClient.delete(resource, {
      params: {
        file_name: fileName,
      },
    })
  },

  // --- تعديل دالة التحميل ---
  // الآن تقبل دالة onProgress كمعامل ثاني اختياري
  download(fileName, onProgress) {
    return apiClient.get(`${resource}/download`, {
      params: {
        file_name: fileName,
      },
      responseType: 'blob', // ضروري لكي يفهم المتصفح أنه ملف وليس نص JSON

      // تمرير الدالة مباشرة إلى إعدادات axios
      // إذا كانت onProgress غير معرفة (undefined)، سيتجاهلها axios ببساطة
      onDownloadProgress: onProgress,
    })
  },
}
