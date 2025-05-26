<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-sm font-medium mb-1">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      :aria-invalid="!!error"
      :aria-describedby="error ? id + '-error' : undefined"
    />
    <p v-if="error" :id="id + '-error'" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const id = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script> 