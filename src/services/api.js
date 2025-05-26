import axios from 'axios'
import { getToken } from '../utils/token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  // Removed withCredentials for token-based auth
})

// Add Authorization header if token is present
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export async function login(email, password) {
  // No CSRF needed for token-based auth
  return api.post('/login', { email, password })
}

export async function register(name, email, password) {
  return api.post('/register', { name, email, password })
}

export async function forgotPassword(email) {
  return api.post('/forgot-password', { email })
}

export async function getAppointments({ doctorId, patientId, page = 1, perPage = 20 } = {}) {
  let query = [];
  if (doctorId) query.push(`doctor_id=${doctorId}`);
  if (patientId) query.push(`patient_id=${patientId}`);
  if (page) query.push(`page=${page}`);
  if (perPage) query.push(`per_page=${perPage}`);
  const queryString = query.length ? `?${query.join('&')}` : '';
  return api.get(`/appointments${queryString}`);
}

export async function getQueues({ doctorId, patientId } = {}) {
  let query = [];
  if (doctorId) query.push(`doctor_id=${doctorId}`);
  if (patientId) query.push(`patient_id=${patientId}`);
  const queryString = query.length ? `?${query.join('&')}` : '';
  return api.get(`/queues${queryString}`);
}

export async function getUsers() {
  return api.get('/users');
}

export async function getStats() {
  return api.get('/admin/statistics/summary');
}

export async function createDoctor({ name, email, password, specialization, availability }) {
  return api.post('/admin/users/doctor', { name, email, password, specialization, availability });
}

export async function callPatient(queueId) {
  return api.patch(`/queues/${queueId}`, {
    status: 'called',
    called_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });
}

// You can add register, logout, etc. here as needed

export default api 