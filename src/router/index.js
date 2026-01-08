// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- Layouts ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- Basic Pages ---
import LoginView from '@/views/LoginView.vue'
// افترضت أن هذا الملف موجود لديك مسبقاً
import DashboardView from '@/views/dashboard/DashboardView.vue'
const DocumentDetails = () => import('@/views/documents/DocumentDetails.vue')

// --- EDMS Modules (Lazy Loading) ---

// 1. الإدارة العامة
// [مفعل] تم تصحيح اسم المجلد ليبدأ بحرف كبير ليطابق ما أنشأناه
const DepartmentsList = () => import('@/views/departments/DepartmentsList.vue')
const ForbiddenView = () => import('@/views/ForbiddenView.vue')
//[معلق مؤقتاً] - سيتم تفعيلها عند إنشاء الملفات
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')

// 2. جوهر النظام (المشاريع والملفات)
// [معلق مؤقتاً]
const ProjectsList = () => import('@/views/projects/ProjectsList.vue')
const ProjectDetails = () => import('@/views/projects/ProjectDetails.vue')

// 3. دورة العمل (الاعتمادات)
// [معلق مؤقتاً]
const ApprovalsCenter = () => import('@/views/approvals/ApprovalsCenter.vue')

const routes = [
  // --- المسارات العامة ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: '', redirect: '/login' },
    ],
  },

  // صفحة 403 (Forbidden) بسيطة جداً لتجنب التكرار في الراوتر
  {
    path: '/403',
    name: 'Forbidden',
    component: ForbiddenView, // استخدام المكون بدلاً من template
  },
  // --- المسارات المحمية (داخل التطبيق) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // 1. لوحة القيادة
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { permission: 'dashboard.view' },
      },

      // 2. إدارة الأقسام (التي نعمل عليها الآن)
      {
        path: 'departments',
        name: 'DepartmentsList',
        component: DepartmentsList,
        // تأكد من أن المستخدم لديه هذه الصلاحية في قاعدة البيانات، أو احذف السطر مؤقتاً للاختبار
        meta: { permission: 'department.view' },
      },

      {
        path: 'projects',
        name: 'ProjectsList',
        component: ProjectsList,
        meta: { permission: 'dashboard.view' },
      },

      {
        path: 'projects/:id',
        name: 'ProjectDetails',
        component: ProjectDetails,
        meta: { permission: 'dashboard.view' },
        props: true,
      },
      {
        path: 'documents/:id',
        name: 'DocumentDetails',
        component: DocumentDetails,
        meta: { permission: 'project.view.public' }, // أو الصلاحية المناسبة
        props: true,
      },

      {
        path: 'approvals',
        name: 'ApprovalsCenter',
        component: ApprovalsCenter,
        meta: { permission: 'approval.view' },
      },

      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },

      // إعادة التوجيه الافتراضية
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // صفحة 404
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- Navigation Guard (حارس التنقل) ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // التأكد من تحميل المستخدم إذا كان لدينا توكن ولكن الستور فارغ
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      authStore.logout()
      return next({ name: 'Login' })
    }
  }

  const { isAuthenticated, can } = authStore

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      const requiredPermission = to.meta.permission
      if (requiredPermission && !can(requiredPermission)) {
        // [تعديل] التوجيه لصفحة 403 بدلاً من الداشبورد لمنع التكرار اللانهائي
        next({ name: 'Forbidden' })
      } else {
        next()
      }
    }
  } else {
    // إذا كان مسجلاً للدخول وحاول الذهاب لصفحة الدخول
    if (to.name === 'Login' && isAuthenticated) {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
})

export default router
