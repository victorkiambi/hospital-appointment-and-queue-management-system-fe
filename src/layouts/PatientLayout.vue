<template>
  <div>
    <nav class="bg-white shadow flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-2">
        <span class="font-bold text-xl text-primary">Patient Dashboard</span>
      </div>
      <div class="relative">
        <button
          class="flex items-center gap-2 focus:outline-none"
          @click="toggleMenu"
        >
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
            {{ initials }}
          </div>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div v-if="showMenu" class="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100" @click.prevent="goToProfile">Profile</a>
          <button class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" @click="logout">Logout</button>
        </div>
      </div>
    </nav>
    <main class="p-8">
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
function goToProfile() {
  showMenu.value = false
  router.push('/patient/profile')
}
function logout() {
  userStore.logout()
  showMenu.value = false
  router.push('/login')
}
</script>
