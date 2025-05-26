<template>
  <PatientLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- Book Appointment Button -->
      <div class="flex justify-end">
        <Button variant="primary" @click="openBookingModal">Book Appointment</Button>
      </div>
      <!-- Appointments Table -->
      <Card title="My Appointments">
        <div class="overflow-x-auto rounded shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-if="loadingAppointments">
                <td :colspan="5" class="text-center py-8">Loading...</td>
              </tr>
              <tr v-else-if="appointments.length === 0">
                <td :colspan="5" class="text-center py-8 text-gray-400">No appointments found</td>
              </tr>
              <tr v-else v-for="appt in appointments" :key="appt.id">
                <td>{{ format(parseISO(appt.scheduled_at.replace(' ', 'T')), 'yyyy-MM-dd') }}</td>
                <td>{{ format(parseISO(appt.scheduled_at.replace(' ', 'T')), 'HH:mm') }}</td>
                <td>{{ appt.doctor?.user?.name || '-' }}</td>
                <td><span :class="statusClass(appt.status)">{{ appt.status }}</span></td>
                <td>
                  <Button size="sm" variant="secondary" @click="showDoctorModal(appt.doctor)">Doctor</Button>
                  <Button size="sm" variant="danger" v-if="appt.status === 'scheduled'">Cancel</Button>
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
        <template #actions>
          <Button variant="secondary" type="button" @click="closeBookingModal">Cancel</Button>
          <Button variant="primary" type="submit" :loading="bookingLoading" :disabled="!selectedDoctorId || !selectedDate || !selectedSlot || bookingLoading" @click="submitBooking">
            Book
          </Button>
        </template>
      </Modal>
      <Notification
        v-if="calledNotification"
        type="info"
        :message="calledNotification"
        @close="calledNotification = ''"
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
import { format, addDays, parseISO } from 'date-fns'
import Card from '@/components/Card.vue'
import Table from '@/components/Table.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import Select from '@/components/Select.vue'
import { useQueueEvents } from '@/utils/useQueueEvents'

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
    // Refresh appointments
    const patientId = patientInfo.value?.patient?.id
    const apptRes = await getAppointments({ patientId })
    appointments.value = apptRes.data.data || []
    closeBookingModal()
  } catch (e) {
    bookingError.value = e.response?.data?.message || 'Booking failed.'
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

    // Fetch appointments
    try {
      console.log('[Patient Dashboard] Fetching appointments for patientId:', patientId);
      const apptRes = await getAppointments({ patientId });
      console.log('[Patient Dashboard] Appointments API response:', apptRes.data);
      appointments.value = apptRes.data.data || [];
    } catch (e) {
      console.error('[Patient Dashboard] Error fetching appointments:', e);
      appointments.value = [];
    } finally {
      loadingAppointments.value = false;
    }

    // Fetch queue
    try {
      console.log('[Patient Dashboard] Fetching queues for patientId:', patientId);
      const queueRes = await getQueues({ patientId });
      console.log('[Patient Dashboard] Queues API response:', queueRes.data);
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

function parseAvailabilityArray(availStr) {
  try {
    const arr = JSON.parse(availStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
</script>
