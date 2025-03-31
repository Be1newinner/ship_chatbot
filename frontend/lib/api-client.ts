import { API_URL } from '@/utils/api';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create an Axios instance with the correct base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token and check expiration
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    // If token exists, check if it's expired
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // If token is expired, clear localStorage and redirect to login
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject('Token expired');
        }

        // Add token to request headers
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject('Invalid token');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

