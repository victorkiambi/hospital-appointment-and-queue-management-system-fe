<template>
  <transition name="fade">
    <div v-if="visible" :class="[baseClass, typeClass, 'fixed top-6 right-6 z-50 shadow-lg rounded px-4 py-3 flex items-center min-w-[220px]']" role="alert" :aria-live="type === 'error' ? 'assertive' : 'polite'">
      <span class="mr-2">
        <slot name="icon">
          <svg v-if="type === 'success'" class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <svg v-else-if="type === 'error'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          <svg v-else-if="type === 'warning'" class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/></svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" d="M12 16v-4m0-4h.01"/></svg>
        </slot>
      </span>
      <span class="flex-1">{{ message }}</span>
      <button @click="close" class="ml-4 text-gray-400 hover:text-gray-600" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  type: { type: String, default: 'info' }, // success, error, info, warning
  message: { type: String, required: true },
  duration: { type: Number, default: 6000 }
})
const emit = defineEmits(['close'])
const visible = ref(true)
let timer = null
const baseClass = 'text-sm'
const typeClass = {
  success: 'bg-green-50 text-green-800 border border-green-200',
  error: 'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200'
}[props.type] || 'bg-blue-50 text-blue-800 border border-blue-200'
function close() {
  visible.value = false
  emit('close')
}
function startTimer() {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
}
onMounted(startTimer)
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
watch(() => props.message, () => { visible.value = true; startTimer() })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style> 