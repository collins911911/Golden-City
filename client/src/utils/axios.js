import axios from 'axios';

// Local:      http://localhost:5000/api
// Production: set VITE_API_URL in Vercel, e.g. https://golden-city-api.onrender.com/api
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('gc_user') || '{}'); } catch { return {}; }
};

instance.interceptors.request.use((config) => {
  const user = readUser();
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Expired / invalid session → clear it and send the user to the right login page
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url    = err.config?.url || '';
    if (status === 401 && !url.includes('/auth/')) {
      const wasAdmin = readUser()?.role === 'admin';
      localStorage.removeItem('gc_user');
      window.location.href = wasAdmin ? '/gc-admin' : '/member-login';
    }
    if (!err.response) {
      err.friendlyMessage = 'Cannot reach the server. Check your internet connection.';
    }
    return Promise.reject(err);
  }
);

// Pull a readable message out of any error
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || err?.friendlyMessage || fallback;

export default instance;
