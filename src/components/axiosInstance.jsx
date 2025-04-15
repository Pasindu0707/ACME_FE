// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://acme-be.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


// You can add interceptors if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
      if (error.response && error.response.status === 404) {
          console.error('404 error on:', error.response.config.url);
      }
      return Promise.reject(error);
  }
);


export default axiosInstance;
