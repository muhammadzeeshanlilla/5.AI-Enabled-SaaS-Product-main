import axios from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const ACCESS_KEY = 'insightflow_access';
const REFRESH_KEY = 'insightflow_refresh';

function storageAvailable() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export const authStore = {
  getAccess() {
    return storageAvailable() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefresh() {
    return storageAvailable() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  setTokens(access, refresh) {
    if (!storageAvailable()) return;
    if (access) window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens() {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
  hasSession() {
    return Boolean(this.getAccess() || this.getRefresh());
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const access = authStore.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = authStore.getRefresh();
  if (!refresh) throw new Error('No refresh token is available.');

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh }, { timeout: 20000 })
      .then((response) => {
        authStore.setTokens(response.data.access, response.data.refresh || refresh);
        return response.data.access;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function returnToLogin() {
  authStore.clearTokens();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes('/api/auth/login/')
      || original?.url?.includes('/api/auth/register/')
      || original?.url?.includes('/api/auth/token/refresh/');

    if (error.response?.status !== 401 || !original || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const access = await refreshAccessToken();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (refreshError) {
      returnToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error?.response) {
    return 'The backend is unavailable. Confirm that Django is running at the configured API address.';
  }

  const data = error.response.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) return String(data.detail);
  if (data?.error) return String(data.error);
  if (data && typeof data === 'object') {
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const entries = Array.isArray(value) ? value : [value];
      return entries.map((entry) => `${field === 'non_field_errors' ? '' : `${field}: `}${entry}`);
    });
    if (messages.length) return messages.join(' ');
  }
  return fallback;
}

export { API_BASE_URL };
export default api;
