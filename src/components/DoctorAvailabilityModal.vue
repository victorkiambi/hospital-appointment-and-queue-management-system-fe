<template>
  <Modal :visible="visible" title="Edit Weekly Availability" @close="emitClose" size="large">
    <Notification v-if="error" type="error" :message="error" @close="error = ''" />
    <Notification v-if="success" type="success" :message="success" @close="success = ''" />
    <div class="space-y-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-blue-900">Set Working Hours</h4>
            <p class="text-sm text-blue-700 mt-1">Define when the doctor is available for appointments. You can add multiple time slots per day.</p>
            <p class="text-xs text-blue-600 mt-2">Format: Use 24-hour time (e.g., 09:00-12:00, 14:00-17:00)</p>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="day in daysOfWeek" :key="day" class="availability-day-card">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-semibold text-sm">{{ day.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ capitalize(day) }}</h3>
                <p class="text-sm text-gray-500">
                  {{ tempAvailability[day]?.length > 0 ? `${tempAvailability[day].length} time slot${tempAvailability[day].length > 1 ? 's' : ''}` : 'No hours set' }}
                </p>
              </div>
            </div>
            <Button size="sm" variant="secondary" @click="addRange(day)" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Hours
            </Button>
          </div>
          <div class="space-y-2">
            <div v-if="tempAvailability[day]?.length === 0" class="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <svg class="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm font-medium">No working hours set</p>
              <p class="text-xs">Click "Add Hours" to set availability</p>
            </div>
            <div v-else v-for="(timeSlot, idx) in tempAvailability[day]" :key="`${day}-${idx}`" class="time-slot-input">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      v-model="tempAvailability[day][idx]"
                      type="text"
                      placeholder="e.g., 09:00-12:00 or 14:00-17:00"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': !isValidTimeFormat(tempAvailability[day][idx]) && tempAvailability[day][idx] }"
                    />
                  </div>
                  <div v-if="!isValidTimeFormat(tempAvailability[day][idx]) && tempAvailability[day][idx]" class="mt-1 text-xs text-red-600">
                    Please use format: HH:MM-HH:MM (e.g., 09:00-17:00)
                  </div>
                </div>
                <Button size="sm" variant="danger" @click="removeRange(day, idx)" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 border">
        <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Weekly Schedule Summary
        </h4>
        <div class="grid grid-cols-1 gap-2 text-sm">
          <div v-for="day in daysOfWeek" :key="`summary-${day}`" class="flex justify-between items-center py-1">
            <span class="font-medium text-gray-700">{{ capitalize(day) }}:</span>
            <span class="text-gray-600 text-right">
              {{ tempAvailability[day]?.length > 0 ? tempAvailability[day].filter(slot => slot.trim()).join(', ') : 'Closed' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <template #actions>
      <Button variant="secondary" type="button" @click="emitClose" :disabled="loading">
        Cancel
      </Button>
      <Button variant="primary" type="button" :loading="loading" :disabled="!hasValidAvailability || loading" @click="handleSave">
        {{ loading ? 'Saving...' : 'Save Availability' }}
      </Button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import Notification from '@/components/Notification.vue'

const props = defineProps({
  visible: Boolean,
  initialAvailability: {
    type: [Array, String],
    default: () => ([])
  },
  loading: Boolean
})
const emit = defineEmits(['close', 'save'])

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]
const tempAvailability = ref({})
const error = ref('')
const success = ref('')

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function parseAvailability(avail) {
  if (Array.isArray(avail)) return avail
  if (typeof avail === 'string') {
    try {
      const arr = JSON.parse(avail)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  return []
}

function isValidTimeFormat(timeSlot) {
  if (!timeSlot || !timeSlot.trim()) return true
  const timeRangeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRangeRegex.test(timeSlot.trim())) return false
  const [start, end] = timeSlot.trim().split('-')
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return startMinutes < endMinutes
}

const hasValidAvailability = computed(() => {
  return daysOfWeek.some(day =>
    tempAvailability.value[day]?.some(slot =>
      slot.trim() && isValidTimeFormat(slot)
    )
  )
})

function addRange(day) {
  tempAvailability.value[day].push('')
}
function removeRange(day, idx) {
  tempAvailability.value[day].splice(idx, 1)
}

function emitClose() {
  error.value = ''
  success.value = ''
  emit('close')
}

function handleSave() {
  error.value = ''
  success.value = ''
  const availabilityArr = []
  const errors = []
  for (const day of daysOfWeek) {
    const daySlots = tempAvailability.value[day] || []
    for (const range of daySlots) {
      const trimmedRange = range.trim()
      if (!trimmedRange) continue
      if (!isValidTimeFormat(trimmedRange)) {
        errors.push(`Invalid time format for ${capitalize(day)}: "${trimmedRange}"`)
        continue
      }
      const [start, end] = trimmedRange.split('-').map(s => s.trim())
      if (start && end) {
        availabilityArr.push({ day: capitalize(day), start, end })
      }
    }
  }
  if (errors.length > 0) {
    error.value = errors.join('. ')
    return
  }
  if (availabilityArr.length === 0) {
    error.value = 'Please set at least one time slot for availability.'
    return
  }
  emit('save', availabilityArr)
  success.value = `Availability updated! ${availabilityArr.length} slot${availabilityArr.length !== 1 ? 's' : ''} set.`
  setTimeout(() => {
    emitClose()
  }, 1000)
}

watch(() => props.visible, (val) => {
  if (val) {
    // Initialize tempAvailability from initialAvailability
    const arr = parseAvailability(props.initialAvailability)
    const obj = {}
    for (const day of daysOfWeek) {
      obj[day] = arr.filter(slot => slot.day && slot.day.toLowerCase() === day).map(slot => `${slot.start}-${slot.end}`)
    }
    tempAvailability.value = obj
    error.value = ''
    success.value = ''
  }
})
</script>

<style scoped>
.availability-day-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow;
}
.time-slot-input {
  @apply bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors;
}
</style> 