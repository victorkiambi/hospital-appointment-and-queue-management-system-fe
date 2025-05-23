import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/doctor/dashboard',
    name: 'DoctorDashboard',
    component: () => import('../pages/doctor/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/patient/dashboard',
    name: 'PatientDashboard',
    component: () => import('../pages/patient/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'patient' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/Register.vue'),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/ForgotPassword.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Global route guard for authentication and role-based access
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/forgot-password']
  const requiresAuth = to.meta.requiresAuth
  const userStore = useUserStore()

  if (requiresAuth && !userStore.isAuthenticated) {
    return next('/login')
  }

  // Role-based protection
  if (to.meta.role && userStore.role !== to.meta.role) {
    // Redirect to the correct dashboard if logged in but wrong role
    if (userStore.role === 'admin') return next('/admin/dashboard')
    if (userStore.role === 'doctor') return next('/doctor/dashboard')
    if (userStore.role === 'patient') return next('/patient/dashboard')
    return next('/login')
  }

  next()
})

export default router 