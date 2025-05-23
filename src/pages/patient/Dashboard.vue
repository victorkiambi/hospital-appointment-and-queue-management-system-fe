<template>
  <PatientLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- Book Appointment Button -->
      <div class="flex justify-end">
        <button class="btn btn-primary" @click="openBookingModal">Book Appointment</button>
      </div>
      <!-- Appointments Table -->
      <div class="card bg-base-100 shadow-xl w-full">
        <div class="card-body">
          <h2 class="card-title mb-4">My Appointments</h2>
          <div class="overflow-x-auto">
            <div v-if="loadingAppointments" class="flex justify-center items-center py-8">
              <span class="loading loading-spinner loading-md"></span>
            </div>
            <table v-else class="table table-zebra w-full min-w-[700px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appt in appointments" :key="appt.id">
                  <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[0] : '-' }}</td>
                  <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[1] : '-' }}</td>
                  <td>{{ appt.doctor?.user?.name || '-' }}</td>
                  <td>
                    <span :class="statusClass(appt.status)">{{ appt.status }}</span>
                  </td>
                  <td>
                    <button class="btn btn-xs btn-info mr-1" @click="showDoctorModal(appt.doctor)">Doctor</button>
                    <button class="btn btn-xs btn-error" v-if="appt.status === 'scheduled'">Cancel</button>
                  </td>
                </tr>
                <tr v-if="appointments.length === 0">
                  <td colspan="5" class="text-center text-gray-400">No appointments found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Queue Status -->
      <div class="card bg-base-100 shadow-xl w-full">
        <div class="card-body">
          <h2 class="card-title mb-4">My Queue Entries</h2>
          <div v-if="loadingQueue" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-md"></span>
          </div>
          <table v-else class="table table-zebra w-full min-w-[700px]">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Position</th>
                <th>Status</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in queueEntries" :key="entry.id">
                <td>{{ entry.doctor?.user?.name || '-' }}</td>
                <td>{{ entry.doctor?.specialization || '-' }}</td>
                <td>{{ entry.position }}</td>
                <td><span :class="statusClass(entry.status)">{{ entry.status }}</span></td>
                <td>
                  <ul>
                    <li v-for="(a, idx) in parseAvailabilityArray(entry.doctor?.availability)" :key="idx">
                      {{ a.day }}: {{ a.start }}-{{ a.end }}
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="queueEntries.length === 0">
                <td colspan="5" class="text-center text-gray-400">You are not currently in any queue</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Doctor Details Modal -->
      <dialog id="doctor-modal" class="modal" :open="!!selectedDoctor">
        <form method="dialog" class="modal-box">
          <h3 class="font-bold text-lg mb-2">Doctor Details</h3>
          <div v-if="selectedDoctor">
            <p><span class="font-bold">Name:</span> {{ selectedDoctor.user?.name || '-' }}</p>
            <p><span class="font-bold">Email:</span> {{ selectedDoctor.user?.email || '-' }}</p>
            <p><span class="font-bold">Specialization:</span> {{ selectedDoctor.specialization || '-' }}</p>
            <p><span class="font-bold">Availability:</span></p>
            <ul class="list-disc ml-6">
              <li v-for="(slots, day) in parsedAvailability" :key="day">
                <span class="capitalize">{{ day }}:</span> {{ slots.join(', ') }}
              </li>
            </ul>
          </div>
          <div class="modal-action">
            <button class="btn" @click="closeDoctorModal">Close</button>
          </div>
        </form>
      </dialog>
      <!-- Booking Modal -->
      <dialog id="booking-modal" class="modal" :open="showBooking">
        <form method="dialog" class="modal-box" @submit.prevent="submitBooking">
          <h3 class="font-bold text-lg mb-4">Book Appointment</h3>
          <div class="mb-4">
            <label class="label">Doctor</label>
            <select v-model="selectedDoctorId" class="select select-bordered w-full" @change="onDoctorChange">
              <option value="" disabled>Select a doctor</option>
              <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
                {{ doc.user?.name }} ({{ doc.specialization }})
              </option>
            </select>
          </div>
          <div class="mb-4" v-if="availableDays.length">
            <label class="label">Date</label>
            <select v-model="selectedDate" class="select select-bordered w-full" @change="onDateChange">
              <option value="" disabled>Select a date</option>
              <option v-for="day in availableDays" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
          <div class="mb-4" v-if="availableSlots.length">
            <label class="label">Time Slot</label>
            <select v-model="selectedSlot" class="select select-bordered w-full">
              <option value="" disabled>Select a time slot</option>
              <option v-for="slot in availableSlots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
          </div>
          <div v-if="bookingError" class="alert alert-error mb-2">{{ bookingError }}</div>
          <div v-if="bookingSuccess" class="alert alert-success mb-2">{{ bookingSuccess }}</div>
          <div class="modal-action">
            <button class="btn" type="button" @click="closeBookingModal">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="!selectedDoctorId || !selectedDate || !selectedSlot || bookingLoading">
              <span v-if="bookingLoading">Booking...</span>
              <span v-else>Book</span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  </PatientLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import PatientLayout from '../../layouts/PatientLayout.vue'
import { useUserStore } from '../../store/user'
import { getAppointments, getQueues } from '../../services/api'
import api from '../../services/api'
import { format, addDays, isAfter, isBefore, parseISO, parse } from 'date-fns'

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

const parsedAvailability = computed(() => {
  if (!selectedDoctor.value?.availability) return {}
  try {
    return JSON.parse(selectedDoctor.value.availability)
  } catch {
    return {}
  }
})

function showDoctorModal(doctor) {
  selectedDoctor.value = doctor
}
function closeDoctorModal() {
  selectedDoctor.value = null
}

function openBookingModal() {
  showBooking.value = true
  bookingError.value = ''
  bookingSuccess.value = ''
  selectedDoctorId.value = ''
  selectedDate.value = ''
  selectedSlot.value = ''
  availableDays.value = []
  availableSlots.value = []
  fetchDoctors()
}
function closeBookingModal() {
  showBooking.value = false
}

async function fetchDoctors() {
  try {
    const res = await api.get('/doctors')
    doctors.value = res.data.data || []
  } catch (e) {
    doctors.value = []
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
    console.log('submitBooking called')
    const doctorId = selectedDoctorId.value
    let dateStr = selectedDate.value
    let timeStr = selectedSlot.value
    // Trim values
    dateStr = dateStr ? dateStr.trim() : ''
    timeStr = timeStr ? timeStr.trim() : ''
    console.log('Raw dateStr:', dateStr, 'Raw timeStr:', timeStr)
    // Native JS date construction and formatting
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hour, minute] = timeStr.split(':').map(Number)
    const date = new Date(year, month - 1, day, hour, minute, 0)
    const pad = n => n.toString().padStart(2, '0')
    const scheduled_at = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    console.log('Constructed scheduled_at:', scheduled_at)
    if (isNaN(date.getTime())) {
      bookingError.value = 'Invalid date/time selected.'
      console.error('Invalid date object:', date)
      bookingLoading.value = false
      return
    }
    // Debug logs
    console.log('Booking payload (to be sent):', {
      doctor_id: doctorId,
      scheduled_at
    })
    const response = await api.post('/appointments', {
      doctor_id: doctorId,
      scheduled_at
    })
    console.log('Booking API response:', response)
    bookingSuccess.value = 'Appointment booked successfully!'
    // Refresh appointments
    const patientId = userStore.user?.patient_id
    const apptRes = await getAppointments({ patientId })
    appointments.value = apptRes.data.data || []
    closeBookingModal()
  } catch (e) {
    console.error('Booking API error:', e)
    bookingError.value = e.response?.data?.message || 'Booking failed.'
  } finally {
    bookingLoading.value = false
  }
}

onMounted(async () => {
  const patientId = userStore.user?.patient_id
  if (!patientId) return

  // Fetch appointments
  try {
    const apptRes = await getAppointments({ patientId })
    appointments.value = apptRes.data.data || []
  } catch (e) {
    appointments.value = []
  } finally {
    loadingAppointments.value = false
  }

  // Fetch queue (all entries for this patient)
  try {
    const queueRes = await getQueues({ patientId })
    // All queue entries for this patient
    queueEntries.value = queueRes.data.data || []
  } catch (e) {
    queueEntries.value = []
  } finally {
    loadingQueue.value = false
  }
})

function statusClass(status) {
  if (status === 'scheduled' || status === 'waiting') return 'badge badge-info'
  if (status === 'completed' || status === 'called') return 'badge badge-success'
  return 'badge'
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
