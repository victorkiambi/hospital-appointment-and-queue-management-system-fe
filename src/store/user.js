import { defineStore } from 'pinia'
import api from '../services/api'
import { setToken, getToken, removeToken } from '../utils/token'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    ready: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role || null,
  },
  actions: {
    async login(email, password) {
      // 1. Login and get token
      const response = await api.post('/login', { email, password })
      const token = response.data.token
      if (token) {
        setToken(token)
        // 2. Hydrate user state
        await this.restoreSession()
        return response
      } else {
        throw new Error('No token returned from login')
      }
    },
    async restoreSession() {
      this.ready = false
      try {
        const token = getToken()
        if (!token) {
          this.user = null
          this.ready = true
          return
        }
        const response = await api.get('/user')
        this.user = response.data.data
      } catch (e) {
        this.user = null
      } finally {
        this.ready = true
      }
    },
    logout() {
      this.user = null
      removeToken()
    },
    setUser(user) {
      this.user = user
    }
  }
}) 