<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="w-full flex justify-end p-4">
      <button class="btn btn-outline btn-error" @click="logout">Logout</button>
    </div>
    <div class="card bg-base-100 shadow-xl w-full max-w-md">
      <div class="card-body text-center">
        <h1 class="card-title text-3xl text-blue-600">Home Page</h1>
        <p class="mt-2">Welcome to the Home page!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

function logout() {
  userStore.logout()
  router.push('/login')
}
</script> 