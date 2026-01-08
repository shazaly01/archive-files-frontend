<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <AppInput
        id="user-full-name"
        label="الاسم الكامل"
        v-model="form.full_name"
        placeholder="ادخل الاسم الكامل"
        required
      />

      <AppInput
        id="user-username"
        label="اسم المستخدم"
        v-model="form.username"
        placeholder="ادخل اسم المستخدم"
        required
      />

      <AppInput
        id="user-email"
        label="البريد الإلكتروني (اختياري)"
        type="email"
        v-model="form.email"
        placeholder="example@domain.com"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RolesDropdown id="user-role" label="الدور" v-model="form.roles[0]" required />

        <div class="space-y-1">
          <label for="user-department" class="block text-sm font-medium text-text-primary">
            القسم التابع له
          </label>
          <div class="relative">
            <select
              id="user-department"
              v-model="form.department_id"
              class="w-full bg-surface-ground border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-shadow duration-200"
              :disabled="loadingDepartments"
            >
              <option :value="null">-- بدون قسم --</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-surface-border pt-4 mt-4">
        <h4 class="font-semibold text-text-secondary mb-2">
          {{ form.id ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور' }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            id="user-password"
            label="كلمة المرور"
            type="password"
            v-model="form.password"
            :required="!form.id"
            autocomplete="new-password"
          />
          <AppInput
            id="user-password-confirmation"
            label="تأكيد كلمة المرور"
            type="password"
            v-model="form.password_confirmation"
            :required="!form.id || form.password"
            autocomplete="new-password"
          />
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import RolesDropdown from '@/components/forms/RolesDropdown.vue'
import apiClient from '@/services/apiClient' // [هام] لجلب الأقسام

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// حالة الأقسام
const departments = ref([])
const loadingDepartments = ref(false)

// تعريف بنية النموذج
const form = ref({
  id: null,
  full_name: '',
  username: '',
  email: '', // [جديد]
  department_id: null, // [جديد]
  password: '',
  password_confirmation: '',
  roles: [],
})

// جلب الأقسام عند التحميل
async function fetchDepartments() {
  loadingDepartments.value = true
  try {
    // نفترض وجود هذا المسار، إذا لم يكن موجوداً سنحتاج لإنشائه
    const response = await apiClient.get('/departments')
    departments.value = response.data.data
  } catch (error) {
    console.error('Failed to load departments', error)
  } finally {
    loadingDepartments.value = false
  }
}

// مراقبة التغييرات في البيانات الأولية لملء النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      // حالة التعديل
      form.value = {
        id: newData.id,
        full_name: newData.full_name,
        username: newData.username,
        email: newData.email || '', // [جديد]
        department_id: newData.department_id || null, // [جديد]
        password: '',
        password_confirmation: '',
        roles: newData.roles ? newData.roles.map((r) => r.name) : [],
      }
    } else {
      // حالة الإضافة
      form.value = {
        id: null,
        full_name: '',
        username: '',
        email: '',
        department_id: null,
        password: '',
        password_confirmation: '',
        roles: [],
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  const payload = { ...form.value }

  // تنظيف حقول كلمة المرور عند التحديث إذا كانت فارغة
  if (payload.id && !payload.password) {
    delete payload.password
    delete payload.password_confirmation
  }

  // تحويل القيمة الفارغة إلى null للباك إند
  if (payload.email === '') payload.email = null

  emit('submit', payload)
}

onMounted(() => {
  fetchDepartments()
})
</script>
