<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <div v-if="isLoading" class="text-center py-8">جاري التحميل...</div>

    <div v-else-if="permissionGroups.length === 0" class="text-center py-8">
      لا توجد صلاحيات لعرضها.
    </div>

    <div v-else>
      <div class="max-h-[60vh] overflow-y-auto border border-surface-border rounded-md">
        <table class="min-w-full divide-y divide-surface-border">
          <thead class="bg-surface-section sticky top-0 z-10">
            <tr>
              <th class="p-3 font-bold text-text-primary text-right">المجموعة</th>
              <th
                v-for="action in permissionActions"
                :key="action.key"
                class="p-3 font-bold text-text-primary text-center"
              >
                {{ action.display_name }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr v-for="group in permissionGroups" :key="group.key">
              <td class="p-3 font-semibold text-text-primary">
                {{ getGroupLabel(group) }}
              </td>
              <td v-for="action in permissionActions" :key="action.key" class="p-3 text-center">
                <template v-if="getPermissionFor(group, action.key)">
                  <input
                    type="checkbox"
                    :value="getPermissionFor(group, action.key).id"
                    v-model="selectedPermissions"
                    class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </template>
                <span v-else class="text-text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات' }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  role: Object,
  isLoading: Boolean,
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const roleStore = useRoleStore()
const selectedPermissions = ref([])

const dialogTitle = computed(() => `تعديل صلاحيات دور: ${props.role?.name || ''}`)

const permissionGroups = computed(() => roleStore.permissions.groups || [])
const permissionActions = computed(() => roleStore.permissions.actions || [])

// --- قاموس الترجمة ---
const groupTranslations = {
  dashboard: 'لوحة التحكم',
  department: 'إدارة الأقسام',
  user: 'المستخدمون', // عدلتها لتطابق الموجود في الصورة
  role: 'الأدوار',
  project: 'المشاريع',
  document: 'المستندات',
  approval: 'الاعتمادات',
  comment: 'التعليقات',
  activity_log: 'سجل النشاط',
  setting: 'الإعدادات',
}

// دالة الترجمة
function getGroupLabel(group) {
  // الأولوية للترجمة من القاموس، ثم الاسم القادم من الباك إند، ثم المفتاح الإنجليزي
  return groupTranslations[group.key] || group.display_name || group.key
}

function getPermissionFor(group, actionKey) {
  return group.permissions.find((p) => p.action === actionKey)
}

watch(
  () => props.role,
  (newRole) => {
    if (newRole && newRole.permissions) {
      selectedPermissions.value = newRole.permissions.map((p) => p.id)
    } else {
      selectedPermissions.value = []
    }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!props.role) return

  const allPermissionsMap = new Map()
  roleStore.permissions.groups.forEach((group) => {
    group.permissions.forEach((p) => {
      const permissionName = `${group.key}.${p.action}`
      allPermissionsMap.set(p.id, permissionName)
    })
  })

  const permissionNames = selectedPermissions.value
    .map((id) => allPermissionsMap.get(id))
    .filter((name) => name)

  const payload = {
    name: props.role.name,
    permissions: permissionNames,
  }

  emit('submit', payload)
}
</script>
