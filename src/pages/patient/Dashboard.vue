<template>
  <PatientLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- Book Appointment Button -->
      <div class="flex justify-end">
        <Button variant="primary" @click="openBookingModal">
          Book Appointment
        </Button>
      </div>
      <!-- Appointments Table -->
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
              <tr v-if="loadingAppointments" class="loading-row">
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
              <tr v-else v-for="appt in appointments" :key="appt.id">
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
                  <span :class="getEnhancedStatusClass(appt.status)">
                    {{ appt.status }}
                  </span>
                </td>
                <td class="table-actions">
                  <div class="flex gap-2">
                    <Button size="sm" variant="secondary" @click="showDoctorModal(appt.doctor)">
                      Doctor Info
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      v-if="appt.status === 'scheduled'"
                      :loading="cancellingAppointments.has(appt.id)"
                      :disabled="cancellingAppointments.has(appt.id)"
                      @click="cancelAppointment(appt)"
                    >
                      {{ cancellingAppointments.has(appt.id) ? 'Cancelling...' : 'Cancel' }}
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <!-- Queue Table -->
      <Card title="My Queue Entries">
        <Table
          :columns="queueColumns"
          :data="queueEntries"
          :loading="loadingQueue"
        >
          <template #doctor="{ row }">
            {{ row.doctor?.user?.name || '-' }}
          </template>
          <template #specialization="{ row }">
            {{ row.doctor?.specialization || '-' }}
          </template>
          <template #status="{ row }">
            <span :class="statusClass(row.status)">{{ row.status }}</span>
          </template>
          <template #availability="{ row }">
            <ul>
              <li v-for="(a, idx) in parseAvailabilityArray(row.doctor?.availability)" :key="idx">
                {{ a.day }}: {{ a.start }}-{{ a.end }}
              </li>
            </ul>
          </template>
        </Table>
      </Card>
      <!-- Doctor Details Modal -->
      <Modal :visible="!!selectedDoctor" title="Doctor Details" @close="closeDoctorModal">
        <div v-if="selectedDoctor">
          <p><span class="font-bold">Name:</span> {{ selectedDoctor.user?.name || '-' }}</p>
          <p><span class="font-bold">Email:</span> {{ selectedDoctor.user?.email || '-' }}</p>
          <p><span class="font-bold">Specialization:</span> {{ selectedDoctor.specialization || '-' }}</p>
          <p><span class="font-bold">Availability:</span></p>
          <ul class="list-disc ml-6">
            <li v-for="(slot, idx) in parsedAvailabilityArray" :key="idx">
              <span class="capitalize">{{ slot.day }}:</span> {{ slot.start }}-{{ slot.end }}
            </li>
          </ul>
        </div>
        <template #actions>
          <Button @click="closeDoctorModal">Close</Button>
        </template>
      </Modal>
      <!-- Booking Modal -->
      <Modal :visible="showBooking" title="Book Appointment" @close="closeBookingModal">
        <Notification v-if="bookingError" type="error" :message="bookingError" @close="bookingError = ''" />
        <Notification v-if="bookingSuccess" type="success" :message="bookingSuccess" @close="bookingSuccess = ''" />
        <Select
          v-model="selectedDoctorId"
          label="Doctor"
          :options="doctorOptions"
          placeholder="Select a doctor"
          @change="onDoctorChange"
        />
        <Select
          v-if="availableDays.length"
          v-model="selectedDate"
          label="Date"
          :options="dateOptions"
          placeholder="Select a date"
          @change="onDateChange"
        />
        <Select
          v-if="availableSlots.length"
          v-model="selectedSlot"
          label="Time Slot"
          :options="slotOptions"
          placeholder="Select a time slot"
        />
        <!-- Show formatted date and time if both are selected -->
        <div v-if="selectedDate && selectedSlot" class="my-4 p-3 bg-gray-50 rounded border flex flex-col gap-1">
          <div><span class="font-semibold">Selected Date:</span> {{ formatDateTime(selectedDate, 'EEEE dd MMMM yyyy') }}</div>
          <div><span class="font-semibold">Selected Time:</span> {{ formatDateTime(selectedDate + 'T' + selectedSlot, 'h:mm a') }}</div>
        </div>
        <template #actions>
          <Button variant="secondary" type="button" @click="closeBookingModal">Cancel</Button>
          <Button variant="primary" type="button" :loading="bookingLoading" :disabled="!selectedDoctorId || !selectedDate || !selectedSlot || bookingLoading" @click="submitBooking">
            Book
          </Button>
        </template>
      </Modal>
      <!-- Cancel Confirmation Modal -->
      <Modal :visible="!!appointmentToCancel" title="Cancel Appointment" @close="closeCancelModal">
        <div v-if="appointmentToCancel">
          <p class="mb-4">Are you sure you want to cancel this appointment?</p>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span class="font-semibold">Doctor:</span> {{ appointmentToCancel.doctor?.user?.name }}</p>
            <p><span class="font-semibold">Date:</span> {{ formatDateTime(appointmentToCancel.scheduled_at, 'EEEE dd MMMM yyyy') }}</p>
            <p><span class="font-semibold">Time:</span> {{ formatDateTime(appointmentToCancel.scheduled_at, 'h:mm a') }}</p>
          </div>
          <p class="text-sm text-gray-600 mt-4">This action cannot be undone.</p>
        </div>
        <template #actions>
          <Button variant="secondary" @click="closeCancelModal" :disabled="cancelLoading">
            Keep Appointment
          </Button>
          <Button 
            variant="danger" 
            @click="confirmCancelAppointment" 
            :loading="cancelLoading"
            :disabled="cancelLoading"
          >
            {{ cancelLoading ? 'Cancelling...' : 'Yes, Cancel Appointment' }}
          </Button>
        </template>
      </Modal>
      <Notification
        v-if="calledNotification"
        type="info"
        :message="calledNotification"
        @close="calledNotification = ''"
      />
      <!-- Cancel Success/Error Notifications -->
      <Notification
        v-if="cancelSuccess"
        type="success"
        :message="cancelSuccess"
        @close="cancelSuccess = ''"
      />
      <Notification
        v-if="cancelError"
        type="error"
        :message="cancelError"
        @close="cancelError = ''"
      />
    </div>
  </PatientLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import PatientLayout from '../../layouts/PatientLayout.vue'
import { useUserStore } from '../../store/user'
import { getAppointments, getQueues } from '../../services/api'
import api from '../../services/api'
import { addDays, format, parseISO } from 'date-fns'
import Card from '@/components/Card.vue'
import Table from '@/components/Table.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import Select from '@/components/Select.vue'
import { useQueueEvents } from '@/utils/useQueueEvents'
import { formatDateTime } from '@/utils/format'

const calledNotification = ref('')

useQueueEvents({
  onPatientCalled: (queueEntry) => {
    calledNotification.value = 'You have been called by the doctor!';
    setTimeout(() => { calledNotification.value = '' }, 5000)
  }
})

const appointments = ref([])
const queueEntries = ref([])
const loadingAppointments = ref(true)
const loadingQueue = ref(true)
const userStore = useUserStore()
const selectedDoctor = ref(null)
const showBooking = ref(false)
const doctors = ref([])
const selectedDoctorId = ref('')
const selectedDate = ref('')
const selectedSlot = ref('')
const availableDays = ref([])
const availableSlots = ref([])
const bookingLoading = ref(false)
const bookingError = ref('')
const bookingSuccess = ref('')

// Cancel appointment state
const appointmentToCancel = ref(null)
const cancelLoading = ref(false)
const cancelSuccess = ref('')
const cancelError = ref('')
const cancellingAppointments = ref(new Set())

// Add flags to prevent duplicate calls
const fetchingDoctors = ref(false)
const fetchingAppointments = ref(false)

const patientInfo = computed(() => userStore.user)

const appointmentColumns = [
  { key: 'scheduled_at', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action' }
]
const queueColumns = [
  { key: 'doctor', label: 'Doctor' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'position', label: 'Position' },
  { key: 'status', label: 'Status' },
  { key: 'availability', label: 'Availability' }
]
const doctorOptions = computed(() => doctors.value.map(doc => ({ value: doc.id, label: `${doc.user?.name} (${doc.specialization})` })))
const dateOptions = computed(() => availableDays.value.map(day => ({ value: day, label: day })))
const slotOptions = computed(() => availableSlots.value.map(slot => ({ value: slot, label: slot })))

const parsedAvailability = computed(() => {
  if (!selectedDoctor.value?.availability) return {}
  try {
    return JSON.parse(selectedDoctor.value.availability)
  } catch {
    return {}
  }
})

const appointmentsWithTime = computed(() =>
  appointments.value.map(appt => ({
    ...appt,
    time: appt.scheduled_at
  }))
)

const parsedAvailabilityArray = computed(() => {
  if (!selectedDoctor.value?.availability) return []
  try {
    const arr = JSON.parse(selectedDoctor.value.availability)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
})

function showDoctorModal(doctor) {
  selectedDoctor.value = doctor
}
function closeDoctorModal() {
  selectedDoctor.value = null
}

function openBookingModal() {
  console.log('openBookingModal called');
  showBooking.value = true;
  bookingError.value = '';
  bookingSuccess.value = '';
  selectedDoctorId.value = '';
  selectedDate.value = '';
  selectedSlot.value = '';
  availableDays.value = [];
  availableSlots.value = [];
  
  // Only fetch doctors if we don't have them already or if not currently fetching
  if (doctors.value.length === 0 && !fetchingDoctors.value) {
    fetchDoctors();
  }
}
function closeBookingModal() {
  showBooking.value = false
}

// Cancel appointment functions
function cancelAppointment(appointment, event) {
  // Prevent event propagation and default behavior
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Prevent duplicate calls if modal is already open
  if (appointmentToCancel.value?.id === appointment.id) {
    console.log('Cancel modal already open for this appointment, ignoring duplicate call');
    return;
  }
  
  console.log('Cancel appointment clicked:', appointment);
  appointmentToCancel.value = appointment;
  cancelError.value = '';
  cancelSuccess.value = '';
}

function closeCancelModal() {
  appointmentToCancel.value = null;
  cancelError.value = '';
}

async function fetchQueue(patientId) {
  loadingQueue.value = true;
  try {
    const queueRes = await getQueues({ patientId });
    queueEntries.value = queueRes.data.data || [];
  } catch (e) {
    console.error('[Patient Dashboard] Error fetching queues:', e);
    queueEntries.value = [];
  } finally {
    loadingQueue.value = false;
  }
}

async function confirmCancelAppointment() {
  if (!appointmentToCancel.value) return;
  const appointment = appointmentToCancel.value;
  cancelLoading.value = true;
  cancellingAppointments.value.add(appointment.id);
  try {
    console.log('Cancelling appointment:', appointment.id);
    await api.delete(`/appointments/${appointment.id}`);
    cancelSuccess.value = `Appointment with Dr. ${appointment.doctor?.user?.name} has been cancelled successfully.`;
    // Refresh appointments and queue
    const patientId = patientInfo.value?.patient?.id;
    if (patientId) {
      await fetchAppointments(patientId);
      await fetchQueue(patientId);
    }
    closeCancelModal();
  } catch (e) {
    console.error('Error cancelling appointment:', e);
    cancelError.value = 'Failed to cancel appointment. Please try again later.';
  } finally {
    cancelLoading.value = false;
    cancellingAppointments.value.delete(appointment.id);
  }
}

async function fetchDoctors() {
  if (fetchingDoctors.value) {
    console.log('Already fetching doctors, skipping...');
    return;
  }
  
  console.log('fetchDoctors called');
  fetchingDoctors.value = true;
  
  try {
    const res = await api.get('/doctors');
    doctors.value = res.data.data || [];
  } catch (e) {
    doctors.value = [];
  } finally {
    fetchingDoctors.value = false;
  }
}

async function fetchAppointments(patientId) {
  if (fetchingAppointments.value) {
    console.log('Already fetching appointments, skipping...');
    return;
  }
  
  fetchingAppointments.value = true;
  
  try {
    const apptRes = await getAppointments({ patientId });
    appointments.value = apptRes.data.data || [];
  } catch (e) {
    console.error('[Patient Dashboard] Error fetching appointments:', e);
    appointments.value = [];
  } finally {
    fetchingAppointments.value = false;
  }
}

function onDoctorChange() {
  selectedDate.value = ''
  selectedSlot.value = ''
  availableSlots.value = []
  const doc = doctors.value.find(d => d.id == selectedDoctorId.value)
  if (!doc?.availability) {
    availableDays.value = []
    return
  }
  // Parse availability as array of objects
  let availArr = []
  try {
    availArr = JSON.parse(doc.availability)
  } catch {
    availArr = []
  }
  // Get unique days from availability
  const daysSet = new Set(availArr.map(a => a.day))
  const today = new Date()
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i)
    const weekday = format(d, 'EEEE')
    if (daysSet.has(weekday)) {
      days.push(format(d, 'yyyy-MM-dd'))
    }
  }
  availableDays.value = days
}

function getTimeSlotsFromRanges(ranges) {
  // ranges: array of strings like ['09:00-12:00', ...]
  const slots = []
  for (const range of ranges) {
    const [start, end] = range.split('-')
    if (!start || !end) continue
    let [sh, sm] = start.split(':').map(Number)
    let [eh, em] = end.split(':').map(Number)
    let current = new Date(2000, 0, 1, sh, sm, 0)
    const endTime = new Date(2000, 0, 1, eh, em, 0)
    while (current < endTime) {
      slots.push(`${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`)
      current = new Date(current.getTime() + 30 * 60000) // add 30 minutes
    }
  }
  return slots
}

function onDateChange() {
  selectedSlot.value = ''
  const doc = doctors.value.find(d => d.id == selectedDoctorId.value)
  if (!doc?.availability || !selectedDate.value) {
    availableSlots.value = []
    return
  }
  let availArr = []
  try {
    availArr = JSON.parse(doc.availability)
  } catch {
    availArr = []
  }
  // Get weekday for selected date
  const weekday = format(parseISO(selectedDate.value), 'EEEE')
  // Get all ranges for this weekday
  const ranges = availArr.filter(a => a.day === weekday).map(a => `${a.start}-${a.end}`)
  availableSlots.value = getTimeSlotsFromRanges(ranges)
}

async function submitBooking() {
  bookingError.value = ''
  bookingSuccess.value = ''
  bookingLoading.value = true
  try {
    const doctorId = selectedDoctorId.value
    let dateStr = selectedDate.value
    let timeStr = selectedSlot.value
    // Trim values
    dateStr = dateStr ? dateStr.trim() : ''
    timeStr = timeStr ? timeStr.trim() : ''
    // Native JS date construction and formatting
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hour, minute] = timeStr.split(':').map(Number)
    const date = new Date(year, month - 1, day, hour, minute, 0)
    const pad = n => n.toString().padStart(2, '0')
    const scheduled_at = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    if (isNaN(date.getTime())) {
      bookingError.value = 'Invalid date/time selected.'
      bookingLoading.value = false
      return
    }
    await api.post('/appointments', {
      doctor_id: doctorId,
      scheduled_at
    })
    bookingSuccess.value = 'Appointment booked successfully!'
    // Refresh appointments and queue
    const patientId = patientInfo.value?.patient?.id
    if (patientId) {
      await fetchAppointments(patientId)
      await fetchQueue(patientId)
    }
    closeBookingModal()
  } catch (e) {
    // Enhanced error handling for API error structure
    let msg = e.response?.data?.message || 'Booking failed.'
    if (e.response?.data?.errors) {
      const errorList = Object.values(e.response.data.errors).flat()
      msg += ' ' + errorList.join(' ')
    }
    bookingError.value = msg
  } finally {
    bookingLoading.value = false
  }
}

watch(
  () => [userStore.ready, userStore.user?.patient?.id],
  async ([ready, patientId]) => {
    console.log('[Patient Dashboard] Watch triggered:', { ready, patientId });
    if (!ready) return;
    if (!patientId) {
      loadingAppointments.value = false;
      loadingQueue.value = false;
      console.log('[Patient Dashboard] No patientId, skipping fetch.');
      return;
    }

    // Fetch appointments using the new function with duplicate prevention
    loadingAppointments.value = true;
    await fetchAppointments(patientId);
    loadingAppointments.value = false;

    // Fetch queue
    try {
      const queueRes = await getQueues({ patientId });
      queueEntries.value = queueRes.data.data || [];
    } catch (e) {
      console.error('[Patient Dashboard] Error fetching queues:', e);
      queueEntries.value = [];
    } finally {
      loadingQueue.value = false;
    }
  },
  { immediate: true }
);

function statusClass(status) {
  if (status === 'scheduled' || status === 'waiting') return 'badge badge-info'
  if (status === 'completed' || status === 'called') return 'badge badge-success'
  return 'badge'
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

function parseAvailabilityArray(availStr) {
  try {
    const arr = JSON.parse(availStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
</script>