<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Enhanced Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p class="text-sm text-gray-500">System Management & Analytics</p>
              </div>
            </div>
            
            <!-- Navigation Tabs -->
            <nav class="hidden md:flex ml-8 space-x-6">
              <a href="#overview" class="text-blue-600 border-b-2 border-blue-600 pb-2 px-1 text-sm font-medium">
                Overview
              </a>
              <a href="#users" class="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
                Users
              </a>
              <a href="#appointments" class="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
                Appointments
              </a>
              <a href="#reports" class="text-gray-500 hover:text-gray-700 pb-2 px-1 text-sm font-medium">
                Reports
              </a>
            </nav>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="p-2 text-gray-400 hover:text-gray-600 relative">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3.5-5.25 1.5-5.25H12l1.5 5.25L10 17h5z" />
              </svg>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            <!-- User Dropdown -->
            <div class="relative">
              <button
                class="flex items-center gap-2 focus:outline-none"
                @click="toggleMenu"
              >
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {{ initials }}
                </div>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <div class="px-4 py-3 border-b">
                  <p class="text-sm font-medium text-gray-900">{{ userStore.user?.name }}</p>
                  <p class="text-xs text-gray-500">Administrator</p>
                </div>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Activity Log</a>
                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="logout">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const showMenu = ref(false)

const initials = computed(() => {
  const name = userStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function logout() {
  userStore.logout()
  showMenu.value = false
  router.push('/login')
}
</script>
