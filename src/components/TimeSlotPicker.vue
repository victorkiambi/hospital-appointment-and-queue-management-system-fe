<template>
  <div class="time-slot-picker">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-3">
      {{ label }}
    </label>
    
    <div v-if="!availableSlots.length" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm">No time slots available</p>
      <p class="text-xs text-gray-400 mt-1">Please select a different date</p>
    </div>
    
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <button
        v-for="slot in availableSlots"
        :key="slot"
        type="button"
        @click="selectSlot(slot)"
        :class="[
          'relative px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium',
          modelValue === slot 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
        ]"
      >
        {{ formatTime(slot) }}
        
        <!-- Selected indicator -->
        <div v-if="modelValue === slot" class="absolute -top-1 -right-1">
          <div class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </button>
    </div>
    
    <!-- Selected time info -->
    <div v-if="modelValue" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium text-blue-900">
          Selected time: {{ formatTime(modelValue) }}
        </span>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  availableSlots: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

function formatTime(timeString) {
  if (!timeString) return ''
  
  try {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const minute = parseInt(minutes)
    
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return timeString
  }
}

function selectSlot(slot) {
  emit('update:modelValue', slot)
  emit('change', slot)
}
</script>

<style scoped>
.time-slot-picker {
  @apply w-full;
}
</style>