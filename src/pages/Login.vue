<template>
  <div class="auth-container">
    <Notification
      v-if="showNotification && error"
      type="error"
      :message="error"
      :duration="5000"
      @close="showNotification = false"
    />
    <div class="auth-card">
      <div class="auth-card-body">
        <!-- Header -->
        <div class="auth-header">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="onSubmit" class="auth-form">
          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="email">
              <span class="form-label-text">Email Address</span>
              <span class="text-red-500">*</span>
            </label>
            <div class="input-with-icon">
              <svg class="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
              </svg>
              <input 
                v-model="email" 
                id="email" 
                type="email" 
                required 
                class="form-input" 
                placeholder="Enter your email address"
                :class="{ 'input-error': emailError }"
                @blur="validateEmail"
              />
            </div>
            <div v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="password">
              <span class="form-label-text">Password</span>
              <span class="text-red-500">*</span>
            </label>
            <div class="input-with-icon">
              <svg class="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <input 
                v-model="password" 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="form-input pr-12" 
                placeholder="Enter your password"
                :class="{ 'input-error': passwordError }"
                @blur="validatePassword"
              />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.697 6.697m7.425 7.425l3.18 3.18m-3.18-3.18L6.697 6.697m0 0L3 3"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <div v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</div>
          </div>

          <!-- Remember Me -->
          <div class="form-group">
            <div class="remember-checkbox">
              <input type="checkbox" v-model="rememberMe" id="rememberMe" />
              <label for="rememberMe">Remember me</label>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading || !isFormValid" class="auth-button">
            <span v-if="loading" class="flex items-center justify-center">
              <div class="loading-spinner mr-2"></div>
              Signing in...
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Sign In
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <router-link to="/register" class="auth-link">
            Don't have an account? Create one
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import Notification from '@/components/Notification.vue'

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// UI state
const showPassword = ref(false)
const showNotification = ref(false)

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Computed properties
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)

watch(error, (val) => {
  if (val) {
    showNotification.value = true
  }
})

const isFormValid = computed(() => {
  return email.value.trim() && 
         password.value && 
         !emailError.value && 
         !passwordError.value
})

// Validation functions
const validateEmail = () => {
  emailError.value = ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value.trim()) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  }
}

const validatePassword = () => {
  passwordError.value = ''
  if (!password.value) {
    passwordError.value = 'Password is required'
  }
}

// Form submission
const onSubmit = async () => {
  // Clear previous errors
  emailError.value = ''
  passwordError.value = ''
  showNotification.value = false
  
  // Validate fields
  validateEmail()
  validatePassword()
  
  // Check if form is valid
  if (!isFormValid.value) {
    return
  }
  
  try {
    const response = await userStore.login(email.value, password.value)
    const role = response?.data?.data?.user?.role || userStore.user?.role
    
    // Redirect based on role
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else if (role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (role === 'patient') {
      router.push('/patient/dashboard')
    } else {
      router.push('/')
    }
  } catch (err) {
    // Error is handled in the store
    showNotification.value = true
    console.error('Login error:', err)
  }
}
</script>
