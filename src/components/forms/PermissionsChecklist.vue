<!-- src/components/forms/PermissionsChecklist.vue -->
<template>
  <div class="space-y-4">
    <!-- حقل البحث -->
    <div class="sticky top-0 bg-surface-section py-2 z-10">
      <AppInput v-model="searchQuery" placeholder="ابحث عن صلاحية..." class="w-full" />
    </div>

    <div v-if="loading" class="text-center text-gray-500">جاري تحميل الصلاحيات...</div>
    <div v-else-if="error" class="text-center text-danger">
      {{ error }}
    </div>

    <div
      v-else-if="Object.keys(filteredGroupedPermissions).length === 0"
      class="text-center text-gray-500 py-4"
    >
      لا توجد صلاحيات تطابق بحثك.
    </div>

    <!-- عرض الصلاحيات المفلترة -->
    <div
      v-for="(group, groupName) in filteredGroupedPermissions"
      :key="groupName"
      class="p-4 border border-surface-border rounded-lg"
    >
      <h4 class="font-bold capitalize text-text-primary mb-3 border-b border-surface-border pb-2">
        {{ groupName }}
      </h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
        <div v-for="permission in group" :key="permission.id" class="flex items-center">
          <input
            :id="`perm-${permission.id}`"
            type="checkbox"
            :value="permission.name"
            :checked="localSelected.includes(permission.name)"
            @change="togglePermission(permission.name)"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label :for="`perm-${permission.id}`" class="mr-2 text-sm text-text-secondary">
            {{ permission.name.split('.')[1] }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'
import AppInput from '@/components/ui/AppInput.vue'

const props = defineProps({
  selectedPermissions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:selectedPermissions'])

const roleStore = useRoleStore()
const { permissions: allPermissions, loading } = storeToRefs(roleStore)
const error = ref(null)
const localSelected = ref([...props.selectedPermissions])
const searchQuery = ref('')

watch(
  () => props.selectedPermissions,
  (newVal) => {
    localSelected.value = [...newVal]
  },
)

onMounted(async () => {
  try {
    await roleStore.fetchAllPermissions()
  } catch (err) {
    console.error('PermissionsChecklist failed to fetch permissions:', err)
    error.value = 'فشل تحميل قائمة الصلاحيات.'
  }
})

// --- التحصين هنا ---
const filteredGroupedPermissions = computed(() => {
  // التحقق من أن allPermissions.value هي مصفوفة صالحة
  if (!Array.isArray(allPermissions.value)) {
    return {} // إرجاع كائن فارغ لمنع الانهيار
  }

  const filtered = allPermissions.value.filter((permission) =>
    permission.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  return filtered.reduce((groups, permission) => {
    const groupName = permission.name.split('.')[0]
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(permission)
    return groups
  }, {})
})

const togglePermission = (permissionName) => {
  const index = localSelected.value.indexOf(permissionName)
  if (index > -1) {
    localSelected.value.splice(index, 1)
  } else {
    localSelected.value.push(permissionName)
  }
  emit('update:selectedPermissions', localSelected.value)
}
</script>
