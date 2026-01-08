<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
      @click.self="close"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="modelValue" class="w-full max-w-2xl">
          <AppCard>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-text-primary">{{ title }}</h3>
              <!-- <button
                @click="close"
                class="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button> -->
            </div>
            <div>
              <slot />
            </div>
          </AppCard>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import AppCard from './AppCard.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>
