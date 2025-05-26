<template>
  <PatientLayout>
    <div class="max-w-4xl mx-auto mt-8 px-4">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Patient Profile</h1>
          <Button variant="primary" @click="openEditModal">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Button>
        </div>

        <div v-if="!userStore.ready" class="py-12 text-center text-gray-400">
          <svg class="loading-spinner mx-auto mb-4 w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Loading profile...
        </div>
        
        <div v-else-if="!userStore.user" class="py-12 text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Unable to load profile. Please try refreshing the page.
        </div>
        
        <div v-else-if="!userStore.user.patient" class="py-12 text-center text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          No patient details found.
        </div>
        
        <div v-else>
          <!-- Profile Avatar and Basic Info -->
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {{ initials }}
              </div>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div class="flex-1">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ patientName }}</h2>
              <div class="flex flex-wrap gap-4 text-gray-600 mb-4">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {{ email }}
                </div>
                <div class="flex items-center gap-2" v-if="phoneNumber">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ phoneNumber }}
                </div>
              </div>
              <div class="flex gap-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Patient ID: {{ patientId }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Detailed Information Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Personal Information -->
            <Card title="Personal Information" class="h-fit">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Date of Birth</label>
                    <p class="text-gray-900">{{ dateOfBirth || 'Not provided' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Age</label>
                    <p class="text-gray-900">{{ calculatedAge || 'Not available' }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Gender</label>
                    <p class="text-gray-900 capitalize">{{ gender || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Blood Type</label>
                    <p class="text-gray-900">{{ bloodType || 'Not specified' }}</p>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-500 block mb-1">Address</label>
                  <p class="text-gray-900">{{ address || 'Not provided' }}</p>
                </div>
              </div>
            </Card>

            <!-- Medical Information -->
            <Card title="Medical Information" class="h-fit">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500 block mb-1">Allergies</label>
                  <div v-if="allergies && allergies.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="allergy in allergies" :key="allergy" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {{ allergy }}
                    </span>
                  </div>
                  <p v-else class="text-gray-900">No known allergies</p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-500 block mb-1">Medical Conditions</label>
                  <div v-if="medicalConditions && medicalConditions.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="condition in medicalConditions" :key="condition" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {{ condition }}
                    </span>
                  </div>
                  <p v-else class="text-gray-900">No known medical conditions</p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-500 block mb-1">Current Medications</label>
                  <div v-if="medications && medications.length > 0" class="space-y-2">
                    <div v-for="medication in medications" :key="medication" class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm">{{ medication }}</span>
                    </div>
                  </div>
                  <p v-else class="text-gray-900">No current medications</p>
                </div>
              </div>
            </Card>

            <!-- Emergency Contact -->
            <Card title="Emergency Contact" class="h-fit">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500 block mb-1">Contact Name</label>
                  <p class="text-gray-900">{{ emergencyContactName || 'Not provided' }}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Relationship</label>
                    <p class="text-gray-900">{{ emergencyContactRelationship || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                    <p class="text-gray-900">{{ emergencyContactPhone || 'Not provided' }}</p>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Account Information -->
            <Card title="Account Information" class="h-fit">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">User ID</label>
                    <p class="text-gray-900 font-mono text-sm">{{ userId }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Patient ID</label>
                    <p class="text-gray-900 font-mono text-sm">{{ patientId }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Account Created</label>
                    <p class="text-gray-900 text-sm">{{ createdAt }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500 block mb-1">Last Updated</label>
                    <p class="text-gray-900 text-sm">{{ updatedAt }}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <Modal :visible="showEditModal" title="Edit Profile" @close="closeEditModal" size="large">
        <form @submit.prevent="saveProfile" class="space-y-6">
          <Notification v-if="editError" type="error" :message="editError" @close="editError = ''" />
          <Notification v-if="editSuccess" type="success" :message="editSuccess" @close="editSuccess = ''" />
          
          <!-- Personal Information Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                v-model="editForm.name"
                label="Full Name"
                placeholder="Enter your full name"
                required
              />
              <TextInput
                v-model="editForm.email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
              />
              <TextInput
                v-model="editForm.phone"
                label="Phone Number"
                placeholder="Enter your phone number"
              />
              <TextInput
                v-model="editForm.date_of_birth"
                label="Date of Birth"
                type="date"
              />
              <Select
                v-model="editForm.gender"
                label="Gender"
                :options="genderOptions"
                placeholder="Select gender"
              />
              <Select
                v-model="editForm.blood_type"
                label="Blood Type"
                :options="bloodTypeOptions"
                placeholder="Select blood type"
              />
            </div>
            <div class="mt-4">
              <TextInput
                v-model="editForm.address"
                label="Address"
                placeholder="Enter your address"
                multiline
                rows="3"
              />
            </div>
          </div>

          <!-- Medical Information Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div class="space-y-4">
              <TextInput
                v-model="editForm.allergies"
                label="Allergies (comma-separated)"
                placeholder="e.g., Peanuts, Shellfish, Penicillin"
              />
              <TextInput
                v-model="editForm.medical_conditions"
                label="Medical Conditions (comma-separated)"
                placeholder="e.g., Diabetes, Hypertension"
              />
              <TextInput
                v-model="editForm.medications"
                label="Current Medications (comma-separated)"
                placeholder="e.g., Metformin, Aspirin"
              />
            </div>
          </div>

          <!-- Emergency Contact Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                v-model="editForm.emergency_contact_name"
                label="Contact Name"
                placeholder="Enter contact name"
              />
              <TextInput
                v-model="editForm.emergency_contact_relationship"
                label="Relationship"
                placeholder="e.g., Spouse, Parent"
              />
              <TextInput
                v-model="editForm.emergency_contact_phone"
                label="Phone Number"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </form>

        <template #actions>
          <Button variant="secondary" @click="closeEditModal" :disabled="saveLoading">
            Cancel
          </Button>
          <Button variant="primary" @click="saveProfile" :loading="saveLoading" :disabled="saveLoading">
            {{ saveLoading ? 'Saving...' : 'Save Changes' }}
          </Button>
        </template>
      </Modal>
    </div>
  </PatientLayout>
</template>

<script setup>
import { ref, computed, watchEffect, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PatientLayout from '../../layouts/PatientLayout.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Modal from '@/components/Modal.vue'
import Notification from '@/components/Notification.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'
import { useUserStore } from '@/store/user'
import { formatDateTime } from '@/utils/format'
import api from '@/services/api'

const userStore = useUserStore()
const router = useRouter()

// Edit modal state
const showEditModal = ref(false)
const saveLoading = ref(false)
const editError = ref('')
const editSuccess = ref('')

// Form options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

const bloodTypeOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

// Edit form reactive object
const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  blood_type: '',
  address: '',
  allergies: '',
  medical_conditions: '',
  medications: '',
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: ''
})

// Redirect if not authenticated
watchEffect(() => {
  if (userStore.ready && !userStore.user) {
    router.push('/login')
  }
})

// Computed properties for patient data
const patient = computed(() => userStore.user?.patient || {})
const patientName = computed(() => userStore.user?.name || 'N/A')
const email = computed(() => userStore.user?.email || 'N/A')
const patientId = computed(() => patient.value.id || 'N/A')
const userId = computed(() => userStore.user?.id || 'N/A')

// Personal information
const phoneNumber = computed(() => patient.value.phone || userStore.user?.phone || null)
const dateOfBirth = computed(() => patient.value.date_of_birth ? formatDateTime(patient.value.date_of_birth, 'PPP') : null)
const gender = computed(() => patient.value.gender || null)
const bloodType = computed(() => patient.value.blood_type || null)
const address = computed(() => patient.value.address || null)

// Medical information
const allergies = computed(() => {
  if (!patient.value.allergies) return []
  return typeof patient.value.allergies === 'string' 
    ? patient.value.allergies.split(',').map(a => a.trim()).filter(a => a)
    : patient.value.allergies
})

const medicalConditions = computed(() => {
  if (!patient.value.medical_conditions) return []
  return typeof patient.value.medical_conditions === 'string'
    ? patient.value.medical_conditions.split(',').map(c => c.trim()).filter(c => c)
    : patient.value.medical_conditions
})

const medications = computed(() => {
  if (!patient.value.medications) return []
  return typeof patient.value.medications === 'string'
    ? patient.value.medications.split(',').map(m => m.trim()).filter(m => m)
    : patient.value.medications
})

// Emergency contact
const emergencyContactName = computed(() => patient.value.emergency_contact_name || null)
const emergencyContactRelationship = computed(() => patient.value.emergency_contact_relationship || null)
const emergencyContactPhone = computed(() => patient.value.emergency_contact_phone || null)

// Account information
const createdAt = computed(() => formatDateTime(patient.value.created_at, 'PPpp'))
const updatedAt = computed(() => formatDateTime(patient.value.updated_at, 'PPpp'))

// Avatar initials
const initials = computed(() => {
  const name = userStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT'
})

// Calculate age from date of birth
const calculatedAge = computed(() => {
  if (!patient.value.date_of_birth) return null
  const birthDate = new Date(patient.value.date_of_birth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age + ' years old'
})

// Modal functions
function openEditModal() {
  // Populate form with current data
  editForm.name = userStore.user?.name || ''
  editForm.email = userStore.user?.email || ''
  editForm.phone = patient.value.phone || ''
  editForm.date_of_birth = patient.value.date_of_birth || ''
  editForm.gender = patient.value.gender || ''
  editForm.blood_type = patient.value.blood_type || ''
  editForm.address = patient.value.address || ''
  editForm.allergies = Array.isArray(allergies.value) ? allergies.value.join(', ') : patient.value.allergies || ''
  editForm.medical_conditions = Array.isArray(medicalConditions.value) ? medicalConditions.value.join(', ') : patient.value.medical_conditions || ''
  editForm.medications = Array.isArray(medications.value) ? medications.value.join(', ') : patient.value.medications || ''
  editForm.emergency_contact_name = patient.value.emergency_contact_name || ''
  editForm.emergency_contact_relationship = patient.value.emergency_contact_relationship || ''
  editForm.emergency_contact_phone = patient.value.emergency_contact_phone || ''
  
  showEditModal.value = true
  editError.value = ''
  editSuccess.value = ''
}

function closeEditModal() {
  showEditModal.value = false
  editError.value = ''
  editSuccess.value = ''
}

async function saveProfile() {
  if (saveLoading.value) return
  
  saveLoading.value = true
  editError.value = ''
  editSuccess.value = ''
  
  try {
    // Prepare the data for API
    const profileData = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      date_of_birth: editForm.date_of_birth,
      gender: editForm.gender,
      blood_type: editForm.blood_type,
      address: editForm.address,
      allergies: editForm.allergies,
      medical_conditions: editForm.medical_conditions,
      medications: editForm.medications,
      emergency_contact_name: editForm.emergency_contact_name,
      emergency_contact_relationship: editForm.emergency_contact_relationship,
      emergency_contact_phone: editForm.emergency_contact_phone
    }
    
    // Make API call to update profile
    await api.put('/profile', profileData)
    
    // Refresh user data
    await userStore.restoreSession()
    
    editSuccess.value = 'Profile updated successfully!'
    
    // Close modal after short delay
    setTimeout(() => {
      closeEditModal()
    }, 1500)
    
  } catch (error) {
    console.error('Error updating profile:', error)
    
    let errorMessage = 'Failed to update profile. Please try again.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errorList = Object.values(error.response.data.errors).flat()
      errorMessage = errorList.join(' ')
    }
    
    editError.value = errorMessage
    
  } finally {
    saveLoading.value = false
  }
}
</script>

<style scoped>
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
