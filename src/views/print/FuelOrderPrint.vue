<template>
  <div class="bg-gray-200 min-h-screen font-sans print:bg-white">
    <!-- شريط الإجراءات -->
    <div class="max-w-5xl mx-auto p-4 print-hide">
      <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
        <h3 class="font-bold text-gray-700">معاينة طباعة طلب الوقود</h3>
        <AppButton @click="triggerPrint" :disabled="loading" variant="primary">
          <PrinterIcon class="w-5 h-5 ml-2" />
          اطبع الآن
        </AppButton>
      </div>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div
      v-if="loading || error"
      class="text-center p-10 max-w-5xl mx-auto bg-white my-4 rounded-lg shadow"
    >
      <p v-if="loading" class="text-gray-600">جاري تجهيز بيانات الطلب...</p>
      <p v-else class="text-red-500 font-semibold">{{ error }}</p>
    </div>

    <!-- تصميم التقرير المحسّن للطباعة -->
    <div
      v-else-if="order"
      id="report-to-print"
      class="max-w-5xl mx-auto my-4 bg-white rounded-xl shadow-2xl overflow-hidden"
    >
      <!-- 1. الترويسة الديناميكية مع الأمواج -->
      <header class="relative text-white p-8 bg-wave">
        <div class="relative z-10 flex justify-between items-start">
          <div class="flex items-center gap-4">
            <img src="/logo2.png" alt="شعار الشركة" class="h-14 w-auto drop-shadow-lg" />
            <div>
              <h2 class="text-2xl font-bold">شركة الأسطول</h2>
              <p class="text-sm opacity-80">لنقل الوقود ومشتقاته</p>
            </div>
          </div>
          <div class="text-right">
            <h1 class="text-4xl font-extrabold tracking-wide">طلب وقود</h1>
            <p class="font-mono opacity-90 mt-1">#{{ order.id }}</p>
          </div>
        </div>
        <div class="wave-shape"></div>
      </header>

      <!-- 2. المحتوى الرئيسي -->
      <main class="p-8">
        <!-- بطاقات المعلومات الرئيسية -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div class="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
            <div class="bg-blue-100 text-blue-600 p-3 rounded-full">
              <UserIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">السائق</p>
              <p class="text-md font-bold text-gray-800">{{ order.driver?.name || 'غير محدد' }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
            <div class="bg-blue-100 text-blue-600 p-3 rounded-full">
              <BuildingStorefrontIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">المحطة</p>
              <p class="text-md font-bold text-gray-800">{{ order.station?.name || 'غير محدد' }}</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
            <div class="bg-blue-100 text-blue-600 p-3 rounded-full">
              <TagIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">الحالة</p>
              <span
                v-if="order.status"
                class="text-md font-bold py-1 px-3 rounded-full text-white"
                :style="{ backgroundColor: order.status.color || '#6c757d' }"
              >
                {{ order.status.name }}
              </span>
            </div>
          </div>
        </section>

        <!-- 3. تفاصيل الطلب المدمجة -->
        <section>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">تفاصيل الطلب</h3>
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-right">
              <tbody class="divide-y divide-gray-200">
                <tr class="text-gray-700">
                  <td class="py-3 px-4 font-medium bg-gray-50 w-1/4">تاريخ الطلب</td>
                  <td class="py-3 px-4 font-mono text-right">{{ order.order_date }}</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-medium bg-gray-50">نوع المنتج</td>
                  <td class="py-3 px-4 font-semibold text-right">
                    {{ order.product?.name || 'غير محدد' }}
                  </td>
                </tr>
                <!-- صف الكمية المدمج والمعدل -->
                <tr class="text-lg font-bold">
                  <td class="py-4 px-4 font-bold bg-blue-50 text-blue-800">الكمية المطلوبة</td>
                  <td class="py-4 px-4 text-right text-blue-800 bg-blue-50">
                    <span class="font-mono text-xl">{{
                      new Intl.NumberFormat().format(order.quantity)
                    }}</span>
                    <span class="mr-1">لتر</span>
                  </td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-medium bg-gray-50">ملاحظات</td>
                  <td class="py-3 px-4 text-gray-600 text-right">{{ order.notes || 'لا توجد' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- 4. التذييل مع الباركود -->
      <footer class="mt-6 p-6 border-t flex justify-between items-center">
        <div class="text-xs text-gray-500">
          <p class="font-bold">شركة الأسطول لنقل الوقود</p>
          <p>تم إنشاء هذا المستند بتاريخ: {{ new Date().toLocaleString('ar-SA') }}</p>
        </div>
        <div>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=order_{{order.id}}"
            alt="QR Code"
          />
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
// ... نفس كود الـ script setup السابق
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFuelOrderStore } from '@/stores/fuelOrderStore'
import AppButton from '@/components/ui/AppButton.vue'
import { PrinterIcon, UserIcon, BuildingStorefrontIcon, TagIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const store = useFuelOrderStore()

const order = computed(() => store.fuelOrder)
const loading = computed(() => store.loading)
const error = ref(null)

onMounted(async () => {
  const orderId = route.params.id
  if (orderId) {
    try {
      await store.fetchOneFuelOrder(orderId)
    } catch (e) {
      error.value = 'لم يتم العثور على الطلب أو حدث خطأ أثناء جلبه.'
      console.error(e)
    }
  } else {
    error.value = 'لم يتم تحديد رقم الطلب.'
  }
})

const triggerPrint = () => window.print()
</script>

<style>
/* ... نفس كود الـ style السابق ... */
.bg-wave {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  position: relative;
  overflow: hidden;
}

.wave-shape {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px; /* تم تقليل ارتفاع الموجة */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,149.3C672,117,768,107,864,128C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 5;
}

@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #report-to-print {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .bg-wave,
  .bg-gray-50,
  .bg-blue-100,
  .bg-blue-50,
  .text-blue-800 {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  main,
  footer {
    padding: 2rem !important; /* توحيد الهوامش للطباعة */
  }
}
</style>
