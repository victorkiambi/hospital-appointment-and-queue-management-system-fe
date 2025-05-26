<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <form @submit.prevent="onSubmit" class="card-body">
        <h1 class="card-title text-3xl mb-4 justify-center">Login</h1>
        <div v-if="error" class="alert alert-error shadow-sm mb-2">{{ error }}</div>
        <div class="form-control mb-2">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input v-model="email" id="email" type="email" required class="input input-bordered w-full" />
        </div>
        <div class="form-control mb-4">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input v-model="password" id="password" type="password" required class="input input-bordered w-full" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary w-full">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
        <div class="mt-4 flex justify-between text-sm">
          <router-link to="/register" class="link link-primary">Register</router-link>
          <router-link to="/forgot-password" class="link link-accent">Forgot Password?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await userStore.login(email.value, password.value)
    const role = response?.data?.data?.user?.role || userStore.user?.role
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
    error.value = err.response?.data?.message || err.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script> 