<template>
  <!--
    هذا المكون هو مجرد حاوية بسيطة.
    سيتم عرض صفحة تسجيل الدخول (أو أي صفحة عامة أخرى)
    مكان <RouterView />.
  -->
  <div>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
// لا يوجد منطق برمجي معقد هنا، هو مجرد غلاف.
</script>
