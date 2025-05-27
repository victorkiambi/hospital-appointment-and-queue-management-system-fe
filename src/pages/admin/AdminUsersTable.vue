<template>
  <Card title="Users">
    <!-- Search and Filter Bar -->
    <div class="users-search-bar flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div class="flex flex-col md:flex-row md:items-center gap-4 w-full">
        <div class="relative flex-shrink-0 w-full md:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            v-model="userNameFilter"
            type="text"
            placeholder="Search users..."
            class="users-search-field pl-10 h-10 w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <Select
            v-model="userRoleFilter"
            :options="roleOptions"
            placeholder="All Roles"
            class="users-filter-select h-10 min-w-[120px]"
          />
        </div>
      </div>
      <div class="users-actions flex items-center gap-2">
        <span 
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="users-clear-filters cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
        >
          Clear filters
        </span>
        <Button size="sm" variant="success" class="button-success" @click="openCreateDoctorModal">+ Doctor</Button>
      </div>
    </div>

    <!-- Filter Summary -->
    <div v-if="!loading" class="users-filter-summary">
      <p class="text-sm text-gray-600 font-medium">{{ userFilterSummary }}</p>
    </div>

    <!-- Users Table -->
    <Table
      :columns="userColumns"
      :data="filteredUsers"
      :loading="loading"
      :has-filters="hasActiveFilters"
      :clear-filters="clearAllFilters"
    >
      <template #name="{ row }">
        <div class="flex items-center gap-3">
          <div class="user-avatar small">
            {{ (row.name?.split(' ').map(n => n[0]).join('') || '?').toUpperCase().slice(0,2) }}
          </div>
          <span class="font-semibold text-gray-900 text-base">{{ row.name }}</span>
        </div>
      </template>
      <template #email="{ row }">
        <span class="text-gray-500 text-sm">{{ row.email }}</span>
      </template>
      <template #role="{ row }">
        <span :class="['role-badge', row.role || 'default', 'capitalize']">{{ row.role }}</span>
      </template>
      <template #actions="{ row }">
        <Button size="sm" variant="secondary" @click="showUserModal(row)">Details</Button>
      </template>
    </Table>

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
        <div>
          <Button size="sm" variant="secondary" @click="showAvailabilityModal = true">
            Set Availability
          </Button>
          <div v-if="tempAvailabilityArr.length > 0" class="mt-2">
            <div class="text-xs text-gray-700 font-medium mb-1">Selected Schedule:</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="(slot, idx) in tempAvailabilityArr" :key="idx" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ slot.day }} {{ slot.start }}-{{ slot.end }}
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 italic mt-2">No schedule set</div>
        </div>
        <DoctorAvailabilityModal
          :visible="showAvailabilityModal"
          :initial-availability="tempAvailabilityArr"
          :loading="createDoctorLoading"
          @close="showAvailabilityModal = false"
          @save="arr => { tempAvailabilityArr = arr; showAvailabilityModal = false }"
        />
      </div>
      <template #actions>
        <Button variant="secondary" type="button" @click="closeCreateDoctorModal">Cancel</Button>
        <Button variant="primary" type="submit" :loading="createDoctorLoading" @click="submitCreateDoctor">Create</Button>
      </template>
    </Modal>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Card from '@/components/Card.vue'
import Table from '@/components/Table.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import DoctorAvailabilityModal from '@/components/DoctorAvailabilityModal.vue'

const props = defineProps({
  users: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  roleOptions: { type: Array, required: true },
  userColumns: { type: Array, required: true }
})

const emit = defineEmits(['refreshUsers'])

const userRoleFilter = ref('')
const userNameFilter = ref('')
const selectedUser = ref(null)
const showCreateDoctorModal = ref(false)
const createDoctorForm = ref({ name: '', email: '', password: '', specialization: '' })
const createDoctorLoading = ref(false)
const createDoctorError = ref('')
const createDoctorSuccess = ref('')
const showAvailabilityModal = ref(false)
const tempAvailabilityArr = ref([])

const filteredUsers = computed(() => {
  let result = props.users
  if (userRoleFilter.value) {
    result = result.filter(u => u.role === userRoleFilter.value)
  }
  if (userNameFilter.value) {
    const q = userNameFilter.value.trim().toLowerCase()
    result = result.filter(u => u.name && u.name.toLowerCase().includes(q))
  }
  return result
})

// Filter summary and controls
const hasActiveFilters = computed(() => {
  return userNameFilter.value || userRoleFilter.value
})

const userFilterSummary = computed(() => {
  const total = props.users.length
  const filtered = filteredUsers.value.length
  
  if (!hasActiveFilters.value) {
    return `Showing all ${total} users`
  }
  
  if (filtered === 0) {
    return 'No users match your filters'
  }
  
  return `Showing ${filtered} of ${total} users`
})

function clearAllFilters() {
  userNameFilter.value = ''
  userRoleFilter.value = ''
}

function showUserModal(user) {
  selectedUser.value = user
}
function closeUserModal() {
  selectedUser.value = null
}
function openCreateDoctorModal() {
  showCreateDoctorModal.value = true
  createDoctorForm.value = { name: '', email: '', password: '', specialization: '' }
  createDoctorError.value = ''
  createDoctorSuccess.value = ''
  tempAvailabilityArr.value = []
  showAvailabilityModal.value = false
}
function closeCreateDoctorModal() {
  showCreateDoctorModal.value = false
  showAvailabilityModal.value = false
}
async function submitCreateDoctor() {
  createDoctorLoading.value = true
  createDoctorError.value = ''
  createDoctorSuccess.value = ''
  try {
    // Use tempAvailabilityArr for availability
    const availabilityArr = tempAvailabilityArr.value
    // This should be replaced with an emit or API call in parent
    // await createDoctor({ ...createDoctorForm.value, availability: availabilityArr })
    createDoctorSuccess.value = 'Doctor created successfully!'
    emit('refreshUsers')
    closeCreateDoctorModal()
  } catch (e) {
    createDoctorError.value = e.response?.data?.message || 'Failed to create doctor.'
  } finally {
    createDoctorLoading.value = false
  }
}
</script>