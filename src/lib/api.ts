import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Type definitions
export interface StudentBase {
  name: string;
  roll_number: string;
  class_name: string;
  grade: string;
}

export interface Student extends StudentBase {
  _id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCreateData extends StudentBase {}

export interface StudentUpdateData extends Partial<StudentBase> {}

// API Response types (kept for future use)
type ErrorResponse = {
  message: string;
  detail?: string;
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with requests
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        const { access_token } = response.data;
        
        // Save the new token
        localStorage.setItem('access_token', access_token);
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Student API functions
export const studentApi = {
  // List all students
  getStudents: (): Promise<Student[]> => 
    api.get<Student[]>('/api/v1/students').then(res => res.data),

  // Create a new student (admin only)
  createStudent: (studentData: StudentCreateData): Promise<Student> => 
    api.post<Student>('/api/v1/students', studentData).then(res => res.data),

  // Update an existing student (admin only)
  updateStudent: (rollNumber: string, studentData: StudentUpdateData): Promise<Student> => 
    api.put<Student>(`/api/v1/students/${rollNumber}`, studentData).then(res => res.data),

  // Delete a student (admin only)
  deleteStudent: (rollNumber: string): Promise<{ success: boolean }> => 
    api.delete(`/api/v1/students/${rollNumber}`).then(() => ({ success: true }))
};

// Types
export interface TokenRequest {
  access_token: string;
}

// Auth API functions
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/api/v1/auth/login', new URLSearchParams(credentials), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  
  register: (userData: any) => 
    api.post('/api/v1/auth/register', userData).then(res => res.data),
  
  refreshToken: () => 
    api.post('/api/v1/auth/refresh').then(res => res.data),
    
  logout: () => 
    api.post('/api/v1/auth/logout').then(res => res.data),
    
  // Get current user using access token
  getCurrentUser: (token: string) =>
    api.post('/api/v1/auth/me', { access_token: token }).then(res => res.data),
};

export default api;
