<template>
  <DoctorLayout>
    <div v-if="!userStore.ready" class="py-12 text-center text-gray-400">Loading dashboard...</div>
    <div v-else-if="!userStore.user" class="py-12 text-center text-gray-400">Redirecting...</div>
    <div v-else class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- Edit Availability Button -->
      <div class="flex justify-end" v-if="doctorInfo">
        <Button variant="secondary" @click="openAvailabilityModal">Edit Availability</Button>
      </div>
      <!-- Appointments Table -->
      <Card title="Today's Appointments">
        <div class="enhanced-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Contact</th>
                <th>Status</th>
                <th class="table-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingAppointments" class="loading-row">
                <td colspan="6">
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
                <td colspan="6">
                  <div class="empty-content">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6m-6 0l.5-3h5l.5 3" />
                    </svg>
                    <p class="text-sm font-medium">No appointments today</p>
                    <p class="text-xs text-gray-400">Your schedule is clear for today</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="appt in appointments" :key="appt.id">
                <td>
                  <div class="table-cell-primary">
                    {{ formatDateTime(appt.scheduled_at, 'dd MMM yyyy') }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-secondary font-mono">
                    {{ formatDateTime(appt.scheduled_at, 'HH:mm') }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-primary">
                    {{ appt.patient?.user?.name || '-' }}
                  </div>
                  <div class="table-cell-secondary text-xs">
                    MRN: {{ appt.patient?.medical_record_number || 'N/A' }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-secondary text-sm">
                    {{ appt.patient?.user?.email || '-' }}
                  </div>
                </td>
                <td>
                  <span :class="getEnhancedStatusClass(appt.status)">
                    {{ appt.status }}
                  </span>
                </td>
                <td class="table-actions">
                  <div>
                    <Button size="sm" variant="secondary" @click="showPatientModal(appt.patient)">
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <!-- Queue Table -->
      <Card title="Current Queue">
        <div class="enhanced-table">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Patient</th>
                <th>Contact</th>
                <th>MRN</th>
                <th>Status</th>
                <th class="table-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingQueue" class="loading-row">
                <td colspan="6">
                  <div class="loading-content">
                    <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span class="text-sm font-medium">Loading queue...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="queue.length === 0" class="empty-row">
                <td colspan="6">
                  <div class="empty-content">
                    <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p class="text-sm font-medium">No patients in queue</p>
                    <p class="text-xs text-gray-400">Queue is empty - patients will appear here when they join</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="entry in queue" :key="entry.id">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {{ entry.position }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="table-cell-primary">
                    {{ entry.patient?.user?.name || '-' }}
                  </div>
                  <div class="table-cell-secondary text-xs">
                    Patient ID: {{ entry.patient?.id || 'N/A' }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-secondary text-sm">
                    {{ entry.patient?.user?.email || '-' }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-secondary font-mono text-sm">
                    {{ entry.patient?.medical_record_number || '-' }}
                  </div>
                </td>
                <td>
                  <span :class="getEnhancedStatusClass(entry.status)">
                    {{ entry.status }}
                  </span>
                </td>
                <td class="table-actions">
                  <div>
                    <Button
                      size="sm"
                      variant="primary"
                      @click="handleCallPatient(entry)"
                      :disabled="entry.status !== 'waiting' || callingPatients.has(entry.id)"
                      :loading="callingPatients.has(entry.id)"
                    >
                      <template v-if="callingPatients.has(entry.id)">
                        Calling...
                      </template>
                      <template v-else>
                        {{ entry.status === 'waiting' ? 'Call Next' : 'Called' }}
                      </template>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <!-- Patient Details Modal - Simplified -->
      <Modal :visible="!!selectedPatient" title="Patient Information" @close="closePatientModal">
        <div v-if="selectedPatient" class="patient-modal-simple">
          <!-- Patient Header -->
          <div class="patient-header-simple">
            <div class="patient-avatar-simple">
              {{ getPatientInitials(selectedPatient.user?.name) }}
            </div>
            <div class="patient-info-simple">
              <h3 class="patient-name-simple">{{ selectedPatient.user?.name || 'Unknown Patient' }}</h3>
              <p class="patient-email-simple">{{ selectedPatient.user?.email || 'No email provided' }}</p>
            </div>
          </div>

          <!-- Patient Details -->
          <div class="patient-details-simple">
            <div class="detail-row">
              <span class="detail-label-simple">Medical Record Number</span>
              <span class="detail-value-simple">{{ selectedPatient.medical_record_number || 'Not assigned' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label-simple">Patient ID</span>
              <span class="detail-value-simple">{{ selectedPatient.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label-simple">Account Created</span>
              <span class="detail-value-simple">{{ formatDateTime(selectedPatient.created_at, 'PP') }}</span>
            </div>
          </div>
        </div>
        
        <template #actions>
          <Button variant="secondary" @click="closePatientModal">Close</Button>
        </template>
      </Modal>
      <!-- Call Patient Success/Error Notifications -->
      <Notification
        v-if="callPatientSuccess"
        type="success"
        :message="callPatientSuccess"
        @close="callPatientSuccess = ''"
      />
      <Notification
        v-if="callPatientError"
        type="error"
        :message="callPatientError"
        @close="callPatientError = ''"
      />
      
      <!-- Edit Availability Modal -->
      <Modal :visible="showAvailabilityModal" title="Edit Weekly Availability" @close="closeAvailabilityModal" size="large">
        <Notification v-if="availabilityError" type="error" :message="availabilityError" @close="availabilityError = ''" />
        <Notification v-if="availabilitySuccess" type="success" :message="availabilitySuccess" @close="availabilitySuccess = ''" />
        
        <div class="space-y-6">
          <!-- Instructions -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-blue-900">Set Your Working Hours</h4>
                <p class="text-sm text-blue-700 mt-1">Define when you're available for appointments. You can add multiple time slots per day.</p>
                <p class="text-xs text-blue-600 mt-2">Format: Use 24-hour time (e.g., 09:00-12:00, 14:00-17:00)</p>
              </div>
            </div>
          </div>

          <!-- Days Grid -->
          <div class="space-y-4">
            <div v-for="day in daysOfWeek" :key="day" class="availability-day-card">
              <!-- Day Header -->
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
                <Button 
                  size="sm" 
                  variant="secondary" 
                  @click="addRange(day)"
                  class="flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Hours
                </Button>
              </div>

              <!-- Time Slots -->
              <div class="space-y-2">
                <div v-if="tempAvailability[day]?.length === 0" class="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg class="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium">No working hours set</p>
                  <p class="text-xs">Click "Add Hours" to set your availability</p>
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
                    <Button 
                      size="sm" 
                      variant="danger" 
                      @click="removeRange(day, idx)"
                      class="flex items-center gap-1"
                    >
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

          <!-- Summary -->
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
          <Button variant="secondary" type="button" @click="closeAvailabilityModal" :disabled="availabilityLoading">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            :loading="availabilityLoading" 
            @click="saveAvailability"
            :disabled="!hasValidAvailability"
          >
            {{ availabilityLoading ? 'Saving...' : 'Save Availability' }}
          </Button>
        </template>
      </Modal>
    </div>
  </DoctorLayout>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import DoctorLayout from '../../layouts/DoctorLayout.vue'
import { useUserStore } from '../../store/user'
import { getAppointments, getQueues, callPatient } from '../../services/api'
import api from '../../services/api'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import TextInput from '@/components/TextInput.vue'
import { useQueueEvents } from '@/utils/useQueueEvents'
import { formatDateTime } from '@/utils/format'

useQueueEvents()

const appointments = ref([])
const queue = ref([])
const loadingAppointments = ref(true)
const loadingQueue = ref(true)
const userStore = useUserStore()
const router = useRouter()
const doctorInfo = computed(() => userStore.user?.doctor || {})
const selectedPatient = ref(null)
const showAvailabilityModal = ref(false)
const tempAvailability = ref({})
const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
]
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availabilitySuccess = ref('')

// Call patient state
const callingPatients = ref(new Set())
const callPatientError = ref('')
const callPatientSuccess = ref('')

const doctorId = computed(() => userStore.user?.doctor?.id)

const appointmentColumns = [
  { key: 'scheduled_at', label: 'Date' },
  { key: 'scheduled_at', label: 'Time' },
  { key: 'patient', label: 'Patient' },
  { key: 'email', label: 'Email' },
  { key: 'mrn', label: 'MRN' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action' }
]
const queueColumns = [
  { key: 'position', label: 'Position' },
  { key: 'patient', label: 'Patient' },
  { key: 'email', label: 'Email' },
  { key: 'mrn', label: 'MRN' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action' }
]

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

const parsedAvailabilityArray = computed(() => {
  return parseAvailability(doctorInfo.value?.availability)
})

function showPatientModal(patient) {
  selectedPatient.value = patient
}
function closePatientModal() {
  selectedPatient.value = null
}

function syncAppointmentsWithQueue() {
  queue.value.forEach(entry => {
    if (entry.appointment_id && entry.status === 'called') {
      const idx = appointments.value.findIndex(a => a.id === entry.appointment_id);
      if (idx !== -1) {
        appointments.value[idx].status = 'called';
      }
    }
  });
}

watch(
  () => [userStore.ready, doctorId.value],
  async ([ready, id]) => {
    console.log('[Doctor Dashboard] Watch triggered:', { ready, doctorId: id });
    if (!ready) return;
    if (!id) {
      loadingAppointments.value = false;
      loadingQueue.value = false;
      console.log('[Doctor Dashboard] No doctorId, skipping fetch.');
      return;
    }

    // Fetch appointments
    try {
      console.log('[Doctor Dashboard] Fetching appointments for doctorId:', id);
      const apptRes = await getAppointments({ doctorId: id });
      console.log('[Doctor Dashboard] Appointments API response:', apptRes.data);
      appointments.value = apptRes.data.data || [];
      // Optionally update doctorInfo from first appointment
      if (appointments.value.length > 0 && appointments.value[0].doctor) {
        doctorInfo.value = appointments.value[0].doctor
      }
    } catch (e) {
      console.error('[Doctor Dashboard] Error fetching appointments:', e);
      appointments.value = [];
    } finally {
      loadingAppointments.value = false;
    }

    // Fetch queue
    try {
      console.log('[Doctor Dashboard] Fetching queues for doctorId:', id);
      const queueRes = await getQueues({ doctorId: id });
      console.log('[Doctor Dashboard] Queues API response:', queueRes.data);
      queue.value = queueRes.data.data || [];
      // Sync appointment statuses with queue
      syncAppointmentsWithQueue();
    } catch (e) {
      console.error('[Doctor Dashboard] Error fetching queues:', e);
      queue.value = [];
    } finally {
      loadingQueue.value = false;
    }
  },
  { immediate: true }
);

function getEnhancedStatusClass(status) {
  const baseClass = 'status-badge'
  switch (status) {
    case 'scheduled': return `${baseClass} scheduled`
    case 'waiting': return `${baseClass} waiting`
    case 'called': return `${baseClass} called`
    case 'completed': return `${baseClass} completed`
    case 'cancelled': return `${baseClass} cancelled`
    case 'expired': return `${baseClass} cancelled` // Use same styling as cancelled
    default: return baseClass
  }
}

function getPatientInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function isValidTimeFormat(timeSlot) {
  if (!timeSlot || !timeSlot.trim()) return true // Empty is valid (will be filtered out)
  
  // Match format: HH:MM-HH:MM (e.g., 09:00-17:00)
  const timeRangeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  if (!timeRangeRegex.test(timeSlot.trim())) return false
  
  // Validate that start time is before end time
  const [start, end] = timeSlot.trim().split('-')
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return startMinutes < endMinutes
}

const hasValidAvailability = computed(() => {
  // Check if at least one day has valid time slots
  return daysOfWeek.some(day => 
    tempAvailability.value[day]?.some(slot => 
      slot.trim() && isValidTimeFormat(slot)
    )
  )
})

function openAvailabilityModal() {
  tempAvailability.value = {}
  let currentAvailability = []
  try {
    if (doctorInfo.value?.availability) {
      currentAvailability = parseAvailability(doctorInfo.value.availability)
    }
  } catch (e) {
    console.error('Error parsing current availability:', e)
    currentAvailability = []
  }
  for (const day of daysOfWeek) {
    const existingSlots = currentAvailability
      .filter(slot => slot.day && slot.day.toLowerCase() === day.toLowerCase())
      .map(slot => `${slot.start}-${slot.end}`)
    tempAvailability.value[day] = existingSlots.length > 0 ? [...existingSlots] : []
  }
  availabilityError.value = ''
  availabilitySuccess.value = ''
  showAvailabilityModal.value = true
}

function closeAvailabilityModal() {
  showAvailabilityModal.value = false
}

function addRange(day) {
  tempAvailability.value[day].push('')
}

function removeRange(day, idx) {
  tempAvailability.value[day].splice(idx, 1)
}

async function saveAvailability() {
  availabilityLoading.value = true
  availabilityError.value = ''
  availabilitySuccess.value = ''
  
  try {
    const doctorId = userStore.user?.doctor?.id
    if (!doctorId) throw new Error('No doctor ID found')
    
    // Build payload: flatten tempAvailability into array of {day, start, end}
    const availabilityArr = []
    const errors = []
    
    for (const day of daysOfWeek) {
      const daySlots = tempAvailability.value[day] || []
      
      for (const range of daySlots) {
        const trimmedRange = range.trim()
        if (!trimmedRange) continue // Skip empty slots
        
        if (!isValidTimeFormat(trimmedRange)) {
          errors.push(`Invalid time format for ${capitalize(day)}: "${trimmedRange}"`)
          continue
        }
        
        const [start, end] = trimmedRange.split('-').map(s => s.trim())
        if (start && end) {
          availabilityArr.push({ 
            day: capitalize(day), 
            start, 
            end 
          })
        }
      }
    }
    
    // Check for validation errors
    if (errors.length > 0) {
      availabilityError.value = errors.join('. ')
      return
    }
    
    // Check if we have at least some availability
    if (availabilityArr.length === 0) {
      availabilityError.value = 'Please set at least one time slot for your availability.'
      return
    }
    
    console.log('Saving availability:', availabilityArr)
    
    // Make API call
    await api.put(`/doctors/${doctorId}`, { availability: availabilityArr })
    
    // Update local doctor info
    if (doctorInfo.value) {
      doctorInfo.value.availability = JSON.stringify(availabilityArr)
    }
    
    availabilitySuccess.value = `Availability updated successfully! You now have ${availabilityArr.length} time slot${availabilityArr.length !== 1 ? 's' : ''} scheduled.`
    
    // Close modal after short delay to show success message
    setTimeout(() => {
      closeAvailabilityModal()
    }, 1500)
    
  } catch (e) {
    console.error('Error saving availability:', e)
    
    if (e.response?.status === 422) {
      // Handle validation errors from backend
      const backendErrors = e.response?.data?.errors
      if (backendErrors) {
        const errorMessages = Object.values(backendErrors).flat()
        availabilityError.value = errorMessages.join('. ')
      } else {
        availabilityError.value = e.response?.data?.message || 'Validation failed. Please check your input.'
      }
    } else if (e.response?.status === 404) {
      availabilityError.value = 'Doctor profile not found. Please refresh the page.'
    } else {
      availabilityError.value = e.response?.data?.message || 'Failed to update availability. Please try again.'
    }
  } finally {
    availabilityLoading.value = false
  }
}

async function handleCallPatient(queueEntry) {
  // Prevent duplicate calls
  if (callingPatients.value.has(queueEntry.id)) {
    console.log('Already calling patient, ignoring duplicate request')
    return
  }

  // Add loading state
  callingPatients.value.add(queueEntry.id)
  callPatientError.value = ''
  callPatientSuccess.value = ''

  try {
    console.log('Calling patient:', queueEntry.id)
    
    // Make API call
    await callPatient(queueEntry.id)
    
    // Show success notification
    callPatientSuccess.value = `Patient ${queueEntry.patient?.user?.name || 'Unknown'} has been called successfully!`
    
    // Optimistic update - update local queue state immediately
    const index = queue.value.findIndex(q => q.id === queueEntry.id)
    if (index !== -1) {
      queue.value[index].status = 'called'
      queue.value[index].called_at = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    
    console.log('Patient called successfully')
    
  } catch (error) {
    console.error('Error calling patient:', error)
    
    // Handle specific error types
    if (error.response?.status === 404) {
      callPatientError.value = 'Queue entry not found. Please refresh the page.'
    } else if (error.response?.status === 409) {
      callPatientError.value = 'Patient has already been called or queue entry is no longer valid.'
    } else if (error.response?.status === 422) {
      const errorMsg = error.response?.data?.message || 'Invalid request data.'
      callPatientError.value = errorMsg
    } else {
      callPatientError.value = 'Failed to call patient. Please try again.'
    }
    
    // If there was an error, revert any optimistic updates
    const index = queue.value.findIndex(q => q.id === queueEntry.id)
    if (index !== -1 && queue.value[index].status === 'called') {
      // Revert back to waiting if we optimistically updated it
      queue.value[index].status = 'waiting'
      queue.value[index].called_at = null
    }
    
  } finally {
    // Remove loading state
    callingPatients.value.delete(queueEntry.id)
    
    // Auto-clear success/error messages after 5 seconds
    if (callPatientSuccess.value) {
      setTimeout(() => { callPatientSuccess.value = '' }, 5000)
    }
    if (callPatientError.value) {
      setTimeout(() => { callPatientError.value = '' }, 8000)
    }
  }
}

watchEffect(() => {
  if (userStore.ready && !userStore.user) {
    router.push('/login')
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

.table-actions {
  @apply text-right;
}

.table-actions > div {
  @apply flex items-center justify-end gap-2;
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

/* Simplified Patient Modal Styles */
.patient-modal-simple {
  @apply space-y-6;
}

.patient-header-simple {
  @apply flex items-center gap-4 pb-4 border-b border-gray-200;
}

.patient-avatar-simple {
  @apply w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm;
}

.patient-info-simple {
  @apply flex-1;
}

.patient-name-simple {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.patient-email-simple {
  @apply text-sm text-gray-600;
}

.patient-details-simple {
  @apply space-y-4;
}

.detail-row {
  @apply flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0;
}

.detail-label-simple {
  @apply text-sm font-medium text-gray-600;
}

.detail-value-simple {
  @apply text-sm text-gray-900 font-medium;
}
</style>
