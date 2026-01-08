<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة الشركات</h1>
      <AppButton v-if="authStore.can('company.create')" @click="openCompanyModal()">
        إضافة شركة
      </AppButton>
    </div>

    <AppCard>
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div class="relative w-full md:w-96">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث باسم الشركة، الرقم الضريبي، أو الرخصة..."
            class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all sm:text-sm"
            @input="onSearch"
          />
        </div>

        <div class="text-sm text-text-muted">إجمالي الشركات: {{ pagination.total || 0 }}</div>
      </div>

      <AppTable :headers="tableHeaders" :items="companies" :is-loading="loading">
        <template #cell-commercial_record="{ item }">
          <span class="text-text-muted font-medium">{{
            item.commercial_record || 'غير محدد'
          }}</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2 space-x-reverse">
            <button
              v-if="authStore.can('document.view')"
              @click.stop="openDocumentsManager(item)"
              class="p-1 text-teal-500 hover:text-teal-400 transition-colors"
              title="إدارة المستندات"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"
                ></path>
              </svg>
            </button>

            <button
              v-if="authStore.can('company.update')"
              @click.stop="openCompanyModal(item)"
              class="p-1 font-medium text-sky-500 hover:text-sky-400 transition-colors"
              title="تعديل الشركة"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h12a1 1 0 100-2H3z"
                ></path>
              </svg>
            </button>

            <button
              v-if="authStore.can('company.delete')"
              @click.stop="openDeleteDialog(item)"
              class="p-1 font-medium text-rose-500 hover:text-rose-400 transition-colors"
              title="حذف الشركة"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <CompanyModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :company="selectedCompany"
      @save="handleSaveCompany"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الشركة"
      :message="`هل أنت متأكد من رغبتك في حذف شركة '${companyToDelete?.name}'؟`"
      @confirmed="deleteSelectedCompany"
    />

    <DocumentsManagerModal
      v-if="isDocumentsModalOpen"
      v-model="isDocumentsModalOpen"
      :owner="companyForDocuments"
      target-type="company"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CompanyModal from './CompanyModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import DocumentsManagerModal from '@/views/documents/DocumentsManagerModal.vue'

// --- الإعدادات وحالة المتجر ---
const companyStore = useCompanyStore()
const authStore = useAuthStore()
const { companies, loading, pagination } = storeToRefs(companyStore)
const toast = useToast()

// --- حالة البحث ---
const searchQuery = ref('')
let searchTimeout = null

// --- تعريف أعمدة الجدول ---
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'اسم الشركة' },
    { key: 'commercial_record', label: 'رقم السجل التجاري' },
    { key: 'tax_number', label: 'الرقم الضريبي' },
    { key: 'license_number', label: 'رقم الرخصة' },
    { key: 'owner_name', label: 'رئيس مجلس الادارة' },
  ]
  if (
    authStore.can('company.update') ||
    authStore.can('company.delete') ||
    authStore.can('document.view')
  ) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left' })
  }
  return headers
})

// --- دوال جلب البيانات والبحث ---

// دالة جلب البيانات (تدعم الترقيم والبحث)
const handlePageChange = (page = 1) => {
  companyStore.fetchCompanies(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الشركات.')
  })
}

// دالة مراقبة الكتابة في حقل البحث (Debounce)
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة للصفحة الأولى عند كل بحث جديد
  }, 500) // تأخير نصف ثانية لتقليل الطلبات للسيرفر
}

onMounted(() => {
  handlePageChange()
})

// --- منطق إضافة/تعديل الشركات ---
const isModalOpen = ref(false)
const selectedCompany = ref(null)

const openCompanyModal = (company = null) => {
  if (company && !authStore.can('company.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه الشركة.')
    return
  }
  // نمرر نسخة من البيانات لتجنب التعديل المباشر في الجدول قبل الحفظ
  selectedCompany.value = company ? { ...company } : null
  isModalOpen.value = true
}

const handleSaveCompany = async (formData) => {
  try {
    if (formData.id) {
      await companyStore.updateCompany(formData.id, formData)
      toast.success(`تم تعديل شركة '${formData.name}' بنجاح.`)
    } else {
      await companyStore.createCompany(formData)
      toast.success(`تمت إضافة شركة '${formData.name}' بنجاح.`)
    }
    await handlePageChange(pagination.value.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(errorMessage)
  }
}

// --- منطق الحذف ---
const isDeleteDialogOpen = ref(false)
const companyToDelete = ref(null)

const openDeleteDialog = (company) => {
  companyToDelete.value = company
  isDeleteDialogOpen.value = true
}

// --- منطق الحذف ---
const deleteSelectedCompany = async () => {
  if (companyToDelete.value) {
    try {
      await companyStore.deleteCompany(companyToDelete.value.id)
      toast.success(`تم حذف شركة '${companyToDelete.value.name}' بنجاح.`)

      // إعادة تحميل البيانات
      const currentPage = pagination.value.current_page
      if (companies.value.length === 1 && currentPage > 1) {
        await handlePageChange(currentPage - 1)
      } else {
        await handlePageChange(currentPage)
      }
    } catch (error) {
      // --- التعديل الجوهري هنا ---
      // 1. نحاول قراءة الرسالة من الـ Store أولاً (لأننا خزناها هناك في التعديل السابق)
      // 2. أو نقرأها مباشرة من كائن الخطأ
      const errorMessage =
        companyStore.error || error.response?.data?.message || 'حدث خطأ غير متوقع أثناء الحذف.'

      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      companyToDelete.value = null
    }
  }
}

// --- منطق إدارة المستندات ---
const isDocumentsModalOpen = ref(false)
const companyForDocuments = ref(null)

const openDocumentsManager = (company) => {
  companyForDocuments.value = company
  isDocumentsModalOpen.value = true
}
</script>
