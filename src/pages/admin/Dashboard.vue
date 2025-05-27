<template>
  <AdminLayout>
    <div class="flex flex-col gap-8 px-2 md:px-8 py-4">
      <!-- System Stats -->
      <AdminStatsCards :stats="stats" />
      <!-- Users Table -->
      <AdminUsersTable
        :users="users"
        :loading="loadingUsers"
        :role-options="roleOptions"
        :user-columns="userColumns"
        @refreshUsers="refreshUsers"
      />
      <!-- Appointments Table -->
      <AdminAppointmentsTable
        :appointments="appointments"
        :loading="loadingAppointments"
        :meta="appointmentsMeta"
        :page="appointmentsPage"
        @page-change="goToAppointmentsPage"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { getUsers, getAppointments, getStats, createDoctor } from '@/services/api.js'
import AdminStatsCards from '@/pages/admin/AdminStatsCards.vue'
import AdminUsersTable from '@/pages/admin/AdminUsersTable.vue'
import AdminAppointmentsTable from '@/pages/admin/AdminAppointmentsTable.vue'

const stats = ref({ total_users: 0, total_doctors: 0, total_patients: 0, total_appointments: 0, total_queues: 0 })
const users = ref([])
const appointments = ref([])
const appointmentsMeta = ref({ total: 0, per_page: 20, current_page: 1, last_page: 1 })
const appointmentsPage = ref(1)
const loadingStats = ref(true)
const loadingUsers = ref(true)
const loadingAppointments = ref(true)

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
  await refreshUsers()
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