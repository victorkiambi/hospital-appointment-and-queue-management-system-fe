<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-sm font-medium mb-1">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="[
        'block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2',
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200',
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      ]"
      :aria-invalid="!!error"
      :aria-describedby="error ? id + '-error' : undefined"
    >
      <option value="" disabled selected hidden>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="error" :id="id + '-error'" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select an option' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const id = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)
</script> 