<template>
  <div class="p-6 space-y-8 min-h-screen">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">لوحة القيادة</h1>
        <p class="text-text-secondary mt-1">مرحباً بك، {{ user?.name }} 👋 إليك ملخص النظام.</p>
      </div>
      <div
        class="text-sm text-text-muted bg-surface-section px-4 py-2 rounded-lg border border-surface-border"
      >
        {{ currentDate }}
      </div>
    </div>

    <div v-if="!store.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="طلبات بانتظارك"
        :value="store.stats.pending_approvals || 0"
        :icon="ExclamationCircleIcon"
        color="warning"
        :to="{ name: 'ApprovalsCenter' }"
      />

      <StatCard
        :title="hasKey('total_projects') ? 'إجمالي المشاريع' : 'مشاريعي النشطة'"
        :value="store.stats.total_projects ?? store.stats.my_projects ?? 0"
        :icon="FolderIcon"
        color="primary"
        :to="{ name: 'ProjectsList' }"
      />

      <StatCard
        :title="hasKey('total_documents') ? 'إجمالي الملفات' : 'ملفاتي المرفوعة'"
        :value="store.stats.total_documents ?? store.stats.my_documents ?? 0"
        :icon="DocumentTextIcon"
        color="success"
      />

      <StatCard
        v-if="hasKey('total_users')"
        title="المستخدمين"
        :value="store.stats.total_users"
        :icon="UsersIcon"
        color="purple"
      />

      <StatCard
        v-else-if="hasKey('storage_used_mb')"
        title="استهلاك التخزين"
        :value="store.stats.storage_used_mb"
        :icon="ServerIcon"
        color="gray"
      >
        <template #extra>
          <span class="text-sm font-normal text-text-muted">MB</span>
        </template>
      </StatCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div
        class="lg:col-span-2 bg-surface-section rounded-xl border border-surface-border shadow-sm overflow-hidden"
      >
        <div class="p-5 border-b border-surface-border flex justify-between items-center">
          <h3 class="font-bold text-text-primary flex items-center gap-2">
            <ClockIcon class="w-5 h-5 text-text-muted" />
            آخر النشاطات
          </h3>
        </div>

        <div class="divide-y divide-surface-border">
          <div v-if="store.loading" class="p-8 text-center text-text-muted">
            جارٍ تحميل النشاطات...
          </div>

          <div v-else-if="store.activities.length === 0" class="p-8 text-center text-text-muted">
            لا توجد نشاطات حديثة.
          </div>

          <div
            v-for="log in store.activities"
            :key="log.id"
            class="p-4 flex items-start gap-4 hover:bg-surface-ground transition-colors"
          >
            <div
              class="mt-1 p-2 rounded-full bg-surface-ground border border-surface-border text-primary"
            >
              <BoltIcon class="w-4 h-4" />
            </div>

            <div class="flex-1">
              <p class="text-sm text-text-primary">
                <span class="font-bold">{{ log.user }}</span>
                {{ log.action }}
              </p>
              <p class="text-xs text-text-muted mt-1">{{ log.time_ago }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="bg-gradient-to-br from-primary-dark to-primary rounded-xl p-6 text-white shadow-lg"
        >
          <h3 class="font-bold text-lg mb-2">إجراءات سريعة</h3>
          <p class="text-primary-light text-sm mb-6">روابط مختصرة لبدء العمل.</p>

          <div class="space-y-3">
            <button
              @click="router.push({ name: 'ProjectsList' })"
              class="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 flex items-center gap-3 transition-colors"
            >
              <PlusIcon class="w-5 h-5" />
              <span>مشروع جديد</span>
            </button>

            <button
              @click="router.push({ name: 'ApprovalsCenter' })"
              class="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 flex items-center gap-3 transition-colors"
            >
              <CheckBadgeIcon class="w-5 h-5" />
              <span>متابعة الاعتمادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import StatCard from '@/components/ui/StatCard.vue' // [جديد] استيراد المكون

import {
  FolderIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  PlusIcon,
  CheckBadgeIcon,
  UsersIcon,
  ServerIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useDashboardStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function hasKey(key) {
  return store.stats && Object.prototype.hasOwnProperty.call(store.stats, key)
}

onMounted(() => {
  store.fetchStats()
})
</script>
