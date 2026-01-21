import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? '' // ✅ dev에서는 vite proxy 타게
  : import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
