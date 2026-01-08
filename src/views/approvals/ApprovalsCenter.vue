<template>
  <div class="p-6 space-y-6 min-h-screen">
    <div>
      <h1 class="text-2xl font-bold text-text-primary">مركز الاعتمادات</h1>
      <p class="text-text-secondary mt-1">إدارة الطلبات الواردة والصادرة ومتابعة حالتها.</p>
    </div>

    <div class="border-b border-surface-border">
      <nav class="flex gap-6">
        <button
          @click="activeTab = 'incoming'"
          class="pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
          :class="
            activeTab === 'incoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          "
        >
          <InboxArrowDownIcon class="w-5 h-5" />
          الواردة (مطلوب قراري)
        </button>
        <button
          @click="activeTab = 'outgoing'"
          class="pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
          :class="
            activeTab === 'outgoing'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          "
        >
          <PaperAirplaneIcon class="w-5 h-5" />
          الصادرة (طلباتي)
        </button>
      </nav>
    </div>

    <AppTable
      :headers="headers"
      :items="activeTab === 'incoming' ? store.incomingApprovals : store.outgoingApprovals"
      :is-loading="store.loading"
      :row-clickable="true"
      @row-click="openDocument"
    >
      <template #cell-document="{ item }">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <DocumentTextIcon class="w-5 h-5" />
          </div>
          <div>
            <p class="font-bold text-text-primary">{{ item.document_version?.file_name }}</p>
            <p class="text-xs text-text-muted">v{{ item.document_version?.version_number }}</p>
          </div>
        </div>
      </template>

      <template #cell-user="{ item }">
        <div class="flex items-center gap-2">
          <UserCircleIcon class="w-5 h-5 text-text-muted" />
          <span class="text-sm text-text-primary">
            {{ activeTab === 'incoming' ? item.requester?.full_name : item.approver?.full_name }}
          </span>
        </div>
      </template>
      <template #cell-project="{ item }">
        <div class="flex flex-col">
          <span class="text-sm font-medium text-text-primary">
            {{ item.document_version?.document?.project?.title || 'غير محدد' }}
          </span>
          <span class="text-xs text-text-muted">
            {{ item.document_version?.document?.title }}
          </span>
        </div>
      </template>

      <template #cell-department="{ item }">
        <div class="flex items-center gap-2">
          <span class="text-sm text-text-secondary">
            {{
              activeTab === 'incoming'
                ? item.requester?.department?.name
                : item.approver?.department?.name || 'عام'
            }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          v-if="activeTab === 'incoming'"
          class="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"
        >
          بانتظار قرارك
        </span>
        <span
          v-else
          class="px-2 py-1 rounded-full text-xs font-bold"
          :class="{
            'bg-yellow-100 text-yellow-700': item.status === 'pending',
            'bg-green-100 text-green-700': item.status === 'approved',
            'bg-red-100 text-red-700': item.status === 'rejected',
          }"
        >
          {{ getStatusLabel(item.status) }}
        </span>
      </template>

      <template #cell-date="{ item }">
        <span class="text-xs text-text-muted">{{ formatDate(item.created_at) }}</span>
      </template>
    </AppTable>

    <DocumentPreviewModal
      v-model="showPreview"
      :document-id="selectedDocumentId"
      :initial-version-id="selectedVersionId"
      @closed="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApprovalStore } from '@/stores/approvalStore'
import AppTable from '@/components/ui/AppTable.vue'
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal.vue'
import {
  InboxArrowDownIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'

const store = useApprovalStore()
const activeTab = ref('incoming')
const showPreview = ref(false)
const selectedDocumentId = ref(null)
const selectedVersionId = ref(null)

const headers = computed(() => [
  { key: 'document', label: 'المستند', class: 'text-right' },
  // [جديد] عمود المشروع
  { key: 'project', label: 'المشروع', class: 'text-right hidden md:table-cell' },
  // [جديد] عمود القسم
  { key: 'department', label: 'القسم', class: 'text-right hidden sm:table-cell' },
  {
    key: 'user',
    // تغيير التسمية لتكون أوضح
    label: activeTab.value === 'incoming' ? 'مقدم الطلب' : 'المعتمد',
    class: 'text-right',
  },
  { key: 'date', label: 'تاريخ الطلب', class: 'text-right' },
  { key: 'status', label: 'الحالة', class: 'text-center' },
])

function getStatusLabel(status) {
  const labels = { pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض' }
  return labels[status] || status
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-EG')
}

// عند الضغط على صف، نفتح مودال المعاينة للمستند المرتبط
function openDocument(approvalItem) {
  // 1. استخراج معرف المستند (أصبح متاحاً الآن بعد تعديل الباك إند)
  const docId = approvalItem.document_version?.document_id

  // 2. استخراج معرف الإصدار الخاص بهذا الطلب
  const verId = approvalItem.document_version?.id

  if (docId) {
    selectedDocumentId.value = docId
    selectedVersionId.value = verId // <--- [جديد] حفظ الإصدار
    showPreview.value = true
  } else {
    console.error('Error: Document ID not found in item:', approvalItem)
  }
}

// تحديث البيانات عند إغلاق المودال (لأن الحالة قد تغيرت)
function refreshData() {
  if (activeTab.value === 'incoming') store.fetchIncoming()
  else store.fetchOutgoing()
}

watch(activeTab, refreshData, { immediate: true })
</script>
