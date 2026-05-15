import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('cinelog_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// On 401, clear auth and redirect
api.interceptors.response.use(
  r => {
    // Show success message if it's a mutation and has a message
    if (r.config.method !== 'get' && r.data && r.data.message) {
      window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'success', message: r.data.message } }));
    }
    return r;
  },
  err => {
    // Only redirect to login for 401s if the request wasn't the login request itself
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('cinelog_token');
      localStorage.removeItem('cinelog_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      // Don't show toast for 401s if we are redirecting to login, but show for other errors
      const errMsg = err.response?.data?.error || err.message || 'An error occurred';
      window.dispatchEvent(new CustomEvent('cinelog-toast', { detail: { type: 'error', message: errMsg } }));
    }
    return Promise.reject(err);
  }
);

export default api;
