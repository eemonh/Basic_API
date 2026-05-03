import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/users/refresh') {
      originalRequest._retry = true;
      try {
        await api.post('/api/users/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, you might want to redirect to login or handle it in AuthContext
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
