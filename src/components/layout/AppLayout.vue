<template>
  <div class="h-screen bg-surface-ground text-text-primary">
    <!-- القائمة الجانبية للهاتف (منبثقة) - تبقى كما هي لأنها تستخدم position: fixed -->
    <TransitionRoot as="template" :show="isSidebarOpen">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="isSidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60" />
        </TransitionChild>
        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
            <DialogPanel class="relative ml-auto flex h-full w-full max-w-xs flex-1">
              <TheSidebar class="w-full" @close-sidebar="isSidebarOpen = false" />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- [بداية التعديل الجذري] -->
    <!-- بنية جديدة تعزل تخطيط سطح المكتب عن تخطيط الهاتف -->
    <div class="flex h-full">
      <!-- القائمة الجانبية لسطح المكتب (ثابتة) -->
      <div class="hidden lg:flex lg:flex-shrink-0">
        <TheSidebar class="w-64" />
      </div>

      <!-- المحتوى الرئيسي -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!--
          تمت إضافة z-20 و relative هنا لضمان أن الهيدر دائمًا قابل للنقر
          ويكون فوق المحتوى ولكن تحت الـ Dialog (z-50)
        -->
        <TheHeader @open-sidebar="isSidebarOpen = true" class="relative z-20" />
        <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <RouterView />
        </main>
      </div>
    </div>
    <!-- [نهاية التعديل الجذري] -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import TheSidebar from './TheSidebar.vue'
import TheHeader from './TheHeader.vue'

const isSidebarOpen = ref(false)
</script>
