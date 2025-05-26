<template>
  <DoctorLayout>
    <div class="max-w-2xl mx-auto mt-8">
      <Card title="Doctor Profile">
        <div v-if="!userStore.ready" class="py-12 text-center text-gray-400">Loading profile...</div>
        <div v-else-if="!userStore.user" class="py-12 text-center text-gray-400">Redirecting...</div>
        <div v-else-if="!userStore.user.doctor" class="py-12 text-center text-gray-400">No doctor details found.</div>
        <div v-else class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-700 font-bold">
              {{ initials }}
            </div>
            <div>
              <div class="text-xl font-semibold">Dr. {{ doctorName }}</div>
              <div class="text-gray-500">{{ specialization }}</div>
              <div class="text-gray-400 text-sm">{{ email }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="font-bold">Doctor ID:</span> {{ doctorId }}</div>
            <div><span class="font-bold">User ID:</span> {{ userId }}</div>
            <div><span class="font-bold">Created At:</span> {{ createdAt }}</div>
            <div><span class="font-bold">Updated At:</span> {{ updatedAt }}</div>
          </div>
          <div>
            <span class="font-bold">Availability:</span>
            <ul class="list-disc ml-6 mt-1">
              <li v-for="(entry, idx) in parsedAvailabilityArray" :key="idx">
                <span class="capitalize">{{ entry.day }}:</span> {{ entry.start }}-{{ entry.end }}
              </li>
            </ul>
          </div>
          <div class="flex justify-end">
            <Button variant="secondary">Edit Profile</Button>
          </div>
        </div>
      </Card>
    </div>
  </DoctorLayout>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import DoctorLayout from '../../layouts/DoctorLayout.vue'
import Card from '@/components/Card.vue'
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
const doctorName = computed(() => userStore.user?.name || '-')
const email = computed(() => userStore.user?.email || '-')
const doctorId = computed(() => doctor.value.id || '-')
const userId = computed(() => userStore.user?.id || '-')
const specialization = computed(() => doctor.value.specialization || '-')
const createdAt = computed(() => formatDateTime(doctor.value.created_at, 'PPpp'))
const updatedAt = computed(() => formatDateTime(doctor.value.updated_at, 'PPpp'))
const initials = computed(() => {
  const name = userStore.user?.name || ''
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
</script> 