<!-- src/views/roles/RolesList.vue -->
<template>
  <div>
    <!-- 1. رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">
        إدارة الأدوار والصلاحيات
      </h1>
      <!-- نفترض أن لديك صلاحية للتحقق منها، وإلا يمكنك إزالة v-if -->
      <AppButton @click="openNameDialog()"> إضافة دور جديد </AppButton>
    </div>

    <!-- 2. جدول عرض الأدوار (مكون العرض) -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="roles" :is-loading="loading">
        <template #cell-permissions_count="{ item }">
          <span
            class="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {{ item.permissions?.length || 0 }} صلاحية
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <AppButton
              v-if="item.name !== 'Super Admin'"
              @click="openPermissionsDialog(item)"
              variant="outline"
              size="sm"
              >تعديل الصلاحيات</AppButton
            >
            <AppButton
              v-if="item.name !== 'Super Admin'"
              @click="openNameDialog(item)"
              variant="secondary"
              size="sm"
              >تعديل الاسم</AppButton
            >
            <AppButton
              v-if="!isDefaultRole(item.name)"
              @click="openDeleteDialog(item)"
              variant="danger"
              size="sm"
              >حذف</AppButton
            >
          </div>
        </template>
      </AppTable>
      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <!-- 3. النوافذ المنبثقة -->
    <RoleModal
      v-model="isNameDialogVisible"
      :initial-data="selectedRole"
      :is-submitting="loading"
      @submit="handleNameSubmit"
    />

    <RolePermissionsDialog
      v-if="isPermissionsDialogVisible"
      v-model="isPermissionsDialogVisible"
      :role="selectedRole"
      :is-submitting="loading"
      @submit="handlePermissionsSubmit"
    />

    <AppConfirmDialog
      v-model="isConfirmDialogVisible"
      title="تأكيد حذف الدور"
      :message="`هل أنت متأكد أنك تريد حذف دور '${selectedRole?.name}'؟`"
      @confirmed="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
// استيراد النوافذ المنبثقة
import RoleModal from './RoleModal.vue' // هذا هو RoleNameDialog الآن
import RolePermissionsDialog from './RolePermissionsDialog.vue'

const roleStore = useRoleStore()
const { roles, loading, pagination } = storeToRefs(roleStore)
const toast = useToast()

// --- حالة الواجهة ---
const isNameDialogVisible = ref(false)
const isPermissionsDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const selectedRole = ref(null)
// const formErrors = ref({}) // يمكنك تفعيل هذا لعرض أخطاء التحقق

// --- تحميل البيانات الأولية ---
onMounted(() => {
  roleStore.fetchRoles()
  roleStore.fetchPermissions() // جلب الصلاحيات في الخلفية
})

// --- تعريفات الجدول والصفحات ---
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم الدور' },
  { key: 'permissions_count', label: 'عدد الصلاحيات' },
  { key: 'created_at', label: 'تاريخ الإنشاء' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

const isDefaultRole = (roleName) => ['Super Admin', 'Admin', 'User'].includes(roleName)

const handlePageChange = (page) => {
  roleStore.fetchRoles(page).catch(() => toast.error('فشل جلب الأدوار.'))
}

// --- دوال فتح النوافذ ---
const openNameDialog = (role = null) => {
  selectedRole.value = role
  // formErrors.value = {}
  isNameDialogVisible.value = true
}

const openPermissionsDialog = (role) => {
  selectedRole.value = role
  isPermissionsDialogVisible.value = true
}

const openDeleteDialog = (role) => {
  selectedRole.value = role
  isConfirmDialogVisible.value = true
}

// --- دوال معالجة الأحداث ---
const handleNameSubmit = async (formData) => {
  try {
    if (formData.id) {
      // قسم التعديل: يبقى كما هو، لا يحتاج لتغيير
      await roleStore.editRoleName(formData.id, { name: formData.name })
      toast.success('تم تعديل اسم الدور بنجاح.')
    } else {
      // قسم الإنشاء: هنا يتم التعديل
      // نرسل مصفوفة صلاحيات فارغة لتلبية متطلبات الخادم
      await roleStore.createRole({
        name: formData.name,
        permissions: [], // <-- الإضافة الحاسمة هنا
      })
      toast.success('تم إضافة الدور بنجاح.')
    }
    isNameDialogVisible.value = false
    await roleStore.fetchRoles(pagination.value.current_page)
  } catch (error) {
    toast.error('حدث خطأ أثناء حفظ الدور.')
    console.error(error)
  }
}

const handlePermissionsSubmit = async (permissionsIds) => {
  if (!selectedRole.value) return
  try {
    await roleStore.updateRole(selectedRole.value.id, permissionsIds)
    toast.success('تم تحديث الصلاحيات بنجاح.')
    isPermissionsDialogVisible.value = false
    await roleStore.fetchRoles(pagination.value.current_page) // تحديث القائمة
  } catch (error) {
    toast.error('حدث خطأ أثناء تحديث الصلاحيات.')
    console.error(error)
  }
}

async function handleRoleSubmit(roleData) {
  try {
    await roleStore.submitRole(roleData)
    // أغلق النافذة
  } catch (error) {
    console.error('Failed to save role:', error)
  }
}

const handleDeleteConfirm = async () => {
  if (!selectedRole.value) return
  try {
    await roleStore.deleteRole(selectedRole.value.id)
    toast.success('تم حذف الدور بنجاح.')
    isConfirmDialogVisible.value = false
    // سيتم تحديث القائمة تلقائيًا من المخزن
  } catch (error) {
    toast.error('حدث خطأ أثناء حذف الدور.')
    console.error(error)
  }
}
</script>
