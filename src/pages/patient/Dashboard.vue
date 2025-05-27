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
      <Modal :visible="!!selectedDoctorForModal" title="Doctor Information" @close="closeDoctorModal">
        <div v-if="selectedDoctorForModal" class="doctor-info-modal">
          <!-- Basic Information Section -->
          <div class="doctor-info-section">
            <div class="doctor-info-item">
              <span class="doctor-info-label">Name</span>
              <span class="doctor-info-value">{{ selectedDoctorForModal.user?.name || 'Not provided' }}</span>
            </div>
            
            <div class="doctor-info-item">
              <span class="doctor-info-label">Email</span>
              <div class="contact-info">
                <svg class="contact-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span class="contact-info-value">{{ selectedDoctorForModal.user?.email || 'Not provided' }}</span>
              </div>
            </div>
            
            <div class="doctor-info-item">
              <span class="doctor-info-label">Specialization</span>
              <span class="doctor-info-value">{{ selectedDoctorForModal.specialization || 'General Practice' }}</span>
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
              <div v-if="!selectedDoctorForModal?.availability" class="doctor-availability-empty">
                No availability schedule set
              </div>
              <div v-else v-for="(slot, idx) in parseAvailabilityForModal(selectedDoctorForModal.availability)" :key="idx" class="doctor-availability-item">
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
      <Modal :visible="showBooking" title="Book Appointment" @close="closeBookingModal" size="large">
        <Notification v-if="bookingError" type="error" :message="bookingError" @close="bookingError = ''" />
        <Notification v-if="bookingSuccess" type="success" :message="bookingSuccess" @close="bookingSuccess = ''" />
        <div style="max-height: 70vh; overflow-y: auto;">
          <div v-if="fetchingDoctors" class="flex items-center justify-center py-8">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span class="text-blue-600 font-medium">Loading doctors...</span>
          </div>
          <div v-else class="space-y-6">
            <div>
              <Select
                v-model="selectedDoctorId"
                label="Select Doctor"
                :options="doctorOptions"
                placeholder="Choose your preferred doctor"
                @change="onDoctorChange"
                :disabled="fetchingDoctors || !doctorsLoaded"
              />
              <div v-if="selectedDoctor" class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ selectedDoctor.user?.name }}</h4>
                    <p class="text-sm text-gray-600">{{ selectedDoctor.specialization }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ selectedDoctor.user?.email }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Step 2: Select Date -->
            <div v-if="selectedDoctorId">
              <DatePicker
                v-model="selectedDate"
                label="Select Appointment Date"
                :available-dates="availableDays"
                :min-date="new Date()"
                @change="onDateChange"
                :disabled="fetchingDoctors || !doctorsLoaded || availableDays.length === 0"
              />
              
              <!-- Availability explanation -->
              <div v-if="selectedDoctor && parsedAvailabilityArray.length > 0" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-900">{{ selectedDoctor.user?.name }} is available on:</p>
                    <div class="mt-1 flex flex-wrap gap-2">
                      <span v-for="slot in parsedAvailabilityArray" :key="`${slot.day}-${slot.start}-${slot.end}`" 
                            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ slot.day }}s {{ slot.start }} - {{ slot.end }}
                      </span>
                    </div>
                    <p class="text-xs text-blue-700 mt-2">Green dates on the calendar show available appointments.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Select Time -->
            <div v-if="selectedDate">
              <TimeSlotPicker
                v-model="selectedSlot"
                label="Select Time Slot"
                :available-slots="availableSlots"
                @change="onTimeSlotChange"
              />
            </div>
            
            <!-- Booking Summary -->
            <div v-if="selectedDoctorId && selectedDate && selectedSlot" class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                Appointment Summary
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">Doctor</div>
                  <div class="text-sm font-medium text-blue-900">{{ selectedDoctor?.user?.name }}</div>
                  <div class="text-xs text-blue-700">{{ selectedDoctor?.specialization }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">Date</div>
                  <div class="text-sm font-medium text-blue-900">{{ formatDateTime(selectedDate, 'EEEE, MMMM d, yyyy') }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">Time</div>
                  <div class="text-sm font-medium text-blue-900">{{ formatTime(selectedSlot) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #actions>
          <Button variant="secondary" type="button" @click="closeBookingModal" :disabled="bookingLoading || fetchingDoctors">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="button" 
            :loading="bookingLoading" 
            :disabled="!selectedDoctorId || !selectedDate || !selectedSlot || bookingLoading || bookingRequestInProgress || fetchingDoctors" 
            @click="submitBooking"
          >
            {{ bookingLoading ? 'Booking...' : 'Confirm Appointment' }}
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
import DatePicker from '@/components/DatePicker.vue'
import TimeSlotPicker from '@/components/TimeSlotPicker.vue'

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

// Add booking request tracking
const bookingRequestInProgress = ref(false)
const lastBookingAttempt = ref(0)

// Cancel appointment state
const appointmentToCancel = ref(null)
const cancelLoading = ref(false)
const cancelSuccess = ref('')
const cancelError = ref('')
const cancellingAppointments = ref(new Set())

// Add flags to prevent duplicate calls
const fetchingDoctors = ref(false)
const fetchingAppointments = ref(false)
const doctorsLoaded = computed(() => doctors.value.length > 0 && !fetchingDoctors.value)

const patientInfo = computed(() => userStore.user)

const doctorOptions = computed(() => doctors.value.map(doc => ({ value: doc.id, label: `${doc.user?.name} (${doc.specialization})` })))

const selectedDoctor = computed(() => {
  if (!selectedDoctorId.value) return null
  return doctors.value.find(doc => doc.id === Number(selectedDoctorId.value))
})

const parsedAvailabilityArray = computed(() => {
  if (!selectedDoctor.value?.availability) return []
  try {
    const arr = JSON.parse(selectedDoctor.value.availability)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
})

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

function showDoctorModal(doctor) {
  selectedDoctorForModal.value = doctor
}

// Add the modal doctor ref
const selectedDoctorForModal = ref(null)

function closeDoctorModal() {
  selectedDoctorForModal.value = null
}

function parseAvailabilityForModal(availabilityString) {
  try {
    const arr = JSON.parse(availabilityString)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function openBookingModal() {
  showBooking.value = true;
  bookingError.value = '';
  bookingSuccess.value = '';
  selectedDoctorId.value = '';
  selectedDate.value = '';
  selectedSlot.value = '';
  availableDays.value = [];
  availableSlots.value = [];
  // Always fetch doctors when opening modal
  fetchDoctors();
}
function closeBookingModal() {
  showBooking.value = false;
  bookingRequestInProgress.value = false;
  lastBookingAttempt.value = 0;
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
  const doc = doctors.value.find(d => d.id === Number(selectedDoctorId.value))
  if (!doc) {
    availableDays.value = []
    console.log('No doctor found for selectedDoctorId:', selectedDoctorId.value)
    return
  }
  if (!doc.availability) {
    availableDays.value = []
    console.log('Selected doctor has no availability:', doc)
    return
  }
  let availArr = []
  try {
    availArr = JSON.parse(doc.availability)
  } catch {
    availArr = []
  }
  if (!Array.isArray(availArr) || availArr.length === 0) {
    availableDays.value = []
    console.log('Doctor availability array is empty or invalid:', availArr)
    return
  }
  const availableDaysOfWeek = new Set(
    availArr.map(a => a.day.toLowerCase())
  )
  const today = new Date()
  const days = []
  for (let i = 0; i < 90; i++) {
    const currentDate = addDays(today, i)
    const weekdayName = format(currentDate, 'EEEE').toLowerCase()
    if (availableDaysOfWeek.has(weekdayName)) {
      days.push(format(currentDate, 'yyyy-MM-dd'))
    }
  }
  availableDays.value = days
  console.log('Doctor availability:', doc.availability)
  console.log('Parsed availability array:', availArr)
  console.log('Available days calculated:', days)
}

function onTimeSlotChange() {
  // Additional logic when time slot changes if needed
  console.log('Time slot selected:', selectedSlot.value)
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
  const doc = doctors.value.find(d => d.id === Number(selectedDoctorId.value))
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
  if (!Array.isArray(availArr)) {
    availableSlots.value = []
    return
  }
  // Get weekday for selected date (case-insensitive)
  const selectedDateObj = parseISO(selectedDate.value)
  const weekdayName = format(selectedDateObj, 'EEEE').toLowerCase() // e.g., 'tuesday'
  // Get all availability entries for this weekday (case-insensitive)
  const dayAvailability = availArr.filter(a => 
    a.day && a.day.toLowerCase() === weekdayName
  )
  console.log('Selected date:', selectedDate.value, 'Weekday:', weekdayName)
  console.log('Day availability:', dayAvailability)
  const ranges = dayAvailability.map(a => `${a.start}-${a.end}`)
  console.log('Ranges:', ranges)
  if (dayAvailability.length === 0) {
    availableSlots.value = []
    return
  }
  // Get all time ranges for this weekday
  availableSlots.value = getTimeSlotsFromRanges(ranges)
  console.log('Generated time slots:', availableSlots.value)
}

async function submitBooking() {
  const now = Date.now();
  
  // Debounce: prevent requests within 2 seconds of each other
  if (now - lastBookingAttempt.value < 2000) {
    console.log('Booking request too soon after previous attempt, ignoring');
    return;
  }
  
  // Prevent duplicate booking requests
  if (bookingRequestInProgress.value || bookingLoading.value) {
    console.log('Booking request already in progress, ignoring duplicate call');
    return;
  }

  // Update last attempt timestamp
  lastBookingAttempt.value = now;

  // Validate required fields
  if (!selectedDoctorId.value || !selectedDate.value || !selectedSlot.value) {
    bookingError.value = 'Please select a doctor, date, and time slot.';
    return;
  }

  bookingError.value = '';
  bookingSuccess.value = '';
  bookingLoading.value = true;
  bookingRequestInProgress.value = true;

  try {
    const doctorId = selectedDoctorId.value;
    let dateStr = selectedDate.value;
    let timeStr = selectedSlot.value;
    
    // Trim values
    dateStr = dateStr ? dateStr.trim() : '';
    timeStr = timeStr ? timeStr.trim() : '';
    
    // Native JS date construction and formatting
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute, 0);
    const pad = n => n.toString().padStart(2, '0');
    const scheduled_at = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    
    if (isNaN(date.getTime())) {
      bookingError.value = 'Invalid date/time selected.';
      return;
    }

    console.log('Submitting booking request:', { doctorId, scheduled_at });

    // Make the API call
    const response = await api.post('/appointments', {
      doctor_id: doctorId,
      scheduled_at
    });

    console.log('Booking successful:', response.data);
    bookingSuccess.value = 'Appointment booked successfully!';
    
    // Close the modal immediately to prevent further attempts
    closeBookingModal();
    
    // Refresh data in the background
    const patientId = patientInfo.value?.patient?.id;
    if (patientId) {
      // Don't await these calls to avoid blocking the UI
      Promise.all([
        fetchAppointments(patientId),
        fetchQueue(patientId)
      ]).catch(e => {
        console.error('Error refreshing data after booking:', e);
      });
    }
  } catch (e) {
    console.error('Error booking appointment:', e);
    
    // Check for specific error types
    if (e.response?.status === 409) {
      bookingError.value = 'This time slot is no longer available. Please select a different time.';
    } else if (e.response?.status === 422) {
      // Handle validation errors
      let msg = e.response?.data?.message || 'Booking failed due to validation errors.';
      if (e.response?.data?.errors) {
        const errorList = Object.values(e.response.data.errors).flat();
        msg += ' ' + errorList.join(' ');
      }
      bookingError.value = msg;
    } else {
      // Generic error handling
      let msg = e.response?.data?.message || 'Booking failed. Please try again.';
      if (e.response?.data?.errors) {
        const errorList = Object.values(e.response.data.errors).flat();
        msg += ' ' + errorList.join(' ');
      }
      bookingError.value = msg;
    }
  } finally {
    bookingLoading.value = false;
    bookingRequestInProgress.value = false;
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
</script>