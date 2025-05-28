<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-card-body">
        <!-- Header -->
        <div class="auth-header">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join us today and get started</p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="auth-alert-error">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          {{ error }}
        </div>
        
        <div v-if="success" class="auth-alert-success">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          {{ success }}
        </div>
        
        <div v-if="localError" class="auth-alert-error">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          {{ localError }}
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="onSubmit" class="auth-form">
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="name">
              <span class="form-label-text">Full Name</span>
              <span class="text-red-500">*</span>
            </label>
            <div class="input-with-icon">
              <svg class="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <input 
                v-model="name" 
                id="name" 
                type="text" 
                required 
                class="form-input" 
                placeholder="Enter your full name"
                :class="{ 'input-error': nameError }"
                @blur="validateName"
              />
            </div>
            <div v-if="nameError" class="text-red-500 text-xs mt-1">{{ nameError }}</div>
          </div>

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
                placeholder="Create a strong password"
                @input="checkPasswordStrength"
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
            
            <!-- Password Strength Indicator -->
            <div v-if="password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrengthClass"></div>
              </div>
              <p class="strength-text" :class="passwordStrengthColor">
                Password strength: {{ passwordStrengthText }}
              </p>
            </div>
            
            <div v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="form-label" for="passwordConfirm">
              <span class="form-label-text">Confirm Password</span>
              <span class="text-red-500">*</span>
            </label>
            <div class="input-with-icon">
              <svg class="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <input 
                v-model="passwordConfirm" 
                id="passwordConfirm" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required 
                class="form-input pr-12" 
                placeholder="Confirm your password"
                :class="{ 'input-error': confirmPasswordError }"
                @blur="validateConfirmPassword"
              />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.697 6.697m7.425 7.425l3.18 3.18m-3.18-3.18L6.697 6.697m0 0L3 3"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <div v-if="confirmPasswordError" class="text-red-500 text-xs mt-1">{{ confirmPasswordError }}</div>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="loading || !isFormValid" class="auth-button">
            <span v-if="loading" class="flex items-center justify-center">
              <div class="loading-spinner mr-2"></div>
              Creating Account...
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Create Account
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="auth-footer">
          <router-link to="/login" class="auth-link">
            Already have an account? Sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { useRouter } from 'vue-router'

// Form data
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

// UI state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const localError = ref('')

// Validation errors
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Password strength
const passwordStrength = ref(0)

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Computed properties
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const success = computed(() => userStore.success)

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 2) return 'Weak'
  if (strength < 3) return 'Fair'
  if (strength < 4) return 'Good'
  return 'Strong'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 2) return 'strength-weak'
  if (strength < 3) return 'strength-fair'
  if (strength < 4) return 'strength-good'
  return 'strength-strong'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 2) return 'text-red-500'
  if (strength < 3) return 'text-yellow-500'
  if (strength < 4) return 'text-blue-500'
  return 'text-green-500'
})

const isFormValid = computed(() => {
  return name.value.trim() && 
         email.value.trim() && 
         password.value && 
         passwordConfirm.value &&
         !nameError.value && 
         !emailError.value && 
         !passwordError.value && 
         !confirmPasswordError.value
})

// Validation functions
const validateName = () => {
  nameError.value = ''
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
  } else if (name.value.trim().length < 2) {
    nameError.value = 'Name must be at least 2 characters'
  }
}

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
  } else if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  }
  
  // Revalidate confirm password if it exists
  if (passwordConfirm.value) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = ''
  if (!passwordConfirm.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (password.value !== passwordConfirm.value) {
    confirmPasswordError.value = 'Passwords do not match'
  }
}

// Password strength checker
const checkPasswordStrength = () => {
  let strength = 0
  const pwd = password.value
  
  // Length check
  if (pwd.length >= 8) strength++
  
  // Uppercase check
  if (/[A-Z]/.test(pwd)) strength++
  
  // Lowercase check
  if (/[a-z]/.test(pwd)) strength++
  
  // Number check
  if (/\d/.test(pwd)) strength++
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++
  
  passwordStrength.value = strength
}

// Form submission
const onSubmit = async () => {
  // Clear previous errors
  localError.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  
  // Validate all fields
  validateName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  // Check if passwords match
  if (password.value !== passwordConfirm.value) {
    localError.value = 'Passwords do not match'
    return
  }
  
  // Check if form is valid
  if (!isFormValid.value) {
    localError.value = 'Please fix the errors above'
    return
  }
  
  try {
    await userStore.register(name.value, email.value, password.value, passwordConfirm.value)
    
    // Clear form on success
    name.value = ''
    email.value = ''
    password.value = ''
    passwordConfirm.value = ''
    localError.value = ''
    
    // Redirect to login after success
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err) {
    // Error is handled in the store
    console.error('Registration error:', err)
  }
}
</script>
