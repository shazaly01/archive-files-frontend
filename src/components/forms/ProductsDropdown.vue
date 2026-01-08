<!-- src/components/forms/ProductsDropdown.vue (النسخة النهائية المبسطة) -->
<template>
  <div>
    <!-- [تم التعديل هنا] استخدام AppDropdown بدلاً من Dropdown مباشرة -->
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="products"
      :loading="loading"
      :required="required"
      placeholder="اختر منتجًا (اختياري)"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue' // <-- 1. استيراد مكعب الليغو

// تعريف الـ props والـ emits (لا تغيير)
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المنتج' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات (لا تغيير)
const productStore = useProductStore()
const { products, loading } = storeToRefs(productStore)
const error = ref(null)

// جلب قائمة المنتجات عند تحميل المكون (لا تغيير)
onMounted(async () => {
  if (products.value.length === 0) {
    try {
      await productStore.fetchProducts({ per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المنتجات.'
    }
  }
})
</script>
