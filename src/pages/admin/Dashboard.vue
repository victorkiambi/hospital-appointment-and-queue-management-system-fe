<template>
  <AdminLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- System Stats -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Card title="Total Users">{{ stats.total_users }}</Card>
        <Card title="Doctors">{{ stats.total_doctors }}</Card>
        <Card title="Patients">{{ stats.total_patients }}</Card>
        <Card title="Appointments">{{ stats.total_appointments }}</Card>
        <Card title="Queues">{{ stats.total_queues }}</Card>
      </div>
      <!-- Users Table -->
      <Card title="Users">
        <div class="flex justify-between items-center mb-2">
          <Select
            v-model="userRoleFilter"
            :options="roleOptions"
            placeholder="All Roles"
            class="w-40"
          />
          <Button size="sm" variant="success" @click="openCreateDoctorModal">+ Doctor</Button>
        </div>
        <Table
          :columns="userColumns"
          :data="filteredUsers"
          :loading="loadingUsers"
        >
          <template #actions="{ row }">
            <Button size="sm" variant="secondary" @click="showUserModal(row)">Details</Button>
          </template>
        </Table>
      </Card>
      <!-- Appointments Table -->
      <Card title="Appointments">
        <div class="enhanced-table">
          <table>
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
                    <p class="text-sm font-medium">No appointments found</p>
                    <p class="text-xs text-gray-400">System appointments will appear here</p>
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
                    {{ appt.doctor?.user?.name || '-' }}
                  </div>
                  <div class="table-cell-secondary text-xs">
                    {{ appt.doctor?.specialization || '' }}
                  </div>
                </td>
                <td>
                  <div class="table-cell-primary">
                    {{ appt.patient?.user?.name || '-' }}
                  </div>
                  <div class="table-cell-secondary text-xs">
                    {{ appt.patient?.user?.email || '' }}
                  </div>
                </td>
                <td>
                  <span :class="getEnhancedStatusClass(appt.status)">
                    {{ appt.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="appointmentsMeta.last_page > 1" class="flex justify-center mt-4 gap-2">
          <Button size="sm" :disabled="appointmentsPage === 1" @click="goToAppointmentsPage(appointmentsPage - 1)">Prev</Button>
          <Button
            v-for="page in appointmentsMeta.last_page"
            :key="page"
            size="sm"
            :variant="page === appointmentsPage ? 'primary' : 'secondary'"
            @click="goToAppointmentsPage(page)"
          >{{ page }}</Button>
          <Button size="sm" :disabled="appointmentsPage === appointmentsMeta.last_page" @click="goToAppointmentsPage(appointmentsPage + 1)">Next</Button>
        </div>
      </Card>
      <!-- User Details Modal -->
      <Modal :visible="!!selectedUser" title="User Details" @close="closeUserModal">
        <div v-if="selectedUser">
          <p><span class="font-bold">Name:</span> {{ selectedUser.name }}</p>
          <p><span class="font-bold">Email:</span> {{ selectedUser.email }}</p>
          <p><span class="font-bold">Role:</span> {{ selectedUser.role }}</p>
          <p v-if="selectedUser.specialization"><span class="font-bold">Specialization:</span> {{ selectedUser.specialization }}</p>
          <p v-if="selectedUser.medical_record_number"><span class="font-bold">MRN:</span> {{ selectedUser.medical_record_number }}</p>
        </div>
        <template #actions>
          <Button @click="closeUserModal">Close</Button>
        </template>
      </Modal>
      <!-- Create Doctor Modal -->
      <Modal :visible="showCreateDoctorModal" title="Create Doctor" @close="closeCreateDoctorModal">
        <Notification v-if="createDoctorError" type="error" :message="createDoctorError" @close="createDoctorError = ''" />
        <Notification v-if="createDoctorSuccess" type="success" :message="createDoctorSuccess" @close="createDoctorSuccess = ''" />
        <TextInput v-model="createDoctorForm.name" label="Name" required />
        <TextInput v-model="createDoctorForm.email" label="Email" type="email" required />
        <TextInput v-model="createDoctorForm.password" label="Password" type="password" required />
        <TextInput v-model="createDoctorForm.specialization" label="Specialization" required />
        <div class="mb-2">
          <label class="label">Availability</label>
          <div class="border rounded p-2 bg-base-200">
            <div v-for="day in daysOfWeek" :key="day" class="mb-2">
              <div class="font-bold mb-1">{{ day }}</div>
              <div v-for="(range, idx) in tempAvailability[day]" :key="idx" class="flex items-center gap-2 mb-1">
                <input type="time" v-model="tempAvailability[day][idx].start" class="input input-bordered input-sm w-28" required />
                <span>-</span>
                <input type="time" v-model="tempAvailability[day][idx].end" class="input input-bordered input-sm w-28" required />
                <Button size="sm" variant="danger" type="button" @click="removeAvailabilityRange(day, idx)">Remove</Button>
              </div>
              <Button size="sm" variant="success" type="button" @click="addAvailabilityRange(day)">Add Time Range</Button>
            </div>
          </div>
        </div>
        <template #actions>
          <Button variant="secondary" type="button" @click="closeCreateDoctorModal">Cancel</Button>
          <Button variant="primary" type="submit" :loading="createDoctorLoading" @click="submitCreateDoctor">Create</Button>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { getUsers, getAppointments, getStats, createDoctor } from '../../services/api'
import Card from '@/components/Card.vue'
import Table from '@/components/Table.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import { formatDateTime } from '@/utils/format'

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

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'patient', label: 'Patient' }
]
const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]
const appointmentColumns = [
  { key: 'scheduled_at', label: 'Date' },
  { key: 'scheduled_at', label: 'Time' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'patient', label: 'Patient' },
  { key: 'status', label: 'Status' }
]

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
