/**
 * ملف أدوات التنسيق (Formatters)
 */

/**
 * يقوم بتنسيق القيمة الرقمية وإضافة "د.ل" يدوياً.
 * @param {number | string | null | undefined} value - القيمة الرقمية.
 * @returns {string} - السلسلة المنسقة، مثال: "1,500 د.ل"
 */
export function formatCurrency(value) {
  // التحقق من القيم الفارغة
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  // تحويل القيمة إلى رقم لضمان عمل الدالة حتى لو جاءت القيمة كنص من السيرفر
  const numValue = Number(value)

  // إذا لم يكن رقماً صحيحاً (NaN)، نعيد القيمة كما هي أو صفر
  if (isNaN(numValue)) {
    return '0 د.ل'
  }

  // إعدادات التنسيق (أرقام إنجليزية، فواصل آلاف)
  const options = {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }

  // إزالة الكسور إذا كان الرقم صحيحاً (بدون فكة)
  if (numValue % 1 === 0) {
    options.maximumFractionDigits = 0
    options.minimumFractionDigits = 0
  }

  // التنسيق باستخدام مكتبة المتصفح القياسية
  const formattedNumber = new Intl.NumberFormat('en-US', options).format(numValue)

  // إرجاع الرقم مع رمز العملة
  return `${formattedNumber} د.ل`
}

/**
 * يقوم بتنسيق سلسلة التاريخ إلى صيغة ميلادية رقمية (يوم/شهر/سنة).
 * @param {string | null | undefined} dateString - سلسلة التاريخ.
 * @returns {string} - السلسلة المنسقة.
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return date.toLocaleDateString('en-GB', options)
}
