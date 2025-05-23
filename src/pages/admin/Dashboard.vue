<template>
  <AdminLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- System Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div v-if="loadingStats" class="col-span-5 flex justify-center items-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <template v-else>
          <div class="stat bg-primary text-primary-content">
            <div class="stat-title">Total Users</div>
            <div class="stat-value">{{ stats.total_users }}</div>
          </div>
          <div class="stat bg-secondary text-secondary-content">
            <div class="stat-title">Doctors</div>
            <div class="stat-value">{{ stats.total_doctors }}</div>
          </div>
          <div class="stat bg-accent text-accent-content">
            <div class="stat-title">Patients</div>
            <div class="stat-value">{{ stats.total_patients }}</div>
          </div>
          <div class="stat bg-info text-info-content">
            <div class="stat-title">Appointments</div>
            <div class="stat-value">{{ stats.total_appointments }}</div>
          </div>
          <div class="stat bg-warning text-warning-content">
            <div class="stat-title">Queues</div>
            <div class="stat-value">{{ stats.total_queues }}</div>
          </div>
        </template>
      </div>
      <!-- Users Table -->
      <div class="card bg-base-100 shadow-xl w-full">
        <div class="card-body">
          <div class="flex justify-between items-center mb-2">
            <h2 class="card-title">Users</h2>
            <div class="flex gap-2">
              <select v-model="userRoleFilter" class="select select-bordered w-40">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
              <button class="btn btn-success btn-sm" @click="openCreateDoctorModal">+ Doctor</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <div v-if="loadingUsers" class="flex justify-center items-center py-8">
              <span class="loading loading-spinner loading-md"></span>
            </div>
            <table v-else class="table table-zebra w-full min-w-[700px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role }}</td>
                  <td>
                    <button class="btn btn-xs btn-info" @click="showUserModal(user)">Details</button>
                  </td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="4" class="text-center text-gray-400">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Appointments Table -->
      <div class="card bg-base-100 shadow-xl w-full">
        <div class="card-body">
          <h2 class="card-title mb-4">Appointments</h2>
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
                  <th>Patient</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appt in appointments" :key="appt.id">
                  <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[0] : '-' }}</td>
                  <td>{{ appt.scheduled_at ? appt.scheduled_at.split(' ')[1] : '-' }}</td>
                  <td>{{ appt.doctor?.user?.name || '-' }}</td>
                  <td>{{ appt.patient?.user?.name || '-' }}</td>
                  <td><span :class="statusClass(appt.status)">{{ appt.status }}</span></td>
                </tr>
                <tr v-if="appointments.length === 0">
                  <td colspan="5" class="text-center text-gray-400">No appointments found</td>
                </tr>
              </tbody>
            </table>
            <!-- Pagination Controls -->
            <div v-if="appointmentsMeta.last_page > 1" class="flex justify-center mt-4 gap-2">
              <button class="btn btn-xs" :disabled="appointmentsPage === 1" @click="goToAppointmentsPage(appointmentsPage - 1)">Prev</button>
              <button v-for="page in appointmentsMeta.last_page" :key="page" class="btn btn-xs" :class="{ 'btn-active': page === appointmentsPage }" @click="goToAppointmentsPage(page)">{{ page }}</button>
              <button class="btn btn-xs" :disabled="appointmentsPage === appointmentsMeta.last_page" @click="goToAppointmentsPage(appointmentsPage + 1)">Next</button>
            </div>
          </div>
        </div>
      </div>
      <!-- User Details Modal -->
      <dialog id="user-modal" class="modal" :open="!!selectedUser">
        <form method="dialog" class="modal-box">
          <h3 class="font-bold text-lg mb-2">User Details</h3>
          <div v-if="selectedUser">
            <p><span class="font-bold">Name:</span> {{ selectedUser.name }}</p>
            <p><span class="font-bold">Email:</span> {{ selectedUser.email }}</p>
            <p><span class="font-bold">Role:</span> {{ selectedUser.role }}</p>
            <p v-if="selectedUser.specialization"><span class="font-bold">Specialization:</span> {{ selectedUser.specialization }}</p>
            <p v-if="selectedUser.medical_record_number"><span class="font-bold">MRN:</span> {{ selectedUser.medical_record_number }}</p>
          </div>
          <div class="modal-action">
            <button class="btn" @click="closeUserModal">Close</button>
          </div>
        </form>
      </dialog>
      <!-- Create Doctor Modal -->
      <dialog id="create-doctor-modal" class="modal" :open="showCreateDoctorModal">
        <form method="dialog" class="modal-box" @submit.prevent="submitCreateDoctor">
          <h3 class="font-bold text-lg mb-4">Create Doctor</h3>
          <div v-if="createDoctorError" class="alert alert-error mb-2">{{ createDoctorError }}</div>
          <div v-if="createDoctorSuccess" class="alert alert-success mb-2">{{ createDoctorSuccess }}</div>
          <div class="mb-2">
            <label class="label">Name</label>
            <input v-model="createDoctorForm.name" class="input input-bordered w-full" required />
          </div>
          <div class="mb-2">
            <label class="label">Email</label>
            <input v-model="createDoctorForm.email" class="input input-bordered w-full" type="email" required />
          </div>
          <div class="mb-2">
            <label class="label">Password</label>
            <input v-model="createDoctorForm.password" class="input input-bordered w-full" type="password" required />
          </div>
          <div class="mb-2">
            <label class="label">Specialization</label>
            <input v-model="createDoctorForm.specialization" class="input input-bordered w-full" required />
          </div>
          <div class="mb-2">
            <label class="label">Availability</label>
            <div class="border rounded p-2 bg-base-200">
              <div v-for="day in daysOfWeek" :key="day" class="mb-2">
                <div class="font-bold mb-1">{{ day }}</div>
                <div v-for="(range, idx) in tempAvailability[day]" :key="idx" class="flex items-center gap-2 mb-1">
                  <input type="time" v-model="tempAvailability[day][idx].start" class="input input-bordered input-sm w-28" required />
                  <span>-</span>
                  <input type="time" v-model="tempAvailability[day][idx].end" class="input input-bordered input-sm w-28" required />
                  <button class="btn btn-xs btn-error" type="button" @click="removeAvailabilityRange(day, idx)">Remove</button>
                </div>
                <button class="btn btn-xs btn-success" type="button" @click="addAvailabilityRange(day)">Add Time Range</button>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" @click="closeCreateDoctorModal">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="createDoctorLoading">
              <span v-if="createDoctorLoading">Creating...</span>
              <span v-else>Create</span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { getUsers, getAppointments, getStats, createDoctor } from '../../services/api'

const stats = ref({ total_users: 0, total_doctors: 0, total_patients: 0, total_appointments: 0, total_queues: 0 })
const users = ref([])
const appointments = ref([])
const appointmentsMeta = ref({ total: 0, per_page: 20, current_page: 1, last_page: 1 })
const appointmentsPage = ref(1)
const userRoleFilter = ref('')
const selectedUser = ref(null)
const loadingStats = ref(true)
const loadingUsers = ref(true)
const loadingAppointments = ref(true)
const showCreateDoctorModal = ref(false)
const createDoctorForm = ref({ name: '', email: '', password: '', specialization: '' })
const createDoctorLoading = ref(false)
const createDoctorError = ref('')
const createDoctorSuccess = ref('')

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]
const tempAvailability = ref({})

onMounted(async () => {
  // Fetch stats
  try {
    loadingStats.value = true
    const res = await getStats()
    stats.value = res.data.data || { total_users: 0, total_doctors: 0, total_patients: 0, total_appointments: 0, total_queues: 0 }
  } catch (e) {
    stats.value = { total_users: 0, total_doctors: 0, total_patients: 0, total_appointments: 0, total_queues: 0 }
  } finally {
    loadingStats.value = false
  }
  // Fetch users
  try {
    loadingUsers.value = true
    const res = await getUsers()
    users.value = res.data.data || []
  } catch (e) {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
  // Fetch appointments
  await fetchAppointments()
})

async function fetchAppointments(page = 1) {
  try {
    loadingAppointments.value = true
    const res = await getAppointments({ page })
    appointments.value = res.data.data || []
    appointmentsMeta.value = res.data.meta || { total: 0, per_page: 20, current_page: 1, last_page: 1 }
    appointmentsPage.value = appointmentsMeta.value.current_page
  } catch (e) {
    appointments.value = []
    appointmentsMeta.value = { total: 0, per_page: 20, current_page: 1, last_page: 1 }
  } finally {
    loadingAppointments.value = false
  }
}

function goToAppointmentsPage(page) {
  if (page < 1 || page > appointmentsMeta.value.last_page) return
  fetchAppointments(page)
}

const filteredUsers = computed(() => {
  if (!userRoleFilter.value) return users.value
  return users.value.filter(u => u.role === userRoleFilter.value)
})

function showUserModal(user) {
  selectedUser.value = user
}
function closeUserModal() {
  selectedUser.value = null
}
function statusClass(status) {
  if (status === 'scheduled') return 'badge badge-info'
  if (status === 'completed') return 'badge badge-success'
  return 'badge'
}

function openCreateDoctorModal() {
  showCreateDoctorModal.value = true
  createDoctorForm.value = { name: '', email: '', password: '', specialization: '' }
  createDoctorError.value = ''
  createDoctorSuccess.value = ''
  // Initialize tempAvailability
  tempAvailability.value = {}
  for (const day of daysOfWeek) tempAvailability.value[day] = []
}
function closeCreateDoctorModal() {
  showCreateDoctorModal.value = false
}
function addAvailabilityRange(day) {
  tempAvailability.value[day].push({ start: '', end: '' })
}
function removeAvailabilityRange(day, idx) {
  tempAvailability.value[day].splice(idx, 1)
}
async function submitCreateDoctor() {
  createDoctorLoading.value = true
  createDoctorError.value = ''
  createDoctorSuccess.value = ''
  try {
    // Build availability array from tempAvailability
    const availabilityArr = []
    for (const day of daysOfWeek) {
      for (const range of tempAvailability.value[day]) {
        if (range.start && range.end) {
          availabilityArr.push({ day, start: range.start, end: range.end })
        }
      }
    }
    await createDoctor({
      name: createDoctorForm.value.name,
      email: createDoctorForm.value.email,
      password: createDoctorForm.value.password,
      specialization: createDoctorForm.value.specialization,
      availability: availabilityArr
    })
    createDoctorSuccess.value = 'Doctor created successfully!'
    await refreshUsers()
    closeCreateDoctorModal()
  } catch (e) {
    createDoctorError.value = e.response?.data?.message || 'Failed to create doctor.'
  } finally {
    createDoctorLoading.value = false
  }
}
async function refreshUsers() {
  try {
    loadingUsers.value = true
    const res = await getUsers()
    users.value = res.data.data || []
  } catch (e) {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}
</script>
