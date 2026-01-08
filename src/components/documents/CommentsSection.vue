<template>
  <div class="flex flex-col h-full">
    <h3
      class="text-lg font-bold text-text-primary mb-4 px-4 pt-4 border-b border-surface-border pb-2"
    >
      النقاشات والتعليقات
    </h3>

    <div class="flex-1 overflow-y-auto px-4 space-y-4 min-h-0 py-4 custom-scrollbar">
      <div
        v-if="comments.length === 0"
        class="text-center text-text-muted py-8 flex flex-col items-center"
      >
        <ChatBubbleLeftRightIcon class="w-10 h-10 mb-2 opacity-50" />
        <p>لا توجد تعليقات حتى الآن.</p>
        <p class="text-xs">كن أول من يبدأ النقاش!</p>
      </div>

      <div v-for="comment in comments" :key="comment.id" class="flex gap-3 group">
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20"
          >
            {{ getInitials(comment.user?.name) }}
          </div>
        </div>

        <div
          class="flex-1 bg-surface-ground/50 p-3 rounded-lg rounded-tr-none border border-surface-border hover:border-surface-border/80 transition-colors"
        >
          <div class="flex items-baseline justify-between mb-1">
            <span class="text-sm font-bold text-text-primary">{{
              comment.user?.name || 'مستخدم'
            }}</span>
            <span class="text-[10px] text-text-muted">{{ comment.created_at }}</span>
          </div>
          <p class="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
            {{ comment.body }}
          </p>
        </div>

        <button
          v-if="canDelete(comment)"
          @click="$emit('delete', comment.id)"
          class="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-all self-start h-8 w-8 flex items-center justify-center"
          title="حذف التعليق"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="p-4 border-t border-surface-border bg-surface-section mt-auto">
      <div v-if="loading" class="text-xs text-primary mb-1 animate-pulse">
        جارٍ إرسال التعليق...
      </div>
      <form @submit.prevent="handleSubmit" class="relative">
        <textarea
          v-model="newCommentBody"
          rows="2"
          placeholder="اكتب تعليقك هنا..."
          class="w-full bg-surface-ground border border-surface-border rounded-lg pl-3 pr-12 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder:text-text-muted/70"
          @keydown.enter.prevent="handleEnter"
          :disabled="loading"
        ></textarea>
        <button
          type="submit"
          :disabled="!isValid || loading"
          class="absolute left-2 bottom-2.5 p-1.5 rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          title="إرسال (Enter)"
        >
          <PaperAirplaneIcon class="w-4 h-4 transform rotate-180" />
        </button>
      </form>
      <div class="text-[10px] text-text-muted mt-1 mr-1">Shift + Enter لسطر جديد</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PaperAirplaneIcon, TrashIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'delete'])
const authStore = useAuthStore()

const newCommentBody = ref('')

const isValid = computed(() => newCommentBody.value.trim().length > 0)

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function canDelete(comment) {
  // يمكن للمستخدم حذف تعليقه الخاص، أو إذا كان مديراً (الباك إند سيتحقق أيضاً)
  return authStore.user && authStore.user.id === comment.user?.id
}

function handleSubmit() {
  if (!isValid.value || props.loading) return
  emit('submit', newCommentBody.value)
  newCommentBody.value = ''
}

function handleEnter(e) {
  if (!e.shiftKey) {
    handleSubmit()
  } else {
    newCommentBody.value += '\n'
  }
}
</script>

<style scoped>
/* تحسين شكل شريط التمرير */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>
