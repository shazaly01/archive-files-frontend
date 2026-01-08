console.error('--- !!! DANGER !!! Main.js is running! ---')
console.error('This should ONLY run for the main application, NOT the print window.')

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// --- إضافاتنا الجديدة ---
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import './main.css'

// --- الخدمات المطلوبة للمكونات الديناميكية ---
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'vue-toastification'
// استيراد ملف الأنماط الخاص بالمكتبة
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// [صحيح] استدعاء واحد فقط لـ PrimeVue مع خيار unstyled
app.use(PrimeVue, { unstyled: true })

// --- تفعيل الخدمات ---
app.use(ToastService)
app.use(ConfirmationService)

// --- [الإضافة الجديدة] ---
// إعداد خيارات المكتبة (اختياري ولكن موصى به)
const options = {
  position: 'top-right', // مكان ظهور الإشعارات
  timeout: 5000, // مدة بقاء الإشعار (5 ثوانٍ)
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: true, // <-- مهم جدًا: تفعيل الدعم من اليمين إلى اليسار للغة العربية
}

app.use(Toast, options) // استخدام المكتبة مع الخيارات
// --- [نهاية الإضافة] ---

app.mount('#app')
