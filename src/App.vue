<script setup>
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div v-if="!userStore.ready" class="flex min-h-screen items-center justify-center">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="text-gray-500 text-lg">Loading...</span>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
