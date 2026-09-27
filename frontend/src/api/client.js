import axios from 'axios';

// Connect seamlessly to FastAPI backend server running on port 8000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject JWT access token if authenticated
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinema_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle unauthorized token expiration cleanly
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired tokens automatically
      localStorage.removeItem('cinema_jwt_token');
      localStorage.removeItem('cinema_user');
      // We let the component handle redirect or auth dialog toggle
    }
    return Promise.reject(error);
  }
);

export default client;
