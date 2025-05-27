<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center font-medium rounded focus:outline-none transition',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    :aria-busy="loading ? 'true' : undefined"
  >
    <span v-if="loading" class="mr-2 animate-spin">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
    </span>
    <slot name="icon"></slot>
    <span><slot /></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // primary, secondary, danger
  size: { type: String, default: 'md' }, // sm, md, lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1 text-sm'
    case 'lg': return 'px-6 py-3 text-lg'
    default: return 'px-4 py-2 text-base'
  }
})
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    case 'danger': return 'bg-red-600 text-white hover:bg-red-700'
    case 'success': return 'bg-green-600 text-white hover:bg-green-700'
    default: return 'bg-blue-600 text-white hover:bg-blue-700'
  }
})
</script> 