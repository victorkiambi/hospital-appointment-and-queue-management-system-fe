<template>
  <Card title="My Queue Entries">
    <div class="enhanced-table">
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Doctor</th>
            <th>Specialization</th>
            <th>Status</th>
            <th>Doctor Availability</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="5">
              <div class="loading-content">
                <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span class="text-sm font-medium">Loading queue entries...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="sortedQueueEntries.length === 0" class="empty-row">
            <td colspan="5">
              <div class="empty-content">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium">No queue entries</p>
                <p class="text-xs text-gray-400">You're not currently in any queues</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="entry in sortedQueueEntries" :key="entry.id" :class="{ 'opacity-60': isQueueEntryExpired(entry, appointments) }">
            <td>
              <div class="flex items-center gap-2">
                <div v-if="!isQueueEntryExpired(entry, appointments)" class="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {{ entry.position }}
                </div>
                <div v-else class="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                  -
                </div>
              </div>
            </td>
            <td>
              <div class="table-cell-primary">
                Dr. {{ entry.doctor?.user?.name || '-' }}
              </div>
              <div class="table-cell-secondary text-xs">
                {{ entry.doctor?.user?.email || 'No contact info' }}
              </div>
            </td>
            <td>
              <div class="table-cell-secondary">
                {{ entry.doctor?.specialization || 'General Practice' }}
              </div>
            </td>
            <td>
              <span v-if="isQueueEntryExpired(entry, appointments)" class="status-badge expired">
                Expired
              </span>
              <span v-else :class="getEnhancedStatusClass(entry.status)">
                {{ entry.status }}
              </span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-if="parseAvailability(entry.doctor?.availability).length === 0" class="text-xs text-gray-400 italic">
                  No schedule set
                </span>
                <span v-else v-for="(slot, idx) in parseAvailability(entry.doctor?.availability)" :key="idx" 
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ slot.day }} {{ slot.start }}-{{ slot.end }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<script setup>
import Card from '@/components/Card.vue'
import { computed } from 'vue'
import { isQueueEntryExpired } from '@/pages/patient/queue.js'

// Robust parseAvailability utility
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
    case 'expired': return `${baseClass} expired`
    default: return baseClass
  }
}

const props = defineProps({
  queueEntries: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  appointments: { type: Array, required: true }
})

const sortedQueueEntries = computed(() => {
  return [...props.queueEntries].sort((a, b) => {
    const aExpired = isQueueEntryExpired(a, props.appointments)
    const bExpired = isQueueEntryExpired(b, props.appointments)
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    const aDate = a.scheduled_at.includes('T') ? new Date(a.scheduled_at) : new Date(a.scheduled_at.replace(' ', 'T'))
    const bDate = b.scheduled_at.includes('T') ? new Date(b.scheduled_at) : new Date(b.scheduled_at.replace(' ', 'T'))
    return aDate - bDate
  })
})
</script>

<style scoped>
.enhanced-table {
  @apply overflow-x-auto rounded-lg shadow-sm border border-gray-200;
}

.enhanced-table table {
  @apply min-w-full divide-y divide-gray-200;
}

.enhanced-table thead {
  @apply bg-gray-50;
}

.enhanced-table th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.enhanced-table tbody {
  @apply bg-white divide-y divide-gray-100;
}

.enhanced-table td {
  @apply px-6 py-4 whitespace-nowrap;
}

.table-cell-primary {
  @apply text-sm font-medium text-gray-900;
}

.table-cell-secondary {
  @apply text-sm text-gray-500;
}

.loading-row td {
  @apply py-12;
}

.loading-content {
  @apply flex items-center justify-center gap-3 text-gray-500;
}

.loading-spinner {
  @apply w-5 h-5 animate-spin;
}

.empty-row td {
  @apply py-12;
}

.empty-content {
  @apply flex flex-col items-center justify-center gap-2 text-gray-400;
}

.empty-icon {
  @apply w-12 h-12 mb-2;
}

.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-badge.scheduled {
  @apply bg-blue-100 text-blue-800;
}

.status-badge.waiting {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.called {
  @apply bg-green-100 text-green-800;
}

.status-badge.completed {
  @apply bg-green-100 text-green-800;
}

.status-badge.cancelled {
  @apply bg-red-100 text-red-800;
}

.status-badge.expired {
  @apply bg-gray-100 text-gray-800;
}
</style> 