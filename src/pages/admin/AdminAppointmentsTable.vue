<template>
  <Card title="Appointments">
    <!-- Search and Filter Bar -->
    <div class="appointments-search-bar flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div class="flex flex-col md:flex-row md:items-center gap-4 w-full">
        <div class="relative flex-shrink-0 w-full md:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search appointments..."
            class="appointments-search-field pl-10 h-10 w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="All Status"
            class="appointments-filter-select h-10 min-w-[120px]"
          />
          <Select
            v-model="doctorFilter"
            :options="doctorOptions"
            placeholder="All Doctors"
            class="appointments-filter-select h-10 min-w-[120px]"
          />
          <Select
            v-model="dateFilter"
            :options="dateFilterOptions"
            placeholder="All Dates"
            class="appointments-filter-select h-10 min-w-[120px]"
          />
        </div>
      </div>
      <div class="appointments-actions flex items-center">
        <span 
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="appointments-clear-filters cursor-pointer text-blue-600 hover:text-blue-800 text-sm ml-2"
        >
          Clear filters
        </span>
      </div>
    </div>

    <!-- Filter Summary -->
    <div v-if="!loading" class="appointments-filter-summary">
      <p class="text-sm text-gray-600">{{ filterSummary }}</p>
    </div>
    <div class="appointments-table-container">
      <table class="appointments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Doctor Availability</th>
            <th>Patient</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="6" class="py-12">
              <div class="flex items-center justify-center gap-3 text-gray-500">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span class="text-sm font-medium">Loading appointments...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredAppointments.length === 0" class="empty-row">
            <td colspan="6" class="py-12">
              <div class="flex flex-col items-center justify-center gap-2 text-gray-400">
                <svg v-if="!hasActiveFilters" class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6m-6 0l.5-3h5l.5 3" />
                </svg>
                <svg v-else class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p v-if="!hasActiveFilters" class="text-sm font-medium">No appointments found</p>
                <p v-else class="text-sm font-medium">No appointments match your filters</p>
                <p v-if="!hasActiveFilters" class="text-xs text-gray-400">System appointments will appear here</p>
                <p v-else class="text-xs text-gray-400">Try adjusting your search or filters</p>
                <button
                  v-if="hasActiveFilters"
                  @click="clearAllFilters"
                  class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            </td>
          </tr>
          <tr v-else v-for="appt in filteredAppointments" :key="appt.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ formatDateTime(appt.scheduled_at, 'dd MMM yyyy') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              {{ formatDateTime(appt.scheduled_at, 'HH:mm') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ appt.doctor?.user?.name || '-' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ appt.doctor?.specialization || '' }}
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-if="parseAvailability(appt.doctor?.availability).length === 0" class="text-xs text-gray-400 italic">
                  No schedule set
                </span>
                <span v-else v-for="(slot, idx) in parseAvailability(appt.doctor?.availability)" :key="idx"
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ slot.day }} {{ slot.start }}-{{ slot.end }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ appt.patient?.user?.name || '-' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ appt.patient?.user?.email || '' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getEnhancedStatusClass(appt.status)">
                {{ appt.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="meta.last_page > 1" class="flex justify-center mt-4 gap-2">
      <Button size="sm" :disabled="page === 1" @click="$emit('page-change', page - 1)">Prev</Button>
      <Button
        v-for="p in meta.last_page"
        :key="p"
        size="sm"
        :variant="p === page ? 'primary' : 'secondary'"
        @click="$emit('page-change', p)"
      >{{ p }}</Button>
      <Button size="sm" :disabled="page === meta.last_page" @click="$emit('page-change', page + 1)">Next</Button>
    </div>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Select from '@/components/Select.vue'
import { formatDateTime } from '@/utils/format.js'
import { ref, computed } from 'vue'

const props = defineProps({
  appointments: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  meta: { type: Object, required: true },
  page: { type: Number, required: true }
})

// Search and Filter State
const searchQuery = ref('')
const statusFilter = ref('')
const doctorFilter = ref('')
const dateFilter = ref('')

// Filter Options
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'called', label: 'Called' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const dateFilterOptions = [
  { value: '', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this_week', label: 'This Week' },
  { value: 'next_week', label: 'Next Week' },
  { value: 'this_month', label: 'This Month' }
]

// Dynamic Doctor Options
const doctorOptions = computed(() => {
  const doctors = props.appointments
    .map(appt => appt.doctor)
    .filter(doctor => doctor && doctor.user)
    .reduce((unique, doctor) => {
      if (!unique.find(d => d.id === doctor.id)) {
        unique.push(doctor)
      }
      return unique
    }, [])
  
  return [
    { value: '', label: 'All Doctors' },
    ...doctors.map(doctor => ({
      value: doctor.id.toString(),
      label: doctor.user.name
    }))
  ]
})

// Computed Properties
const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value || doctorFilter.value || dateFilter.value
})

// Main filtering logic
const filteredAppointments = computed(() => {
  let filtered = [...props.appointments]
  
  // Text search - searches across multiple fields
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(appt => {
      const doctorName = appt.doctor?.user?.name?.toLowerCase() || ''
      const patientName = appt.patient?.user?.name?.toLowerCase() || ''
      const patientEmail = appt.patient?.user?.email?.toLowerCase() || ''
      const specialization = appt.doctor?.specialization?.toLowerCase() || ''
      const status = appt.status?.toLowerCase() || ''
      const date = formatDateTime(appt.scheduled_at, 'dd MMM yyyy').toLowerCase()
      const time = formatDateTime(appt.scheduled_at, 'HH:mm')
      
      return doctorName.includes(query) ||
             patientName.includes(query) ||
             patientEmail.includes(query) ||
             specialization.includes(query) ||
             status.includes(query) ||
             date.includes(query) ||
             time.includes(query)
    })
  }
  
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(appt => appt.status === statusFilter.value)
  }
  
  // Doctor filter
  if (doctorFilter.value) {
    filtered = filtered.filter(appt => appt.doctor?.id?.toString() === doctorFilter.value)
  }
  
  // Date filter
  if (dateFilter.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(appt => {
      const dateParts = getDateParts(appt.scheduled_at)
      if (!dateParts) return false
      
      const apptDay = dateParts.dayStart
      
      switch (dateFilter.value) {
        case 'today':
          return apptDay.getTime() === today.getTime()
        
        case 'tomorrow':
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          return apptDay.getTime() === tomorrow.getTime()
        
        case 'this_week':
          const thisWeek = getWeekBoundaries(today)
          return dateParts.date >= thisWeek.start && dateParts.date <= thisWeek.end
        
        case 'next_week':
          const nextWeek = getWeekBoundaries(today, 1)
          return dateParts.date >= nextWeek.start && dateParts.date <= nextWeek.end
        
        case 'this_month':
          return dateParts.date.getMonth() === now.getMonth() && 
                 dateParts.date.getFullYear() === now.getFullYear()
        
        default:
          return true
      }
    })
  }
  
  return filtered
})

// Results summary
const filterSummary = computed(() => {
  const total = props.appointments.length
  const filtered = filteredAppointments.value.length
  
  if (!hasActiveFilters.value) {
    return `Showing all ${total} appointments`
  }
  
  if (filtered === 0) {
    return 'No appointments match your filters'
  }
  
  return `Showing ${filtered} of ${total} appointments`
})

// Filter Functions
function clearAllFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  doctorFilter.value = ''
  dateFilter.value = ''
}

// Helper function to safely get date parts
function getDateParts(dateString) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return {
      date,
      dayStart: new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }
  } catch {
    return null
  }
}

// Helper function to get week boundaries
function getWeekBoundaries(referenceDate, weekOffset = 0) {
  const date = new Date(referenceDate)
  date.setDate(date.getDate() + (weekOffset * 7))
  
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { start: startOfWeek, end: endOfWeek }
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

function getEnhancedStatusClass(status) {
  const baseClass = 'status-badge'
  switch (status) {
    case 'scheduled': return `${baseClass} scheduled`
    case 'waiting': return `${baseClass} waiting`
    case 'called': return `${baseClass} called`
    case 'completed': return `${baseClass} completed`
    case 'cancelled': return `${baseClass} cancelled`
    default: return baseClass
  }
}
</script> 