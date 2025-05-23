import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, forgotPassword as forgotPasswordApi } from '../services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    success: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role || null,
  },
  actions: {
    setUser(user) {
      this.user = user
    },
    setToken(token) {
      this.token = token
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_token')
    },
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await loginApi(email, password)
        // Store all user fields, including doctor_id and patient_id
        this.user = response.data.data?.user || null
        this.token = response.data.data?.token || null
        if (this.token) {
          localStorage.setItem('auth_token', this.token)
        }
        // Defensive: ensure doctor_id and patient_id are always present
        if (this.user) {
          if (!('doctor_id' in this.user)) this.user.doctor_id = null
          if (!('patient_id' in this.user)) this.user.patient_id = null
        }
        return response
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },
    async register(name, email, password) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const response = await registerApi(name, email, password)
        this.success = 'Registration successful. Please log in.'
        return response
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },
    async forgotPassword(email) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const response = await forgotPasswordApi(email)
        this.success = 'Password reset link sent. Check your email.'
        return response
      } catch (err) {
        this.error = err.response?.data?.message || 'Request failed'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}) 