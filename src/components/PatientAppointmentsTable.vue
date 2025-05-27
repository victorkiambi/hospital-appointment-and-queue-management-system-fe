<template>
  <Card title="My Appointments">
    <div class="enhanced-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Status</th>
            <th class="table-actions">Actions</th>
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
                <span class="text-sm font-medium">Loading appointments...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="appointments.length === 0" class="empty-row">
            <td colspan="5">
              <div class="empty-content">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6m-6 0l.5-3h5l.5 3" />
                </svg>
                <p class="text-sm font-medium">No appointments scheduled</p>
                <p class="text-xs text-gray-400">Book your first appointment to get started</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="appt in sortedAppointments" :key="appt.id">
            <td>
              <div class="table-cell-primary">
                {{ formatDateTime(appt.scheduled_at, 'EEEE dd MMMM yyyy') }}
              </div>
            </td>
            <td>
              <div class="table-cell-secondary">
                {{ formatDateTime(appt.scheduled_at, 'h:mm a') }}
              </div>
            </td>
            <td>
              <div class="table-cell-primary">
                {{ appt.doctor?.user?.name || '-' }}
              </div>
              <div class="table-cell-secondary text-xs">
                {{ appt.doctor?.specialization || '' }}
              </div>
            </td>
            <td>
              <span :class="[getEnhancedStatusClass(appt.status), { 'expired-badge': isAppointmentExpired(appt) }]">
                <template v-if="isAppointmentExpired(appt)">
                  <span class="italic text-gray-400 bg-gray-100 px-2 py-1 rounded">Expired</span>
                </template>
                <template v-else>
                  {{ appt.status }}
                </template>
              </span>
            </td>
            <td class="table-actions">
              <div class="flex gap-2">
                <Button size="sm" variant="secondary" @click="$emit('show-doctor-modal', appt.doctor)">
                  Doctor Info
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  v-if="canCancelAppointment(appt, cancellingAppointments)"
                  :loading="cancellingAppointments.has(appt.id)"
                  :disabled="cancellingAppointments.has(appt.id)"
                  @click="$emit('cancel-appointment', appt, $event)"
                >
                  <template v-if="cancellingAppointments.has(appt.id)">
                    Cancelling...
                  </template>
                  <template v-else-if="isAppointmentExpired(appt)">
                    Remove
                  </template>
                  <template v-else>
                    Cancel
                  </template>
                </Button>
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
import Button from '@/components/Button.vue'
import { computed } from 'vue'
import { formatDateTime } from '@/utils/format'
import { getEnhancedStatusClass } from '@/pages/patient/status.js'
import { isAppointmentExpired, canCancelAppointment } from '@/pages/patient/appointments.js'

const props = defineProps({
  appointments: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  cancellingAppointments: { type: Object, default: () => new Set() }
})

const sortedAppointments = computed(() => {
  return [...props.appointments].sort((a, b) => {
    const aExpired = isAppointmentExpired(a)
    const bExpired = isAppointmentExpired(b)
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    const aDate = a.scheduled_at.includes('T') ? new Date(a.scheduled_at) : new Date(a.scheduled_at.replace(' ', 'T'))
    const bDate = b.scheduled_at.includes('T') ? new Date(b.scheduled_at) : new Date(b.scheduled_at.replace(' ', 'T'))
    return aDate - bDate
  })
})
</script> 