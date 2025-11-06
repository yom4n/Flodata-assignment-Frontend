import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';

type User = {
  username: string;
  email: string;
  role: 'admin' | 'user';
  full_name: string;
  disabled: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    password: string;
  }) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const userData = await authApi.getCurrentUser(token);
            setUser({
              username: userData.username,
              email: userData.email,
              full_name: userData.full_name || '',
              role: userData.role || 'user',
              disabled: userData.disabled || false,
            });
          } catch (err) {
            console.error('Failed to validate token', err);
            // Clear invalid token
            localStorage.removeItem('access_token');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to check auth status', err);
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.login({ username, password });
      const { access_token, user } = response.data;
      
      // Store the access token in memory
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', user);
      
      // Set the user in the auth context
      setUser({
        username: user.username,
        email: user.email,
        full_name: user.full_name || '',
        role: user.role || 'user',
        disabled: user.disabled || false,
      });
      
      console.log("User set in context");
      
      // Redirect to the previous location or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      console.log("Navigation complete")
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  }, [navigate, location.state]);

  const register = useCallback(async (data: {
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    password: string;
  }) => {
    try {
      setError(null);
      await authApi.register(data);
      // After successful registration, log the user in
      await login(data.username, data.password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
