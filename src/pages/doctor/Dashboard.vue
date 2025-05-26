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
        <div class="overflow-x-auto rounded shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-if="loadingAppointments">
                <td :colspan="7" class="text-center py-8">Loading...</td>
              </tr>
              <tr v-else-if="appointments.length === 0">
                <td :colspan="7" class="text-center py-8 text-gray-400">No appointments found</td>
              </tr>
              <tr v-else v-for="appt in appointments" :key="appt.id">
                <td>{{ format(parseISO(appt.scheduled_at.replace(' ', 'T')), 'yyyy-MM-dd') }}</td>
                <td>{{ format(parseISO(appt.scheduled_at.replace(' ', 'T')), 'HH:mm') }}</td>
                <td>{{ appt.patient?.user?.name || '-' }}</td>
                <td>{{ appt.patient?.user?.email || '-' }}</td>
                <td>{{ appt.patient?.medical_record_number || '-' }}</td>
                <td><span :class="statusClass(appt.status)">{{ appt.status }}</span></td>
                <td>
                  <Button size="sm" variant="secondary" @click="showPatientModal(appt.patient)">Details</Button>
                  <Button size="sm" variant="success" v-if="appt.status === 'scheduled'">Start</Button>
                  <Button size="sm" variant="secondary" disabled v-else>Done</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <!-- Queue Table -->
      <Card title="Current Queue">
        <div class="overflow-x-auto rounded shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-if="loadingQueue">
                <td :colspan="6" class="text-center py-8">Loading...</td>
              </tr>
              <tr v-else-if="queue.length === 0">
                <td :colspan="6" class="text-center py-8 text-gray-400">No queue entries found</td>
              </tr>
              <tr v-else v-for="entry in queue" :key="entry.id">
                <td>{{ entry.position }}</td>
                <td>{{ entry.patient?.user?.name || '-' }}</td>
                <td>{{ entry.patient?.user?.email || '-' }}</td>
                <td>{{ entry.patient?.medical_record_number || '-' }}</td>
                <td><span :class="statusClass(entry.status)">{{ entry.status }}</span></td>
                <td>
                  <Button size="sm" variant="secondary" @click="showPatientModal(entry.patient)">Details</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    @click="handleCallPatient(entry)"
                    :disabled="entry.status !== 'waiting'"
                  >
                    Call
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <!-- Patient Details Modal -->
      <Modal :visible="!!selectedPatient" title="Patient Details" @close="closePatientModal">
        <div v-if="selectedPatient">
          <p><span class="font-bold">Name:</span> {{ selectedPatient.user?.name || '-' }}</p>
          <p><span class="font-bold">Email:</span> {{ selectedPatient.user?.email || '-' }}</p>
          <p><span class="font-bold">Medical Record #:</span> {{ selectedPatient.medical_record_number || '-' }}</p>
          <p><span class="font-bold">User ID:</span> {{ selectedPatient.user_id || '-' }}</p>
          <p><span class="font-bold">Patient ID:</span> {{ selectedPatient.id || '-' }}</p>
          <p><span class="font-bold">Created At:</span> {{ selectedPatient.created_at || '-' }}</p>
          <p><span class="font-bold">Updated At:</span> {{ selectedPatient.updated_at || '-' }}</p>
        </div>
        <template #actions>
          <Button @click="closePatientModal">Close</Button>
        </template>
      </Modal>
      <!-- Edit Availability Modal -->
      <Modal :visible="showAvailabilityModal" title="Edit Availability" @close="closeAvailabilityModal">
        <Notification v-if="availabilityError" type="error" :message="availabilityError" @close="availabilityError = ''" />
        <Notification v-if="availabilitySuccess" type="success" :message="availabilitySuccess" @close="availabilitySuccess = ''" />
        <div v-for="day in daysOfWeek" :key="day" class="mb-4">
          <div class="font-bold mb-2">{{ capitalize(day) }}</div>
          <div v-for="(range, idx) in tempAvailability[day]" :key="idx" class="flex items-center gap-2 mb-2">
            <TextInput v-model="tempAvailability[day][idx]" placeholder="e.g. 09:00-12:00" size="sm" />
            <Button size="sm" variant="danger" type="button" @click="removeRange(day, idx)">Remove</Button>
          </div>
          <Button size="sm" variant="success" type="button" @click="addRange(day)">Add Time Range</Button>
        </div>
        <template #actions>
          <Button variant="secondary" type="button" @click="closeAvailabilityModal">Cancel</Button>
          <Button variant="primary" type="submit" :loading="availabilityLoading" @click="saveAvailability">Save</Button>
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
import { format, parseISO } from 'date-fns'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import TextInput from '@/components/TextInput.vue'
import { useQueueEvents } from '@/utils/useQueueEvents'

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
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availabilitySuccess = ref('')

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

const parsedAvailabilityArray = computed(() => {
  if (!doctorInfo.value?.availability) return []
  try {
    const avail = JSON.parse(doctorInfo.value.availability)
    return Array.isArray(avail) ? avail : []
  } catch {
    return []
  }
})

function showPatientModal(patient) {
  selectedPatient.value = patient
}
function closePatientModal() {
  selectedPatient.value = null
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
    } catch (e) {
      console.error('[Doctor Dashboard] Error fetching queues:', e);
      queue.value = [];
    } finally {
      loadingQueue.value = false;
    }
  },
  { immediate: true }
);

function statusClass(status) {
  if (status === 'scheduled') return 'badge badge-info'
  if (status === 'completed') return 'badge badge-success'
  return 'badge'
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function openAvailabilityModal() {
  // Deep clone current availability or start empty
  tempAvailability.value = {}
  for (const day of daysOfWeek) {
    tempAvailability.value[day] = doctorInfo.value?.availability ? (JSON.parse(doctorInfo.value.availability)[day] || []) : []
    // Ensure it's an array
    if (!Array.isArray(tempAvailability.value[day])) tempAvailability.value[day] = []
  }
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
    const doctorId = userStore.user?.doctor_id
    if (!doctorId) throw new Error('No doctor ID')
    // Build payload: flatten tempAvailability into array of {day, start, end}
    const availabilityArr = []
    for (const day of daysOfWeek) {
      for (const range of tempAvailability.value[day]) {
        if (range && range.includes('-')) {
          const [start, end] = range.split('-').map(s => s.trim())
          if (start && end) {
            availabilityArr.push({ day: capitalize(day), start, end })
          }
        }
      }
    }
    await api.put(`/doctors/${doctorId}`, { availability: availabilityArr })
    availabilitySuccess.value = 'Availability updated!'
    // Update doctorInfo in UI
    doctorInfo.value.availability = JSON.stringify(availabilityArr)
    closeAvailabilityModal()
  } catch (e) {
    availabilityError.value = e.response?.data?.message || 'Failed to update availability.'
  } finally {
    availabilityLoading.value = false
  }
}

function handleCallPatient(queueEntry) {
  callPatient(queueEntry.id)
    .then(() => {
      // Optionally show a notification or update UI
    })
    .catch(() => {
      // Optionally handle error
    });
}

watchEffect(() => {
  if (userStore.ready && !userStore.user) {
    router.push('/login')
  }
})
</script>
