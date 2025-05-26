<template>
  <div class="bg-white rounded-lg shadow p-6 mb-4">
    <div v-if="title || $slots.actions" class="flex justify-between items-center mb-4">
      <h4 v-if="title" class="text-lg font-semibold">{{ title }}</h4>
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' }
})
</script> 