<template>
  <DoctorLayout>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
      <!-- Loading States -->
      <div v-if="!userStore.ready" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Loading profile...</p>
      </div>
      
      <div v-else-if="!userStore.user" class="text-center py-12">
        <p class="text-gray-500">Redirecting...</p>
      </div>
      
      <div v-else-if="!userStore.user.doctor" class="text-center py-12">
        <p class="text-gray-500">No doctor profile found</p>
      </div>
      
      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {{ initials }}
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Dr. {{ doctorName }}</h1>
              <p class="text-lg text-blue-600 mb-1">{{ specialization }}</p>
              <p class="text-gray-600">{{ email }}</p>
            </div>
            <Button variant="primary" @click="editProfile">Edit Profile</Button>
          </div>
        </div>

        <!-- Information Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Information -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Full Name</span>
                <span class="font-medium">Dr. {{ doctorName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Email</span>
                <span class="font-medium">{{ email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Specialization</span>
                <span class="font-medium">{{ specialization }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Doctor ID</span>
                <span class="font-medium font-mono">{{ doctorId }}</span>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Working Hours</h2>
              <Button variant="secondary" size="sm" @click="editSchedule">Edit</Button>
            </div>
            
            <div v-if="parsedAvailabilityArray.length === 0" class="text-center py-8">
              <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-gray-500 text-sm mb-3">No working hours set</p>
              <Button variant="primary" size="sm" @click="editSchedule">Set Working Hours</Button>
            </div>
            
            <div v-else class="space-y-2">
              <div v-for="(entry, idx) in parsedAvailabilityArray" :key="idx" 
                   class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span class="font-medium capitalize">{{ entry.day }}</span>
                <span class="text-gray-600 font-mono text-sm">{{ entry.start }} - {{ entry.end }}</span>
              </div>
            </div>
          </div>

          <!-- Account Details -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">User ID</span>
                <span class="font-medium font-mono">{{ userId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Account Created</span>
                <span class="font-medium">{{ createdAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Updated</span>
                <span class="font-medium">{{ updatedAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ availableDays }}</div>
                <div class="text-xs text-gray-500 mt-1">Working Days</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ weeklyHours }}</div>
                <div class="text-xs text-gray-500 mt-1">Weekly Hours</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ todayAppointments }}</div>
                <div class="text-xs text-gray-500 mt-1">Today's Appointments</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-900">{{ activePatients }}</div>
                <div class="text-xs text-gray-500 mt-1">Active Patients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DoctorLayout>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import DoctorLayout from '../../layouts/DoctorLayout.vue'
import Button from '@/components/Button.vue'
import { useUserStore } from '@/store/user'
import { formatDateTime } from '@/utils/format'

const userStore = useUserStore()
const router = useRouter()

watchEffect(() => {
  if (userStore.ready && !userStore.user) {
    router.push('/login')
  }
})

const doctor = computed(() => userStore.user?.doctor || {})
const doctorName = computed(() => userStore.user?.name || 'Unknown')
const email = computed(() => userStore.user?.email || 'No email')
const doctorId = computed(() => doctor.value.id || 'N/A')
const userId = computed(() => userStore.user?.id || 'N/A')
const specialization = computed(() => doctor.value.specialization || 'General Practice')
const createdAt = computed(() => formatDateTime(doctor.value.created_at, 'PP'))
const updatedAt = computed(() => formatDateTime(doctor.value.updated_at, 'PP'))

const initials = computed(() => {
  const name = userStore.user?.name || 'UN'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const parsedAvailabilityArray = computed(() => {
  if (!doctor.value.availability) return []
  try {
    const avail = JSON.parse(doctor.value.availability)
    return Array.isArray(avail) ? avail : []
  } catch {
    return []
  }
})

// Quick stats computed values
const todayAppointments = computed(() => '5') // This would come from API
const activePatients = computed(() => '23') // This would come from API
const weeklyHours = computed(() => {
  const total = parsedAvailabilityArray.value.reduce((acc, slot) => {
    if (slot.start && slot.end) {
      const start = slot.start.split(':').map(Number)
      const end = slot.end.split(':').map(Number)
      const startMinutes = start[0] * 60 + start[1]
      const endMinutes = end[0] * 60 + end[1]
      return acc + (endMinutes - startMinutes) / 60
    }
    return acc
  }, 0)
  return Math.round(total) + 'h'
})
const availableDays = computed(() => parsedAvailabilityArray.value.length)

// Action handlers
function editProfile() {
  console.log('Edit profile clicked')
  // TODO: Implement edit profile functionality
}

function editSchedule() {
  console.log('Edit schedule clicked')
  // TODO: Implement edit schedule functionality
}
</script>