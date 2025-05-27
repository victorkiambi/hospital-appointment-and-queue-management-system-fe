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
      <PatientAppointmentsTable
        :appointments="appointments"
        :loading="loadingAppointments"
        :cancelling-appointments="cancellingAppointments"
        @show-doctor-modal="showDoctorModal"
        @cancel-appointment="cancelAppointment"
      />
      <!-- Queue Table -->
      <PatientQueueTable
        :queue-entries="queueEntries"
        :loading="loadingQueue"
        :appointments="appointments"
      />
      <!-- Doctor Details Modal -->
      <Modal :visible="!!selectedDoctor" title="Doctor Information" @close="closeDoctorModal">
        <div v-if="selectedDoctor" class="doctor-info-modal">
          <!-- Basic Information Section -->
          <div class="doctor-info-section">
            <div class="doctor-info-item">
              <span class="doctor-info-label">Name</span>
              <span class="doctor-info-value">{{ selectedDoctor.user?.name || 'Not provided' }}</span>
            </div>
            
            <div class="doctor-info-item">
              <span class="doctor-info-label">Email</span>
              <div class="contact-info">
                <svg class="contact-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span class="contact-info-value">{{ selectedDoctor.user?.email || 'Not provided' }}</span>
              </div>
            </div>
            
            <div class="doctor-info-item">
              <span class="doctor-info-label">Specialization</span>
              <span class="doctor-info-value">{{ selectedDoctor.specialization || 'General Practice' }}</span>
            </div>
            
            <div class="doctor-info-item">
              <span class="doctor-info-label">Status</span>
              <span class="modal-status-active">Active</span>
            </div>
          </div>

          <!-- Availability Section -->
          <div class="doctor-info-availability">
            <div class="doctor-info-availability-title">Weekly Schedule</div>
            <div class="doctor-availability-list">
              <div v-if="parsedAvailabilityArray.length === 0" class="doctor-availability-empty">
                No availability schedule set
              </div>
              <div v-else v-for="(slot, idx) in parsedAvailabilityArray" :key="idx" class="doctor-availability-item">
                <span class="doctor-availability-day">{{ slot.day }}</span>
                <span class="doctor-availability-time">{{ slot.start }} - {{ slot.end }}</span>
              </div>
            </div>
          </div>
        </div>
        <template #actions>
          <Button variant="secondary" @click="closeDoctorModal">Close</Button>
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
          <p class="mb-4">
            <template v-if="isAppointmentExpired(appointmentToCancel)">
              This appointment has already passed, but you can still cancel it to remove it from your records.
            </template>
            <template v-else>
              Are you sure you want to cancel this appointment?
            </template>
          </p>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span class="font-semibold">Doctor:</span> {{ appointmentToCancel.doctor?.user?.name }}</p>
            <p><span class="font-semibold">Date:</span> {{ formatDateTime(appointmentToCancel.scheduled_at, 'EEEE dd MMMM yyyy') }}</p>
            <p><span class="font-semibold">Time:</span> {{ formatDateTime(appointmentToCancel.scheduled_at, 'h:mm a') }}</p>
            <p v-if="isAppointmentExpired(appointmentToCancel)" class="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              ⚠️ This appointment was scheduled in the past
            </p>
          </div>
          <p class="text-sm text-gray-600 mt-4">This action cannot be undone.</p>
        </div>
        <template #actions>
          <Button variant="secondary" @click="closeCancelModal" :disabled="cancelLoading">
            <template v-if="isAppointmentExpired(appointmentToCancel)">
              Keep Record
            </template>
            <template v-else>
              Keep Appointment
            </template>
          </Button>
          <Button 
            variant="danger" 
            @click="confirmCancelAppointment" 
            :loading="cancelLoading"
            :disabled="cancelLoading || cancellingAppointments.has(appointmentToCancel?.id)"
          >
            <template v-if="cancelLoading">
              Cancelling...
            </template>
            <template v-else-if="isAppointmentExpired(appointmentToCancel)">
              Yes, Remove from Records
            </template>
            <template v-else>
              Yes, Cancel Appointment
            </template>
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
import { ref, computed, watch } from 'vue'
import PatientLayout from '../../layouts/PatientLayout.vue'
import { useUserStore } from '../../store/user'
import { getAppointments, getQueues } from '../../services/api'
import api from '../../services/api'
import { addDays, format, parseISO, isBefore } from 'date-fns'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import Select from '@/components/Select.vue'
import { useQueueEvents } from '@/utils/useQueueEvents'
import { formatDateTime } from '@/utils/format'
import PatientAppointmentsTable from '@/components/PatientAppointmentsTable.vue'
import PatientQueueTable from '@/components/PatientQueueTable.vue'

const calledNotification = ref('')

useQueueEvents({
  onPatientCalled: () => {
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
computed(() => {
  if (!selectedDoctor.value?.availability) return {}
  try {
    return JSON.parse(selectedDoctor.value.availability)
  } catch {
    return {}
  }
});
computed(() =>
    appointments.value.map(appt => ({
      ...appt,
      time: appt.scheduled_at
    }))
);
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
  
  // Check if appointment is already being cancelled
  if (cancellingAppointments.value.has(appointment.id)) {
    console.log('Appointment is already being cancelled, ignoring request');
    return;
  }
  
  // Prevent duplicate calls if modal is already open for this appointment
  if (appointmentToCancel.value?.id === appointment.id) {
    console.log('Cancel modal already open for this appointment, ignoring duplicate call');
    return;
  }
  
  // Prevent duplicate calls if modal is already open for any appointment
  if (appointmentToCancel.value && cancelLoading.value) {
    console.log('Cancel operation already in progress, ignoring request');
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

// Helper function to check if an appointment can be cancelled
function canCancelAppointment(appointment) {
  return (appointment.status === 'scheduled' || appointment.status === 'expired') && 
         appointment.status !== 'completed' && 
         appointment.status !== 'cancelled' && 
         !cancellingAppointments.value.has(appointment.id);
}

async function fetchQueue(patientId) {
  loadingQueue.value = true;
  try {
    const queueRes = await getQueues({ patientId });
    queueEntries.value = queueRes.data.data || [];
    
    // Check for expired queue entries and update them
    await updateExpiredQueueEntries();
  } catch (e) {
    console.error('[Patient Dashboard] Error fetching queues:', e);
    queueEntries.value = [];
  } finally {
    loadingQueue.value = false;
  }
}

// Function to update expired queue entries
async function updateExpiredQueueEntries() {
  const expiredQueueEntries = queueEntries.value.filter(entry => 
    (entry.status === 'waiting' || entry.status === 'scheduled') && isQueueEntryExpired(entry)
  );

  for (const entry of expiredQueueEntries) {
    try {
      console.log(`Updating expired queue entry ${entry.id} to expired status`);
      await api.put(`/queues/${entry.id}`, {
        status: 'expired'
      });
      
      // Update the local queue entry status
      const index = queueEntries.value.findIndex(q => q.id === entry.id);
      if (index !== -1) {
        queueEntries.value[index].status = 'expired';
      }
    } catch (e) {
      console.error(`Error updating queue entry ${entry.id} to expired:`, e);
    }
  }
}

async function confirmCancelAppointment() {
  if (!appointmentToCancel.value) return;
  
  const appointment = appointmentToCancel.value;
  const appointmentId = appointment.id;
  
  // Check if this appointment is already being cancelled
  if (cancellingAppointments.value.has(appointmentId)) {
    console.log('Appointment is already being cancelled, ignoring duplicate request');
    return;
  }
  
  // Set loading states immediately
  cancelLoading.value = true;
  cancellingAppointments.value.add(appointmentId);
  
  try {
    console.log('Cancelling appointment:', appointmentId);
    
    // Make the API call to cancel
    await api.delete(`/appointments/${appointmentId}`);
    
    // Update the local appointment status immediately to prevent further attempts
    const localIndex = appointments.value.findIndex(a => a.id === appointmentId);
    if (localIndex !== -1) {
      appointments.value[localIndex].status = 'cancelled';
    }
    
    cancelSuccess.value = `Appointment with Dr. ${appointment.doctor?.user?.name} has been cancelled successfully.`;
    
    // Close the modal immediately
    closeCancelModal();
    
    // Refresh data in the background
    const patientId = patientInfo.value?.patient?.id;
    if (patientId) {
      // Don't await these calls to avoid blocking the UI
      Promise.all([
        fetchAppointments(patientId),
        fetchQueue(patientId)
      ]).catch(e => {
        console.error('Error refreshing data after cancellation:', e);
      });
    }
  } catch (e) {
    console.error('Error cancelling appointment:', e);
    
    // Check if it's a conflict error (appointment already cancelled)
    if (e.response?.status === 409) {
      cancelError.value = 'This appointment has already been cancelled.';
      // Update local state to reflect the cancellation
      const localIndex = appointments.value.findIndex(a => a.id === appointmentId);
      if (localIndex !== -1) {
        appointments.value[localIndex].status = 'cancelled';
      }
      closeCancelModal();
    } else {
      cancelError.value = 'Failed to cancel appointment. Please try again later.';
    }
  } finally {
    cancelLoading.value = false;
    cancellingAppointments.value.delete(appointmentId);
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

// Function to check if an appointment is in the past
function isAppointmentExpired(appt) {
  // Only mark as expired if not completed or cancelled
  if (appt.status === 'completed' || appt.status === 'cancelled') return false;
  // Parse the appointment date
  let apptDate;
  try {
    apptDate = appt.scheduled_at.includes('T') ? parseISO(appt.scheduled_at) : parseISO(appt.scheduled_at.replace(' ', 'T'));
  } catch {
    return false;
  }
  // Compare to now
  return isBefore(apptDate, new Date());
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
      
      // Check for expired queue entries and update them
      await updateExpiredQueueEntries();
    } catch (e) {
      console.error('[Patient Dashboard] Error fetching queues:', e);
      queueEntries.value = [];
    } finally {
      loadingQueue.value = false;
    }
  },
  { immediate: true }
);
function parseAvailabilityArray(availStr) {
  try {
    const arr = JSON.parse(availStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
computed(() => {
  // Non-expired first, then expired, each group sorted by scheduled_at ascending
  return [...appointments.value].sort((a, b) => {
    const aExpired = isAppointmentExpired(a)
    const bExpired = isAppointmentExpired(b)
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    // If both are same (expired or not), sort by scheduled_at
    const aDate = a.scheduled_at.includes('T') ? parseISO(a.scheduled_at) : parseISO(a.scheduled_at.replace(' ', 'T'))
    const bDate = b.scheduled_at.includes('T') ? parseISO(b.scheduled_at) : parseISO(b.scheduled_at.replace(' ', 'T'))
    return aDate - bDate
  })
});
function isQueueEntryExpired(entry) {
  // Only mark as expired if not completed or cancelled
  if (entry.status === 'completed' || entry.status === 'cancelled') return false;

  // If queue entry is associated with an appointment, check if that appointment is expired
  if (entry.appointment_id) {
    const associatedAppointment = appointments.value.find(appt => appt.id === entry.appointment_id);
    if (associatedAppointment) {
      const expired = isAppointmentExpired(associatedAppointment);
      console.debug(`[isQueueEntryExpired] Entry ${entry.id} uses appointment ${associatedAppointment.id}: expired=${expired}`);
      return expired;
    }
  }

  // Check if queue entry has a scheduled_at field
  if (entry.scheduled_at) {
    let entryDate;
    try {
      entryDate = entry.scheduled_at.includes('T') ? parseISO(entry.scheduled_at) : parseISO(entry.scheduled_at.replace(' ', 'T'));
      const expired = isBefore(entryDate, new Date());
      console.debug(`[isQueueEntryExpired] Entry ${entry.id} uses scheduled_at: expired=${expired}`);
      return expired;
    } catch {
      // If scheduled_at parsing fails, continue to other checks
    }
  }

  // Check if queue entry has a created_at field and is older than 1 day
  if (entry.created_at) {
    let createdDate;
    try {
      createdDate = entry.created_at.includes('T') ? parseISO(entry.created_at) : parseISO(entry.created_at.replace(' ', 'T'));
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const expired = isBefore(createdDate, oneDayAgo);
      console.debug(`[isQueueEntryExpired] Entry ${entry.id} uses created_at: expired=${expired}`);
      return expired;
    } catch {
      // If created_at parsing fails, continue
    }
  }

  console.debug(`[isQueueEntryExpired] Entry ${entry.id} not expired by any rule`);
  return false;
}
computed(() => {
  return [...queueEntries.value].sort((a, b) => {
    const aExpired = isQueueEntryExpired(a)
    const bExpired = isQueueEntryExpired(b)
    if (aExpired && !bExpired) return 1
    if (!aExpired && bExpired) return -1
    // If both are same (expired or not), sort by scheduled_at
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    const aDate = a.scheduled_at.includes('T') ? parseISO(a.scheduled_at) : parseISO(a.scheduled_at.replace(' ', 'T'))
    const bDate = b.scheduled_at.includes('T') ? parseISO(b.scheduled_at) : parseISO(b.scheduled_at.replace(' ', 'T'))
    return aDate - bDate
  })
});
</script>