<!-- src/components/forms/RolesDropdown.vue -->
<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :required="required"
      class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary"
      :disabled="loading"
    >
      <option value="" disabled>اختر دورًا</option>
      <option v-if="loading" value="" disabled>جاري تحميل الأدوار...</option>
      <option v-for="role in availableRoles" :key="role.id" :value="role.name">
        {{ role.name }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الدور' },
  modelValue: { type: String, default: '' }, // سنرسل اسم الدور
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const roleStore = useRoleStore()
const { roles, loading } = storeToRefs(roleStore)
const error = ref(null)

// فلترة الأدوار لإزالة Super Admin من القائمة
const availableRoles = computed(() => {
  return roles.value.filter((role) => role.name !== 'Super Admin')
})

onMounted(async () => {
  if (roles.value.length === 0) {
    try {
      // سنفترض أننا نريد كل الأدوار، لذا سنجلب الصفحة الأولى فقط
      await roleStore.fetchRoles()
    } catch (err) {
      error.value = 'فشل تحميل قائمة الأدوار.'
    }
  }
})
</script>
