<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="إدارة فريق المشروع"
    width="max-w-3xl"
  >
    <div class="space-y-8">
      <div
        class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <h4
          class="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2"
        >
          <UserPlusIcon class="w-5 h-5 text-primary" />
          إضافة أعضاء جدد
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          <div class="md:col-span-6 relative">
            <MagnifyingGlassIcon class="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              class="w-full pr-10 pl-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>

          <div class="md:col-span-4">
            <select
              v-model="selectedDepartment"
              class="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option :value="null">كل الأقسام</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <button
              v-if="searchQuery || selectedDepartment"
              @click="clearFilters"
              class="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-48 overflow-y-auto custom-scrollbar mb-4"
        >
          <div
            v-if="filteredUsers.length === 0"
            class="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <span class="text-sm">لا يوجد مستخدمين مطابقين للبحث</span>
          </div>

          <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
            <li
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              @click="toggleSelection(user.id)"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="selectedUsers.includes(user.id)"
                  class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  @click.stop="toggleSelection(user.id)"
                />
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ user.full_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ user.department?.name || 'بدون قسم' }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-400">{{ user.email }}</span>
            </li>
          </ul>
        </div>

        <div
          class="flex items-center justify-between bg-gray-100 dark:bg-gray-700/30 p-3 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-300">
              تم تحديد: <strong class="text-primary">{{ selectedUsers.length }}</strong>
            </span>

            <select
              v-model="batchRole"
              class="py-1.5 px-3 rounded border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800"
              :disabled="selectedUsers.length === 0"
            >
              <option value="viewer">مشاهد (Viewer)</option>
              <option value="contributor">مساهم (Contributor)</option>
              <option value="manager">مدير (Manager)</option>
            </select>
          </div>

          <AppButton
            @click="addSelectedMembers"
            :disabled="loading || selectedUsers.length === 0"
            :loading="loading"
          >
            إضافة المختارين
          </AppButton>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <UsersIcon class="w-5 h-5" />
          فريق العمل الحالي ({{ currentMembers.length }})
        </h4>

        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table class="w-full text-sm text-right">
            <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
              <tr>
                <th class="p-3">العضو</th>
                <th class="p-3">الدور</th>
                <th class="p-3">تاريخ الانضمام</th>
                <th class="p-3 w-20">إجراء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <tr
                v-for="member in currentMembers"
                :key="member.id"
                class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs"
                    >
                      {{ getInitials(member.full_name) }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-gray-100">
                        {{ member.full_name }}
                      </div>
                      <div class="text-xs text-gray-500">{{ member.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium border"
                    :class="getRoleBadgeClass(member.pivot?.role)"
                  >
                    {{ getRoleLabel(member.pivot?.role) }}
                  </span>
                </td>
                <td class="p-3 text-gray-500 text-xs">
                  {{ formatDate(member.pivot?.created_at) }}
                </td>
                <td class="p-3">
                  <button
                    v-if="member.id !== projectCreatorId"
                    @click="removeMember(member.id)"
                    class="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="إزالة العضو"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                  <span v-else class="text-xs font-bold text-gray-400">المالك</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { TrashIcon, MagnifyingGlassIcon, UserPlusIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projectStore'
import apiClient from '@/services/apiClient'

const props = defineProps({
  modelValue: Boolean,
  projectId: { type: Number, required: true },
  projectCreatorId: { type: Number, required: true },
  currentMembers: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'refresh'])

// Stores & State
const store = useProjectStore()
const allUsers = ref([])
const departments = ref([]) // لتخزين قائمة الأقسام
const loading = ref(false)

// Filter State
const searchQuery = ref('')
const selectedDepartment = ref(null)

// Selection State
const selectedUsers = ref([]) // مصفوفة لتخزين IDs للمستخدمين المختارين
const batchRole = ref('contributor') // الدور الافتراضي للمجموعة

// --- Computed Properties ---

// فلترة المستخدمين: المنطق الذكي
const filteredUsers = computed(() => {
  return allUsers.value.filter((user) => {
    // 1. استبعاد مالك المشروع
    if (user.id === props.projectCreatorId) return false

    // 2. استبعاد الأعضاء الموجودين بالفعل
    const isAlreadyMember = props.currentMembers.some((m) => m.id === user.id)
    if (isAlreadyMember) return false

    // 3. فلترة القسم (إذا تم تحديده)
    if (selectedDepartment.value && user.department_id !== selectedDepartment.value) {
      return false
    }

    // 4. فلترة البحث (الاسم أو البريد)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    }

    return true
  })
})

// --- Methods ---

// جلب البيانات الأولية (مستخدمين + أقسام)
async function fetchInitialData() {
  try {
    const [usersRes, deptsRes] = await Promise.all([
      apiClient.get('/users?per_page=1000'), // جلب عدد كبير للتأكد
      apiClient.get('/departments?per_page=100'),
    ])

    allUsers.value = usersRes.data.data || []
    departments.value = deptsRes.data.data || []
  } catch (e) {
    console.error('Failed to load modal data', e)
  }
}

// تحديد/إلغاء تحديد مستخدم
function toggleSelection(userId) {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter((id) => id !== userId)
  } else {
    selectedUsers.value.push(userId)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedDepartment.value = null
}

// الإضافة الجماعية
async function addSelectedMembers() {
  if (selectedUsers.value.length === 0) return

  loading.value = true

  // تجهيز الـ Payload للباك إند الجديد
  // تحويل مصفوفة IDs إلى مصفوفة كائنات {user_id, role}
  const payload = {
    members: selectedUsers.value.map((userId) => ({
      user_id: userId,
      role: batchRole.value,
    })),
  }

  try {
    await store.addMember(props.projectId, payload)

    // نجاح
    emit('refresh') // تحديث القائمة في الخلفية
    selectedUsers.value = [] // تصفية الاختيارات
    // ملاحظة: لا نغلق المودال لتسهيل إضافة المزيد، أو يمكنك إغلاقه بـ emit update:modelValue
  } catch (e) {
    alert('حدث خطأ أثناء الإضافة: ' + (e.response?.data?.message || 'خطأ غير معروف'))
  } finally {
    loading.value = false
  }
}

async function removeMember(userId) {
  if (!confirm('هل أنت متأكد من إزالة هذا العضو من المشروع؟')) return

  try {
    await store.removeMember(props.projectId, userId)
    emit('refresh')
  } catch (e) {
    alert('فشل الحذف')
  }
}

// Helpers Formatter
function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ar-EG')
}

function getRoleLabel(role) {
  const map = {
    manager: 'مدير مشروع',
    contributor: 'مساهم',
    viewer: 'مشاهد فقط',
  }
  return map[role] || role
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'manager':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'contributor':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'viewer':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-500'
  }
}

onMounted(() => {
  fetchInitialData()
})
</script>

<style scoped>
/* تنسيق شريط التمرير للقائمة */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
