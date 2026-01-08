<template>
  <AppCard class="mb-6">
    <div class="p-4">
      <div class="flex flex-col md:flex-row md:items-end gap-4">
        <div class="flex-grow max-w-sm">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">فلترة حسب الشركة</h3>
          <CompaniesDropdown
            id="project-company-filter"
            label=""
            :model-value="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            placeholder="عرض كل الشركات"
          />
        </div>

        <div class="flex-grow md:max-w-md">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">بحث سريع</h3>
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="اسم المشروع أو الشركة..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'

defineProps({
  // قيمة فلتر الشركة (تدعم DECIMAL 18)
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
  // قيمة نص البحث القادمة من الأب
  searchQuery: {
    type: String,
    default: '',
  },
})

// إبلاغ الأب بتحديث أي من القيمتين
defineEmits(['update:modelValue', 'update:searchQuery'])
</script>
