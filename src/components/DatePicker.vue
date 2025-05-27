<template>
  <div class="date-picker">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    
    <!-- Calendar Header -->
    <div class="bg-white border border-gray-300 rounded-lg shadow-sm">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button 
          type="button" 
          @click="previousMonth" 
          class="p-1 hover:bg-gray-100 rounded-full"
          :disabled="!canGoPrevious"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 class="text-lg font-semibold text-gray-900">
          {{ currentMonthYear }}
        </h2>
        
        <button 
          type="button" 
          @click="nextMonth" 
          class="p-1 hover:bg-gray-100 rounded-full"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Calendar Grid -->
      <div class="p-4">
        <!-- Days of week header -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in dayHeaders" :key="day" class="text-center text-xs font-medium text-gray-500 py-2">
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar dates -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="date in calendarDates"
            :key="date.key"
            type="button"
            @click="selectDate(date)"
            :disabled="!date.selectable"
            :class="[
              'relative p-2 text-sm rounded-lg transition-colors duration-200',
              date.isToday && 'font-semibold',
              date.isSelected && 'bg-blue-600 text-white shadow-md',
              !date.isSelected && date.isCurrentMonth && date.selectable && 'hover:bg-blue-50 text-gray-900 hover:shadow-sm',
              !date.isSelected && date.isCurrentMonth && !date.selectable && 'text-gray-400 cursor-not-allowed',
              !date.isCurrentMonth && 'text-gray-300',
              date.hasAvailability && !date.isSelected && 'bg-green-50 border border-green-200 text-green-800 font-medium'
            ]"
          >
            {{ date.day }}
            
            <!-- Multiple availability indicators -->
            <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              <!-- Availability indicator -->
              <div v-if="date.hasAvailability && !date.isSelected" class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              
              <!-- Today indicator -->
              <div v-if="date.isToday && !date.isSelected" class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            
            <!-- Recurring pattern label -->
            <div v-if="date.hasAvailability && date.isCurrentMonth" class="absolute -top-1 -right-1">
              <div class="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                <div class="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Selected date info and legend -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <!-- Legend -->
        <div class="flex items-center justify-center gap-6 text-xs text-gray-600 mb-3">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Today</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Selected</span>
          </div>
        </div>
        
        <!-- Selected date info -->
        <div v-if="selectedDate" class="flex items-center justify-center gap-2 text-sm">
          <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium text-gray-900">
            Selected: {{ formatSelectedDate }}
          </span>
        </div>
        
        <!-- Availability info -->
        <div v-else class="text-center text-sm text-gray-500">
          <span>Select an available date to continue</span>
        </div>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, addMonths, subMonths } from 'date-fns'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  availableDates: {
    type: Array,
    default: () => []
  },
  minDate: {
    type: Date,
    default: () => new Date()
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentMonth = ref(new Date())
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue ? new Date(newValue) : null
})

const currentMonthYear = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy')
})

const canGoPrevious = computed(() => {
  const previousMonth = subMonths(currentMonth.value, 1)
  const previousMonthEnd = endOfMonth(previousMonth)
  return !isBefore(previousMonthEnd, props.minDate)
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return format(selectedDate.value, 'EEEE, MMMM d, yyyy')
})

const calendarDates = computed(() => {
  const monthStart = startOfMonth(currentMonth.value)
  const monthEnd = endOfMonth(currentMonth.value)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const dates = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  return dates.map(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const isCurrentMonth = isSameMonth(date, currentMonth.value)
    const isPast = isBefore(date, props.minDate)
    const hasAvailability = props.availableDates.includes(dateString)
    const isSelectable = isCurrentMonth && !isPast && hasAvailability
    
    return {
      key: dateString,
      day: format(date, 'd'),
      date: date,
      dateString: dateString,
      isCurrentMonth,
      isToday: isToday(date),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      hasAvailability,
      selectable: isSelectable
    }
  })
})

function previousMonth() {
  if (canGoPrevious.value) {
    currentMonth.value = subMonths(currentMonth.value, 1)
  }
}

function nextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

function selectDate(dateObj) {
  if (!dateObj.selectable) return
  
  selectedDate.value = dateObj.date
  const dateString = dateObj.dateString
  
  emit('update:modelValue', dateString)
  emit('change', dateString)
}
</script>

<style scoped>
.date-picker {
  @apply w-full;
}
</style>