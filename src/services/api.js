import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Update to your backend API base URL
  withCredentials: true, // Needed for Sanctum/cookie auth
})

// Helper to get CSRF cookie from Laravel Sanctum
async function getCsrfCookie() {
  // This must use the backend root, not /api
  await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
}

// Helper to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Set X-XSRF-TOKEN header for all requests if cookie is present
api.interceptors.request.use(config => {
  const xsrfToken = getCookie('XSRF-TOKEN');
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  return config;
});

export async function login(email, password) {
  await getCsrfCookie()
  return api.post('/login', { email, password })
}

export async function register(name, email, password) {
  await getCsrfCookie()
  return api.post('/register', { name, email, password })
}

export async function forgotPassword(email) {
  await getCsrfCookie()
  return api.post('/forgot-password', { email })
}

// You can add register, logout, etc. here as needed

export default api 