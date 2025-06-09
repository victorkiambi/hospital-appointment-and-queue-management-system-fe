import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '../utils/token';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: import.meta.env.VITE_API_BASE_URL + '/broadcasting/auth',
  withCredentials: false,
  auth: {
    headers: {
      Authorization: () => {
        const token = getToken();
        return token ? `Bearer ${token}` : '';
      }
    }
  }
});

export default echo;