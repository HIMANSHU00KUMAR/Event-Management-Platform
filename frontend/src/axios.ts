import axios from 'axios';




const api = axios.create({
  baseURL: 'https://event-management-platform-frae.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("api from axios ts", api);

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;