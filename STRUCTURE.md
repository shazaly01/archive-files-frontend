# بنية وهيكلية مشروع الواجهة الأمامية (Frontend Architecture) - النسخة الكاملة

هذا المستند يوضح هيكلية الملفات والمجلدات المعتمدة في هذا المشروع بشكل كامل وتفصيلي. الهدف من هذا الهيكل هو ضمان قابلية الصيانة، إعادة الاستخدام، وقابلية التوسع للمشروع على المدى الطويل.

## المبادئ الأساسية

1.  **فصل المسؤوليات (Separation of Concerns):** كل ملف أو مجلد له وظيفة واحدة محددة.
2.  **التدفق الواضح للبيانات (Clear Data Flow):** يتبع التطبيق تدفقًا منطقيًا للبيانات: `Views -> Stores -> Services`.
3.  **التسمية الواضحة (Explicit Naming):** تنتهي أسماء الملفات بلاحقة توضح دورها (مثل `authService.js`, `authStore.js`).

---

## هيكل المجلدات والملفات الكامل (`/src`)

```plaintext
src/
│
├── services/               # (مسؤولية: طبقة الخدمات - الاتصال بالـ API ومنطق العمل)
│   ├── apiClient.js          # إعداد Axios المركزي (Base URL, Interceptors).
│   ├── authService.js        # خدمات المصادقة (login, logout, getUser).
│   ├── companyService.js     # خدمات CRUD للشركات.
│   ├── driverService.js      # خدمات CRUD للسائقين.
│   ├── fuelOrderService.js   # خدمات CRUD لطلبات الوقود.
│   ├── reportService.js      # خدمات التقارير ولوحة التحكم.
│   ├── roleService.js        # خدمات CRUD للأدوار والصلاحيات.
│   ├── stationService.js     # خدمات CRUD للمحطات.
│   ├── truckService.js       # خدمات CRUD للشاحنات.
│   └── userService.js        # خدمات CRUD للمستخدمين.
│
├── stores/                 # (مسؤولية: إدارة الحالة العامة - Pinia)
│   ├── authStore.js          # يخزن حالة المصادقة (token, user, permissions).
│   ├── companyStore.js       # يخزن حالة الشركات (قائمة، ترقيم صفحات).
│   ├── driverStore.js        # يخزن حالة السائقين.
│   ├── fuelOrderStore.js     # يخزن حالة طلبات الوقود.
│   ├── roleStore.js          # يخزن حالة الأدوار والصلاحيات.
│   ├── stationStore.js       # يخزن حالة المحطات.
│   ├── truckStore.js         # يخزن حالة الشاحنات.
│   └── userStore.js          # يخزن حالة المستخدمين.
│
├── router/                 # (مسؤولية: إدارة مسارات التطبيق والتنقل)
│   └── index.js              # تعريف جميع المسارات وحمايتها (Navigation Guards).
│
├── components/             # (مسؤولية: المكونات القابلة لإعادة الاستخدام - "مكعبات الليغو")
│   │
│   ├── ui/                 # مكونات واجهة المستخدم الأساسية (موجودة لديك).
│   │   ├── ActionItem.vue
│   │   ├── ActivationModal.vue
│   │   ├── ActivityItem.vue
│   │   ├── AppButton.vue
│   │   ├── AppCard.vue
│   │   ├── AppConfirmDialog.vue
│   │   ├── AppDropdown.vue
│   │   ├── AppInput.vue
│   │   ├── AppTable.vue
│   │   ├── RiskOpportunityZone.vue
│   │   ├── SkeletonCard.vue
│   │   ├── SparklineChart.vue
│   │   └── StatCard.vue
│   │
│   ├── layout/             # مكونات التخطيط الرئيسية للتطبيق.
│   │   ├── AppLayout.vue     # التخطيط الرئيسي (شريط جانبي + علوي) للمسارات المحمية.
│   │   ├── AuthLayout.vue    # تخطيط بسيط لصفحات المصادقة (مثل تسجيل الدخول).
│   │   ├── TheSidebar.vue    # الشريط الجانبي للتنقل.
│   │   └── TheHeader.vue     # الشريط العلوي (اسم المستخدم، زر الخروج).
│   │
│   ├── dashboard/          # مكونات مخصصة لصفحة لوحة التحكم.
│   │   ├── DriversChart.vue
│   │   └── OrdersChart.vue
│   │
│   └── forms/              # مكونات النماذج المعقدة والقابلة لإعادة الاستخدام.
│       ├── UserForm.vue
│       ├── RoleForm.vue
│       └── ... (باقي النماذج)
│
├── views/ (أو pages/)       # (مسؤولية: تجميع المكونات لعرض صفحات كاملة)
│   │
│   ├── Login.vue             # صفحة تسجيل الدخول.
│   ├── Dashboard.vue         # صفحة لوحة التحكم.
│   │
│   ├── companies/            # وحدة إدارة الشركات.
│   │   ├── CompaniesList.vue
│   │   └── CompanyForm.vue
│   │
│   ├── drivers/              # وحدة إدارة السائقين.
│   │   ├── DriversList.vue
│   │   └── DriverForm.vue
│   │
│   ├── fuel-orders/          # وحدة إدارة طلبات الوقود.
│   │   ├── FuelOrdersList.vue
│   │   └── FuelOrderForm.vue
│   │
│   ├── reports/              # وحدة التقارير.
│   │   ├── DriverReport.vue
│   │   ├── OrderReport.vue
│   │   └── StationReport.vue
│   │
│   ├── roles/                # وحدة إدارة الأدوار.
│   │   ├── RolesList.vue
│   │   └── RoleForm.vue
│   │
│   ├── stations/             # وحدة إدارة المحطات.
│   │   ├── StationsList.vue
│   │   └── StationForm.vue
│   │
│   ├── trucks/               # وحدة إدارة الشاحنات.
│   │   ├── TrucksList.vue
│   │   └── TruckForm.vue
│   │
│   └── users/                # وحدة إدارة المستخدمين.
│       ├── UsersList.vue
│       └── UserForm.vue
│
├── assets/                 # (مسؤولية: الملفات الثابتة مثل الأنماط، الصور، الخطوط)
│   └── main.css
│
├── App.vue                 # المكون الجذري للتطبيق (يحتوي على <router-view />).
│
└── main.js                 # نقطة الدخول الرئيسية للتطبيق (تهيئة Vue, Pinia, Router).
```
