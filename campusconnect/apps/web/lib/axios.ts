import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/proxy',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // forward cookies (access_token) through proxy
});

// Normalize error messages so slices/thunks always get strings
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const raw =
      err?.response?.data?.message ??
      err?.response?.data ??
      err?.message ??
      'Request failed';
    const message = typeof raw === 'string' ? raw : 'Request failed';
    return Promise.reject(new Error(message));
  }
);