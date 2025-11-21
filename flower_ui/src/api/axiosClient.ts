import axios, { AxiosInstance } from 'axios';

// Centralized Axios instance for the frontend MVP
// Use relative URLs like '/api/...' and rely on dev proxy to backend during development.
const instance: AxiosInstance = axios.create({
  baseURL: ''
});

export default instance;
