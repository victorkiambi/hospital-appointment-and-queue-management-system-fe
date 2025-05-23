<template>
  <DoctorLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- Edit Availability Button -->
      <div class="flex justify-end" v-if="doctorInfo">
        <button class="btn btn-secondary" @click="openAvailabilityModal">Edit Availability</button>
      </div>
      <!-- Doctor Info Card -->
      <div v-if="doctorInfo" class="card bg-primary text-primary-content shadow-xl mb-8 w-full">
        <div class="card-body">
          <h2 class="card-title text-2xl">Dr. {{ doctorInfo.user?.name || '-' }}</h2>
          <p><span class="font-bold">Specialization:</span> {{ doctorInfo.specialization || '-' }}</p>
          <div>
            <span class="font-bold">Availability:</span>
            <ul class="list-disc ml-6">
              <li v-for="(entry, idx) in parsedAvailabilityArray" :key="idx">
                <span class="capitalize">{{ entry.day }}:</span> {{ entry.start }}-{{ entry.end }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- Appointments and Queue Panels -->
      <div class="flex flex-col gap-8 w-full">
        <!-- Appointments Table -->
        <div class="card bg-base-100 shadow-xl w-full">
          <div class="card-body">
            <h2 class="card-title mb-4">Today's Appointments</h2>
            <div class="overflow-x-auto">
              <div v-if="loadingAppointments" class="flex justify-center items-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </div>
              <table v-else class="table table-zebra w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>MRN</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appt in appointments" :key="appt.id">
                    <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[0] : '-' }}</td>
                    <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[1] : '-' }}</td>
                    <td>{{ appt.patient?.user?.name || '-' }}</td>
                    <td>{{ appt.patient?.user?.email || '-' }}</td>
                    <td>{{ appt.patient?.medical_record_number || '-' }}</td>
                    <td>
                      <span :class="statusClass(appt.status)">{{ appt.status }}</span>
                    </td>
                    <td>
                      <button class="btn btn-xs btn-info mr-1" @click="showPatientModal(appt.patient)">Details</button>
                      <button class="btn btn-xs btn-success" v-if="appt.status === 'scheduled'">Start</button>
                      <button class="btn btn-xs btn-disabled" v-else disabled>Done</button>
                    </td>
                  </tr>
                  <tr v-if="appointments.length === 0">
                    <td colspan="7" class="text-center text-gray-400">No appointments found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Queue Panel -->
        <div class="card bg-base-100 shadow-xl w-full">
          <div class="card-body">
            <h2 class="card-title mb-4">Current Queue</h2>
            <div class="overflow-x-auto">
              <div v-if="loadingQueue" class="flex justify-center items-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </div>
              <table v-else class="table table-zebra w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th class="px-4 py-2">Position</th>
                    <th class="px-4 py-2">Patient</th>
                    <th class="px-4 py-2">Email</th>
                    <th class="px-4 py-2">MRN</th>
                    <th class="px-4 py-2">Status</th>
                    <th class="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in queue" :key="entry.id">
                    <td class="px-4 py-2">{{ entry.position }}</td>
                    <td class="px-4 py-2">{{ entry.patient?.user?.name || '-' }}</td>
                    <td class="px-4 py-2">{{ entry.patient?.user?.email || '-' }}</td>
                    <td class="px-4 py-2">{{ entry.patient?.medical_record_number || '-' }}</td>
                    <td class="px-4 py-2">
                      <span :class="statusClass(entry.status)">{{ entry.status }}</span>
                    </td>
                    <td class="px-4 py-2">
                      <button class="btn btn-xs btn-info mr-1" @click="showPatientModal(entry.patient)">Details</button>
                      <button class="btn btn-xs btn-primary">Call</button>
                    </td>
                  </tr>
                  <tr v-if="queue.length === 0">
                    <td colspan="6" class="text-center text-gray-400">No patients in queue</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- Patient Details Modal -->
      <dialog id="patient-modal" class="modal" :open="!!selectedPatient">
        <form method="dialog" class="modal-box">
          <h3 class="font-bold text-lg mb-2">Patient Details</h3>
          <div v-if="selectedPatient">
            <p><span class="font-bold">Name:</span> {{ selectedPatient.user?.name || '-' }}</p>
            <p><span class="font-bold">Email:</span> {{ selectedPatient.user?.email || '-' }}</p>
            <p><span class="font-bold">Medical Record #:</span> {{ selectedPatient.medical_record_number || '-' }}</p>
            <p><span class="font-bold">User ID:</span> {{ selectedPatient.user_id || '-' }}</p>
            <p><span class="font-bold">Patient ID:</span> {{ selectedPatient.id || '-' }}</p>
            <p><span class="font-bold">Created At:</span> {{ selectedPatient.created_at || '-' }}</p>
            <p><span class="font-bold">Updated At:</span> {{ selectedPatient.updated_at || '-' }}</p>
          </div>
          <div class="modal-action">
            <button class="btn" @click="closePatientModal">Close</button>
          </div>
        </form>
      </dialog>
      <!-- Edit Availability Modal -->
      <dialog id="availability-modal" class="modal" :open="showAvailabilityModal">
        <form method="dialog" class="modal-box" @submit.prevent="saveAvailability">
          <h3 class="font-bold text-lg mb-4">Edit Availability</h3>
          <div v-if="availabilityError" class="alert alert-error mb-2">{{ availabilityError }}</div>
          <div v-if="availabilitySuccess" class="alert alert-success mb-2">{{ availabilitySuccess }}</div>
          <div v-for="day in daysOfWeek" :key="day" class="mb-4">
            <div class="font-bold mb-2">{{ capitalize(day) }}</div>
            <div v-for="(range, idx) in tempAvailability[day]" :key="idx" class="flex items-center gap-2 mb-2">
              <input v-model="tempAvailability[day][idx]" class="input input-bordered input-sm w-40" placeholder="e.g. 09:00-12:00" />
              <button class="btn btn-xs btn-error" type="button" @click="removeRange(day, idx)">Remove</button>
            </div>
            <button class="btn btn-xs btn-success" type="button" @click="addRange(day)">Add Time Range</button>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" @click="closeAvailabilityModal">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="availabilityLoading">Save</button>
          </div>
        </form>
      </dialog>
    </div>
  </DoctorLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DoctorLayout from '../../layouts/DoctorLayout.vue'
import { useUserStore } from '../../store/user'
import { getAppointments, getQueues } from '../../services/api'
import api from '../../services/api'

const appointments = ref([])
const queue = ref([])
const loadingAppointments = ref(true)
const loadingQueue = ref(true)
const userStore = useUserStore()
const doctorInfo = ref(null)
const selectedPatient = ref(null)
const showAvailabilityModal = ref(false)
const tempAvailability = ref({})
const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availabilitySuccess = ref('')

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

onMounted(async () => {
  const doctorId = userStore.user?.doctor_id
  if (!doctorId) return

  // Fetch appointments
  try {
    const apptRes = await getAppointments({ doctorId })
    appointments.value = apptRes.data.data || []
    // Set doctor info from first appointment if available
    if (appointments.value.length > 0 && appointments.value[0].doctor) {
      doctorInfo.value = appointments.value[0].doctor
    }
  } catch (e) {
    appointments.value = []
  } finally {
    loadingAppointments.value = false
  }

  // Fetch queue
  try {
    const queueRes = await getQueues({ doctorId })
    queue.value = queueRes.data.data || []
  } catch (e) {
    queue.value = []
  } finally {
    loadingQueue.value = false
  }
})

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
</script>
