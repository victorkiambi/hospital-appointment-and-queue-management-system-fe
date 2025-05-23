<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <form @submit.prevent="onSubmit" class="card-body">
        <h1 class="card-title text-3xl mb-4 justify-center">Forgot Password</h1>
        <div v-if="error" class="alert alert-error shadow-sm mb-2">{{ error }}</div>
        <div v-if="success" class="alert alert-success shadow-sm mb-2">{{ success }}</div>
        <div class="form-control mb-6">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input v-model="email" id="email" type="email" required class="input input-bordered w-full" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-warning w-full">
          <span v-if="loading">Sending...</span>
          <span v-else>Send Reset Link</span>
        </button>
        <div class="mt-4 flex justify-between text-sm">
          <router-link to="/login" class="link link-primary">Login</router-link>
          <router-link to="/register" class="link link-accent">Register</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'

const email = ref('')
const userStore = useUserStore()

const onSubmit = async () => {
  try {
    await userStore.forgotPassword(email.value)
  } catch (err) {
    // error handled in store
  }
}

const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const success = computed(() => userStore.success)
</script> 