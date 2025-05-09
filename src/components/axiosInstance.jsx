// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://acme-be.vercel.app',
    // baseURL: 'http://localhost:3500',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


// You can add interceptors if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage'); // Debug log
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error); // Debug log
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data); // Debug log
    if (error.response && error.response.status === 404) {
      console.error('404 error on:', error.response.config.url);
    }
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized - Token might be invalid or expired');
      // Clear token if unauthorized
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
