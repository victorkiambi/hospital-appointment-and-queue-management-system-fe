<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <form @submit.prevent="onSubmit" class="card-body">
        <h1 class="card-title text-3xl mb-4 justify-center">Register</h1>
        <div v-if="error" class="alert alert-error shadow-sm mb-2">{{ error }}</div>
        <div v-if="success" class="alert alert-success shadow-sm mb-2">{{ success }}</div>
        <div class="form-control mb-2">
          <label class="label" for="name">
            <span class="label-text">Name</span>
          </label>
          <input v-model="name" id="name" type="text" required class="input input-bordered w-full" />
        </div>
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
        <button type="submit" :disabled="loading" class="btn btn-success w-full">
          <span v-if="loading">Registering...</span>
          <span v-else>Register</span>
        </button>
        <div class="mt-4 flex justify-between text-sm">
          <router-link to="/login" class="link link-primary">Login</router-link>
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

const name = ref('')
const email = ref('')
const password = ref('')
const userStore = useUserStore()
const router = useRouter()

const onSubmit = async () => {
  try {
    await userStore.register(name.value, email.value, password.value)
    // Optionally redirect to login after success
    // router.push('/login')
  } catch (err) {
    // error handled in store
  }
}

const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const success = computed(() => userStore.success)
</script> 