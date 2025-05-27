<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @keydown.esc="emitClose" tabindex="-1" aria-modal="true" role="dialog">
      <div :class="['bg-white rounded-lg shadow-lg w-full mx-auto relative flex flex-col', sizeClasses, 'max-h-[90vh]']" @click.stop>
        <div class="flex justify-between items-center border-b px-6 py-4 flex-shrink-0">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <button @click="emitClose" aria-label="Close" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <slot />
        </div>
        <div v-if="$slots.actions" class="flex justify-end gap-2 border-t px-6 py-4 bg-gray-50 rounded-b-lg flex-shrink-0">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue'
const props = defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' } // sm, md, lg, xl
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-md'
    case 'lg': return 'max-w-2xl'
    case 'xl': return 'max-w-4xl'
    default: return 'max-w-lg'
  }
})
const emit = defineEmits(['close'])
function emitClose() {
  emit('close')
}
function handleClickOutside(e) {
  if (e.target.classList.contains('bg-black')) emitClose()
}
watch(() => props.visible, (val) => {
  if (val) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
})
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style> 