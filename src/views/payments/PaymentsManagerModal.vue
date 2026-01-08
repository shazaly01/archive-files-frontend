<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
      @click.self="closeModal"
    >
      <div
        class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-4xl transform max-h-[90vh] flex flex-col"
      >
        <!-- رأس المودال -->
        <div
          class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 flex-shrink-0"
        >
          <div>
            <h3 class="text-lg font-semibold text-text-primary">إدارة الدفعات</h3>
            <p v-if="project" class="text-sm text-text-muted">للمشروع: {{ project.name }}</p>
          </div>
          <button
            @click="closeModal"
            class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- ملخص الحسابات المالية للمشروع -->
        <div v-if="project" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div class="bg-surface-ground p-3 rounded-md">
            <p class="text-sm text-text-muted">القيمة المستحقة</p>
            <!-- تغيير النص هنا -->
            <p class="text-lg font-bold text-primary">{{ totalProjectValue }}</p>
          </div>

          <div class="bg-surface-ground p-3 rounded-md">
            <p class="text-sm text-text-muted">إجمالي المدفوع</p>
            <p class="text-lg font-bold text-success">{{ totalPaidAmount }}</p>
          </div>
          <div class="bg-surface-ground p-3 rounded-md">
            <p class="text-sm text-text-muted">المبلغ المتبقي</p>
            <p class="text-lg font-bold text-warning">{{ remainingAmount }}</p>
          </div>
        </div>

        <!-- المحتوى القابل للتمرير -->
        <div class="overflow-y-auto flex-grow">
          <!-- زر إضافة دفعة جديدة -->
          <div class="mb-4 text-left">
            <AppButton @click="showFormForCreate" v-if="!isFormVisible">
              إضافة دفعة جديدة
            </AppButton>
          </div>

          <!-- نموذج الإضافة أو التعديل -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 -translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <PaymentForm
              v-if="isFormVisible && project"
              :project-id="project.id"
              :initial-data="selectedPayment"
              :is-saving="loading"
              @submit="handleSavePayment"
              @cancel="hideForm"
              class="mb-8"
            />
          </Transition>

          <!-- قائمة الدفعات الحالية -->
          <PaymentsList
            :payments="payments"
            :pagination="pagination"
            :loading="loading && !isFormVisible"
            :error="error"
            @edit="showFormForEdit"
            @delete="openDeleteDialog"
            @page-change="handlePageChange"
          />
        </div>

        <!-- حوار تأكيد الحذف -->
        <AppConfirmDialog
          v-model="isDeleteDialogOpen"
          title="تأكيد حذف الدفعة"
          :message="`هل أنت متأكد من حذف هذه الدفعة؟`"
          @confirmed="deleteSelectedPayment"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { formatCurrency } from '@/utils/formatters'

// Stores
import { usePaymentStore } from '@/stores/paymentStore'
import { useProjectStore } from '@/stores/projectStore'

// Components
import PaymentsList from './PaymentsList.vue'
import PaymentForm from './PaymentForm.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  project: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

// تهيئة الـ Stores
const paymentStore = usePaymentStore()
// هنا نسترجع loading باسمه الأصلي لكي يعمل مع القالب القديم
const { payments, pagination, loading, error } = storeToRefs(paymentStore)

const projectStore = useProjectStore()
const { currentProject } = storeToRefs(projectStore)

const toast = useToast()

// === دمج بيانات المشروع (الأصلي + المحدث) ===
const targetProject = computed(() => {
  if (currentProject.value && currentProject.value.id === props.project?.id) {
    return currentProject.value
  }
  return props.project
})

// --- الخصائص المحسوبة (تعتمد على targetProject) ---
const totalProjectValue = computed(() => {
  return formatCurrency(targetProject.value?.due_value || 0)
})

const totalPaidAmount = computed(() => {
  return formatCurrency(targetProject.value?.total_payments || 0)
})

const remainingAmount = computed(() => {
  const contract = Number(targetProject.value?.due_value || 0)
  const paid = Number(targetProject.value?.total_payments || 0)
  return formatCurrency(contract - paid)
})

const isFormVisible = ref(false)
const selectedPayment = ref(null)

// --- دوال التحكم بالواجهة ---

const handlePageChange = (page = 1) => {
  if (!props.project) return

  // نستخدم loading الأصلي الخاص بالستور ليظهر السبينر في الجدول
  paymentStore.fetchPayments(page, { project_id: props.project.id }).catch(() => {
    toast.error('حدث خطأ أثناء جلب الدفعات.')
  })
}

const refreshProjectData = async () => {
  if (props.project?.id) {
    try {
      await projectStore.fetchProject(props.project.id)
    } catch (e) {
      console.error('فشل تحديث بيانات المشروع', e)
    }
  }
}

// === [تصحيح] استعادة الـ Watcher القديم مع إضافة تحديث المشروع ===
watch(
  () => props,
  (currentProps) => {
    // التحقق من أن النافذة مفتوحة وأن المشروع موجود
    if (currentProps.modelValue && currentProps.project) {
      // 1. جلب الدفعات (كما كان سابقاً)
      handlePageChange(1)

      // 2. [الإضافة الجديدة] تحديث أرقام المشروع (المدفوع/المتبقي)
      refreshProjectData()
    } else if (!currentProps.modelValue) {
      // تنظيف عند الإغلاق
      isFormVisible.value = false
      selectedPayment.value = null
      currentProject.value = null
    }
  },
  {
    deep: true, // ضروري لمراقبة تغيرات الـ props الداخلية
    immediate: true, // ضروري للعمل عند بدء التحميل مباشرة
  },
)

const showFormForCreate = () => {
  selectedPayment.value = null
  isFormVisible.value = true
}

const showFormForEdit = (payment) => {
  selectedPayment.value = { ...payment }
  isFormVisible.value = true
}

const hideForm = () => {
  isFormVisible.value = false
  selectedPayment.value = null
}

// --- دوال المعالجة (CRUD) ---

const handleSavePayment = async (formData) => {
  try {
    if (formData.id) {
      await paymentStore.updatePayment(formData.id, formData)
      toast.success('تم تعديل الدفعة بنجاح.')
    } else {
      await paymentStore.createPayment(formData)
      toast.success('تمت إضافة الدفعة بنجاح.')
    }

    hideForm()

    // تحديث القوائم والأرقام
    await handlePageChange(pagination.value.current_page || 1)
    await refreshProjectData()
  } catch (err) {
    toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ الدفعة.')
  }
}

const isDeleteDialogOpen = ref(false)
const paymentToDelete = ref(null)

const openDeleteDialog = (payment) => {
  paymentToDelete.value = payment
  isDeleteDialogOpen.value = true
}

const deleteSelectedPayment = async () => {
  if (!paymentToDelete.value) return
  try {
    await paymentStore.deletePayment(paymentToDelete.value.id)
    toast.success('تم حذف الدفعة بنجاح.')

    if (payments.value.length === 1 && pagination.value.current_page > 1) {
      await handlePageChange(pagination.value.current_page - 1)
    } else {
      await handlePageChange(pagination.value.current_page)
    }

    // تحديث الأرقام بعد الحذف
    await refreshProjectData()
  } catch (err) {
    toast.error('حدث خطأ أثناء الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    paymentToDelete.value = null
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>
