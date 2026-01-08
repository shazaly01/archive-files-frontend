<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة النسخ الاحتياطي</h1>
      <AppButton
        v-if="authStore.can('backup.create')"
        @click="handleCreateBackup"
        :disabled="creating"
      >
        <span v-if="creating">جاري النسخ...</span>
        <span v-else>إضافة نسخة احتياطية</span>
      </AppButton>
    </div>

    <AppCard>
      <div class="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        <div class="text-sm text-text-muted">إجمالي النسخ: {{ backups.length || 0 }}</div>
      </div>

      <AppTable :headers="tableHeaders" :items="backups" :is-loading="loading">
        <template #cell-size="{ item }">
          <span dir="ltr" class="text-text-primary font-medium">{{ item.size }}</span>
        </template>

        <template #cell-date="{ item }">
          <span dir="ltr" class="text-text-muted">{{ item.date }}</span>
        </template>

        <template #cell-actions="{ item }">
          <!-- --- التعديل الرئيسي هنا --- -->
          <div class="flex items-center space-x-2 space-x-reverse min-h-[36px]">
            <!-- عرض مؤشر التحميل -->
            <div
              v-if="downloadProgress.fileName === item.name"
              class="flex items-center space-x-2 space-x-reverse text-sm text-emerald-500 w-full"
            >
              <span>جاري التحميل...</span>
              <span class="font-mono font-semibold">{{ downloadProgress.percentage }}%</span>
            </div>

            <!-- إخفاء الأزرار أثناء تحميل نفس الملف -->
            <template v-else>
              <button
                v-if="authStore.can('backup.download')"
                @click.stop="handleDownload(item)"
                class="p-1 text-emerald-500 hover:text-emerald-400 transition-colors"
                title="تحميل النسخة"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
              </button>

              <button
                v-if="authStore.can('backup.delete')"
                @click.stop="openDeleteDialog(item)"
                class="p-1 font-medium text-rose-500 hover:text-rose-400 transition-colors"
                title="حذف النسخة"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </template>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف النسخة"
      :message="`هل أنت متأكد من رغبتك في حذف النسخة '${backupToDelete?.name}'؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="deleteSelectedBackup"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBackupStore } from '@/stores/backupStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

// --- الإعدادات وحالة المتجر ---
const backupStore = useBackupStore()
const authStore = useAuthStore()
// --- استيراد الحالة الجديدة ---
const { backups, loading, creating, downloadProgress } = storeToRefs(backupStore)
const toast = useToast()

// --- تعريف أعمدة الجدول ---
const tableHeaders = computed(() => {
  return [
    { key: 'name', label: 'اسم الملف' },
    { key: 'size', label: 'الحجم' },
    { key: 'date', label: 'تاريخ الإنشاء' },
    { key: 'actions', label: 'إجراءات', class: 'text-left' },
  ]
})

// --- دوال جلب البيانات ---
onMounted(() => {
  backupStore.fetchBackups().catch(() => {
    toast.error('حدث خطأ أثناء جلب قائمة النسخ الاحتياطية.')
  })
})

// --- منطق إنشاء نسخة جديدة ---
const handleCreateBackup = async () => {
  try {
    toast.info('جاري إنشاء النسخة الاحتياطية... قد يستغرق ذلك وقتاً حسب حجم البيانات.')
    await backupStore.createBackup()
    toast.success('تم إنشاء النسخة الاحتياطية بنجاح.')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'فشل إنشاء النسخة الاحتياطية.'
    toast.error(errorMessage)
  }
}

// --- منطق التحميل ---
const handleDownload = async (item) => {
  // التأكد من عدم وجود عملية تحميل أخرى جارية
  if (downloadProgress.value.fileName) {
    toast.warn('يرجى الانتظار حتى اكتمال التحميل الحالي.')
    return
  }
  try {
    // لا نعرض رسالة البدء هنا لأن المؤشر المرئي كافٍ
    await backupStore.downloadBackup(item.name)
    // نعرض رسالة النجاح بعد اكتمال العملية
    toast.success(`اكتمل تحميل '${item.name}' بنجاح.`)
  } catch (error) {
    toast.error(`فشل تحميل الملف '${item.name}'.`)
  }
}

// --- منطق الحذف ---
const isDeleteDialogOpen = ref(false)
const backupToDelete = ref(null)

const openDeleteDialog = (item) => {
  backupToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedBackup = async () => {
  if (backupToDelete.value) {
    try {
      await backupStore.deleteBackup(backupToDelete.value.name)
      toast.success(`تم حذف النسخة '${backupToDelete.value.name}' بنجاح.`)
    } catch (error) {
      toast.error('حدث خطأ أثناء محاولة الحذف.')
    } finally {
      isDeleteDialogOpen.value = false
      backupToDelete.value = null
    }
  }
}
</script>
