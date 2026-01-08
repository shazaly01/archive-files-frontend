<template>
  <div>
    <!-- شاشة التحميل تبقى كما هي، فهي ممارسة جيدة -->
    <FullScreenLoader :show="loading" message="جاري تحميل التقرير..." />

    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">تقرير كشف حساب شركة</h1>
      <AppButton
        v-if="reportData"
        @click="handlePrint"
        class="bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        <PrinterIcon class="w-5 h-5 ml-2" />
        طباعة احترافية
      </AppButton>
    </div>

    <!-- منطقة الفلترة -->
    <AppCard class="mb-8">
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-4">اختر شركة لعرض كشف الحساب</h3>
        <div class="max-w-md">
          <CompaniesDropdown
            id="report-company-select"
            label="الشركة"
            v-model="selectedCompanyId"
            @update:modelValue="fetchReport"
          />
        </div>
      </div>
    </AppCard>

    <!-- منطقة عرض التقرير -->
    <div v-if="error" class="text-center p-10 text-danger">
      <p>{{ error }}</p>
    </div>

    <AppCard v-else-if="reportData" class="p-6">
      <!-- 1. معلومات الشركة الأساسية (تبقى كما هي، ولكن مع إضافة حماية) -->
      <div class="border-b border-surface-border pb-4 mb-6">
        <h2 class="text-xl font-bold text-primary mb-2">{{ reportData.company?.name }}</h2>
        <!-- تم إضافة Optional Chaining (?.) كحماية إضافية -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
          <p><strong>الرقم الضريبي:</strong> {{ reportData.company?.tax_number || 'N/A' }}</p>
          <p><strong>رئيس نجلس الادارة:</strong> {{ reportData.company?.owner_name || 'N/A' }}</p>
          <p><strong>العنوان:</strong> {{ reportData.company?.address || 'غير محدد' }}</p>
        </div>
      </div>

      <!-- 2. ملخص مالي (مع التصحيحات) -->
      <div class="bg-surface-ground p-4 rounded-lg mb-8">
        <h3 class="text-lg font-semibold mb-4">ملخص مالي</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-sm text-text-muted">إجمالي العقود الكلية</p>
            <p class="text-2xl font-bold text-gray-500">
              {{ formatCurrency(reportData.summary?.total_contract_value || 0) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-text-muted">إجمالي القيمة المستحقة</p>
            <p class="text-2xl font-bold text-primary">
              {{ formatCurrency(reportData.summary?.total_due_value || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المبالغ المدفوعة</p>
            <p class="text-2xl font-bold text-success">
              <!-- === [تصحيح 1] === -->
              {{ formatCurrency(reportData.summary?.total_payments_received || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">الرصيد المتبقي</p>
            <p class="text-2xl font-bold text-warning">
              <!-- === [تصحيح 2] === -->
              {{ formatCurrency(reportData.summary?.total_remaining || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">عدد المشاريع</p>
            <p class="text-2xl font-bold">{{ reportData.projects?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- 3. تفاصيل المشاريع (مع التصحيحات) -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold mb-4">تفاصيل المشاريع</h3>
        <div
          v-for="project in reportData.projects"
          :key="project.id"
          class="border border-surface-border rounded-lg p-4 grid grid-cols-5 gap-4 items-center"
        >
          <div class="col-span-2">
            <h4 class="font-semibold">مشروع: {{ project.name }}</h4>
          </div>
          <div>
            <p class="text-sm text-text-muted">قيمة العقد</p>
            <p class="font-bold text-gray-500">{{ formatCurrency(project.contract_value) }}</p>
          </div>
          <div>
            <p class="text-sm text-text-muted">القيمة المستحقة</p>
            <p class="font-bold">{{ formatCurrency(project.due_value) }}</p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المدفوع</p>
            <!-- === [تصحيح 3] === -->
            <p class="font-bold text-success">{{ formatCurrency(project.total_paid) }}</p>
          </div>
          <!-- === [تم حذف جدول الدفعات بالكامل من هنا] === -->
        </div>
      </div>
    </AppCard>

    <!-- رسالة أولية قبل اختيار شركة -->
    <div v-else class="text-center text-text-muted py-10">
      <p>الرجاء اختيار شركة من القائمة أعلاه لعرض كشف الحساب الخاص بها.</p>
    </div>
  </div>
</template>

<script setup>
// --- (جزء الـ <script> يبقى كما هو تماماً، لا حاجة لتغييره) ---
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import AppButton from '@/components/ui/AppButton.vue'
import reportService from '@/services/reportService'
import { useToast } from 'vue-toastification'

import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'
import AppCard from '@/components/ui/AppCard.vue'
// AppTable لم نعد نستخدمه هنا مباشرة، ولكن قد يكون لديك مكونات أخرى تستخدمه
// import AppTable from '@/components/ui/AppTable.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

const toast = useToast()
const router = useRouter()

const selectedCompanyId = ref(null)
const reportData = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchReport() {
  if (!selectedCompanyId.value) {
    reportData.value = null
    return
  }

  loading.value = true
  error.value = null
  reportData.value = null

  try {
    const response = await reportService.getCompanyStatement(selectedCompanyId.value)
    reportData.value = response.data.data
  } catch (err) {
    error.value = 'فشل في تحميل بيانات التقرير. الرجاء المحاولة مرة أخرى.'
    toast.error(error.value)
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handlePrint = () => {
  if (!reportData.value) return

  sessionStorage.setItem('printStatementData', JSON.stringify(reportData.value))

  const routeData = router.resolve({ name: 'PrintCompanyStatement' })
  window.open(routeData.href, '_blank')
}
</script>
