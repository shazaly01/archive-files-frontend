<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-surface-ground">
    <!-- 1. خلفية الأورورا المتحركة -->
    <div class="aurora-container">
      <div class="aurora-shape shape1"></div>
      <div class="aurora-shape shape2"></div>
      <div class="aurora-shape shape3"></div>
    </div>

    <div class="watermark-overlay"></div>
    <!-- 2. المحتوى الرئيسي مع بطاقة تسجيل الدخول -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div
        ref="card"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        class="glass-card w-full max-w-md"
      >
        <!-- تأثير اللمعان التفاعلي -->
        <div class="card-glare"></div>

        <!-- المحتوى الفعلي للبطاقة -->
        <div class="relative z-10">
          <div class="text-center mb-8">
            <!-- [مُعدَّل] استخدم شعار مشروعك وعنوانه -->
            <img src="/MainLogo.png" alt="Project Logo" class="logo-main mx-auto mb-4" />
            <h1 class="text-4xl font-bold text-white tracking-wider">الارشفة والمراسلات</h1>
            <p class="mt-2 text-slate-300 opacity-80 text-lg"></p>
          </div>

          <!-- [مُعدَّل] رسالة الخطأ مدمجة هنا -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 text-center bg-danger/20 text-red-300 rounded-md text-sm font-semibold"
          >
            {{ errorMessage }}
          </div>

          <!-- [مُعدَّل] النموذج يستخدم 'username' ويتوافق مع authStore الجديد -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="relative">
              <input
                type="text"
                v-model="credentials.username"
                placeholder="اسم المستخدم"
                required
                class="form-input"
              />
              <!-- أيقونة المستخدم -->
              <svg
                class="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <div class="relative">
              <input
                type="password"
                v-model="credentials.password"
                placeholder="كلمة المرور"
                required
                class="form-input"
              />
              <!-- أيقونة القفل -->
              <svg
                class="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>

            <button type="submit" :disabled="isLoading" class="submit-button">
              <span v-if="isLoading">جاري التحقق...</span>
              <span v-else>تسجيل الدخول</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

// --- منطق تأثير اللمعان التفاعلي (بدون تغيير ) ---
const card = ref(null)
const onMouseMove = (event) => {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  card.value.style.setProperty('--mouse-x', `${x}px`)
  card.value.style.setProperty('--mouse-y', `${y}px`)
}
const onMouseLeave = () => {}

// --- [مُعدَّل] منطق تسجيل الدخول ليتوافق مع authStore الجديد ---
const authStore = useAuthStore()
const router = useRouter()
const credentials = reactive({ username: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // استدعاء دالة login وانتظارها
    await authStore.login(credentials)

    // [الحل] إذا لم يحدث خطأ، قم بالتوجيه من هنا
    // المسار الصحيح هو /app/dashboard كما هو معرف في router/index.js
    router.push(authStore.returnUrl || '/app/dashboard')
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'اسم المستخدم أو كلمة المرور غير صحيحة.'
    } else {
      errorMessage.value = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* --- أنماط التصميم (الأورورا، البطاقة الزجاجية، الحقول، الزر) --- */
/* تم نسخها كما هي من مثالك مع تعديلات طفيفة لتتوافق مع ألوان المشروع */

.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  filter: blur(100px) saturate(1.5);
  transform: scale(1.5);
}
.aurora-shape {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
}
.shape1 {
  width: 600px;
  height: 600px;
  background-color: rgba(30, 58, 138, 0.3); /* أزرق كحلي نقي */
  top: -150px;
  left: -200px;
  animation: move 25s infinite alternate;
}
.shape2 {
  width: 550px;
  height: 550px;
  background-color: rgba(245, 158, 11, 0.2); /* secondary color */
  bottom: -100px;
  right: -150px;
  animation: move 30s infinite alternate-reverse;
}
.shape3 {
  width: 500px;
  height: 500px;
  background-color: rgba(37, 99, 235, 0.2); /* أزرق ملكي */
  bottom: 50px;
  left: 20%;
  animation: move 22s infinite alternate;
}
@keyframes move {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(150px, 80px) rotate(180deg);
  }
}

.glass-card {
  position: relative;
  background: rgba(31, 41, 55, 0.6); /* surface-section with opacity */
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(55, 65, 81, 0.5); /* surface-border */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  overflow: hidden;
}

.card-glare {
  position: absolute;
  left: var(--mouse-x, -100%);
  top: var(--mouse-y, -100%);
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(37, 99, 235, 0.15) 0%,
    /* تغيير الأخضر للأزرق */ rgba(37, 99, 235, 0) 60%
  );
  pointer-events: none;
  transition:
    left 0.1s ease,
    top 0.1s ease;
}

.form-input {
  width: 100%;
  background: rgba(17, 24, 39, 0.8); /* surface-ground */
  border: 1px solid #374151; /* surface-border */
  border-radius: 8px;
  padding: 12px 16px 12px 45px;
  color: #f9fafb; /* text-primary */
  transition: all 0.2s ease-in-out;
}
.form-input::placeholder {
  color: #9ca3af; /* text-muted */
}
.form-input:focus {
  outline: none;
  border-color: #2563eb; /* أزرق */
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af; /* text-muted */
}

.submit-button {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(90deg, #1e3a8a, #3b82f6); /* تدرج كحلي إلى أزرق */
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.4);
}
.submit-button:disabled {
  background: #374151;
  cursor: not-allowed;
  opacity: 0.7;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;

  /* 1. الشفافية: غير هذا الرقم لتفتيح أو تغميق الشعار */
  opacity: 0.05;

  background-image: url('/Core_Logo.png');
  background-repeat: repeat;

  /* 2. الحجم والعدد:
     - رقم أصغر (مثل 80px) = شعارات كثيرة وصغيرة ومتقاربة.
     - رقم أكبر (مثل 200px) = شعارات قليلة وكبيرة ومتباعدة.
  */
  background-size: 300px;

  /* 3. اختيارياً: يمكنك إضافة تباعد داخلي وهمي عبر التحجيم */
  transform: rotate(-15deg) scale(1.1);
}

.logo-main {
  /* العرض 160 بكسل والطول سيتحدد تلقائياً ليحافظ على أبعاد الصورة 1.7:1 */
  width: 160px;
  height: auto;

  /* التأكد من عدم وجود أي قص أو تدوير */
  border-radius: 0;
  object-fit: contain;

  /* اختيارياً: إضافة ظل خفيف ليعطي عمق للشعار فوق الخلفية الزجاجية */
  filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2));
}
</style>
