<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة المستخدمين</h1>
      <AppButton @click="openUserModal()"> إضافة مستخدم </AppButton>
    </div>

    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="users || []"
        :is-loading="loading"
        @row-click="openUserModal"
      >
        <template #cell-department="{ item }">
          <span v-if="item.department" class="text-sm font-medium text-text-primary">
            {{ item.department.name }}
          </span>
          <span v-else class="text-xs text-text-muted italic">--</span>
        </template>

        <template #cell-role="{ item }">
          <span
            v-if="item.roles && item.roles.length > 0"
            class="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {{ item.roles[0].name }}
          </span>
          <span v-else class="text-text-muted text-xs"> لا يوجد دور </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <button
              @click.stop="openUserModal(item)"
              class="font-semibold text-primary hover:text-primary-hover text-sm"
            >
              تعديل
            </button>
            <button
              v-if="!hasSuperAdminRole(item)"
              @click.stop="openDeleteDialog(item)"
              class="font-semibold text-danger hover:text-red-700 text-sm"
            >
              حذف
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <UserModal
      v-model="isModalOpen"
      :user="selectedUser"
      :is-saving="isSaving"
      @save="handleSaveUser"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المستخدم"
      :message="`هل أنت متأكد من رغبتك في حذف المستخدم '${userToDelete?.full_name}'؟`"
      @confirmed="deleteSelectedUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification' // تأكد أن لديك هذه المكتبة أو استخدم window.alert

// استيراد المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import UserModal from './UserModal.vue'

// إعدادات
const userStore = useUserStore()
const { users, loading, pagination } = storeToRefs(userStore)
const toast = useToast()

// تعريف أعمدة الجدول (تم إضافة القسم)
const tableHeaders = [
  { key: 'full_name', label: 'الاسم الكامل' },
  { key: 'username', label: 'اسم المستخدم' },
  { key: 'department', label: 'القسم' }, // [جديد]
  { key: 'role', label: 'الدور' },
  { key: 'created_at', label: 'تاريخ الإنشاء' },
  { key: 'actions', label: '', class: 'text-left w-32' },
]

// دالة للتحقق من دور Super Admin
const hasSuperAdminRole = (user) => {
  return user.roles && user.roles.some((role) => role.name === 'Super Admin')
}

// منطق جلب البيانات والترقيم
const handlePageChange = (page) => {
  userStore.fetchUsers(page).catch(() => {
    // toast.error('حدث خطأ أثناء جلب بيانات المستخدمين.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

// منطق الحفظ
const isModalOpen = ref(false)
const selectedUser = ref(null)
const isSaving = ref(false)

const openUserModal = (user = null) => {
  // لا تسمح بتعديل مستخدم Super Admin
  if (user && hasSuperAdminRole(user)) {
    // toast.info('لا يمكن تعديل مستخدم Super Admin.')
    return
  }
  selectedUser.value = user
  isModalOpen.value = true
}

const handleSaveUser = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await userStore.updateUser(formData.id, formData)
      // toast.success(`تم تعديل المستخدم '${formData.full_name}' بنجاح.`)
    } else {
      await userStore.createUser(formData)
      // toast.success(`تمت إضافة المستخدم '${formData.full_name}' بنجاح.`)
    }
    // إعادة جلب البيانات لتحديث الجدول (مهم لظهور القسم الجديد)
    await userStore.fetchUsers(pagination.value.current_page)
    isModalOpen.value = false
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.'
    // toast.error(message)
    alert(message)
  } finally {
    isSaving.value = false
  }
}

// منطق الحذف
const isDeleteDialogOpen = ref(false)
const userToDelete = ref(null)

const openDeleteDialog = (user) => {
  userToDelete.value = user
  isDeleteDialogOpen.value = true
}

const deleteSelectedUser = async () => {
  if (userToDelete.value) {
    try {
      await userStore.deleteUser(userToDelete.value.id)
      // toast.success(`تم حذف المستخدم '${userToDelete.value.full_name}' بنجاح.`)
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة الحذف.'
      // toast.error(message)
      alert(message)
    } finally {
      userToDelete.value = null
    }
  }
}
</script>
