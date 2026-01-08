<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">إدارة الأقسام</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          عرض وإدارة الهيكل التنظيمي للأقسام
        </p>
      </div>
      <AppButton variant="primary" @click="openCreateModal">
        <span class="flex items-center gap-2">
          <span>+</span>
          <span>إضافة قسم جديد</span>
        </span>
      </AppButton>
    </div>

    <AppTable
      :headers="headers"
      :items="store.departments"
      :is-loading="store.loading"
      :row-clickable="false"
    >
      <template #cell-parent="{ item }">
        <span
          v-if="item.parent"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
        >
          {{ item.parent.name }}
        </span>
        <span v-else class="text-gray-400 text-xs">- قسم رئيسي -</span>
      </template>

      <template #cell-children_count="{ item }">
        <span class="font-mono text-sm">{{ item.children_count }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-2">
          <AppButton size="sm" variant="outline" @click="openEditModal(item)" title="تعديل">
            تعديل
          </AppButton>

          <AppButton size="sm" variant="danger" @click="confirmDelete(item)" title="حذف">
            حذف
          </AppButton>
        </div>
      </template>
    </AppTable>

    <div
      v-if="store.pagination.meta"
      class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <div class="text-sm text-gray-500">
        عرض الصفحة {{ store.pagination.meta.current_page }} من {{ store.pagination.meta.last_page }}
      </div>
      <div class="flex gap-2">
        <AppButton
          variant="outline"
          size="sm"
          :disabled="!store.pagination.links?.prev"
          @click="changePage(store.pagination.meta.current_page - 1)"
        >
          السابق
        </AppButton>
        <AppButton
          variant="outline"
          size="sm"
          :disabled="!store.pagination.links?.next"
          @click="changePage(store.pagination.meta.current_page + 1)"
        >
          التالي
        </AppButton>
      </div>
    </div>

    <DepartmentModal v-model="showModal" :item-to-edit="selectedItem" @saved="onSaved" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/departmentStore'
// المكونات الفرعية
import DepartmentModal from './DepartmentModal.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

// تهيئة المخزن
const store = useDepartmentStore()

// الحالة المحلية للتحكم في المودال
const showModal = ref(false)
const selectedItem = ref(null)

// تعريف أعمدة الجدول
const headers = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم القسم', class: 'font-bold' },
  { key: 'parent', label: 'القسم الرئيسي' },
  { key: 'children_count', label: 'الأقسام الفرعية', class: 'text-center' },
  { key: 'created_at', label: 'تاريخ الإنشاء' },
  { key: 'actions', label: '', class: 'text-left' }, // عمود الإجراءات
]

// جلب البيانات عند فتح الصفحة
onMounted(() => {
  store.fetchDepartments()
})

// --- Methods ---

function openCreateModal() {
  selectedItem.value = null // تصفير العنصر ليعرف المودال أنها إضافة
  showModal.value = true
}

function openEditModal(item) {
  // نمرر نسخة من العنصر (أو العنصر نفسه لأن المودال يعالجه)
  selectedItem.value = item
  showModal.value = true
}

// دالة الحذف
async function confirmDelete(item) {
  // استخدام نافذة المتصفح الافتراضية للحذر (لأنني لا أملك كود AppConfirmDialog)
  if (confirm(`هل أنت متأكد من رغبتك في حذف قسم "${item.name}"؟`)) {
    try {
      await store.deleteDepartment(item.id)
      // يمكن إضافة رسالة نجاح هنا
    } catch (e) {
      // الخطأ يظهر في الستور، يمكن عرضه هنا إذا أردت
      alert('حدث خطأ أثناء الحذف')
    }
  }
}

function changePage(page) {
  store.fetchDepartments(page)
}

function onSaved() {
  // يتم استدعاؤها عندما يغلق المودال بعد حفظ ناجح
  // الستور قام بالفعل بتحديث القائمة، لذا لا نحتاج لعمل شيء هنا
  // إلا إذا أردت عرض رسالة "تم الحفظ بنجاح"
}
</script>
