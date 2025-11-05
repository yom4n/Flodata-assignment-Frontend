import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    // In a real app, you would verify the session with your backend
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // In a real app, you would make an API call to your backend
    // For demo purposes, we'll simulate a successful login
    const mockUser = {
      id: '1',
      email,
      role: email.includes('admin') ? 'admin' as const : 'user' as const
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    navigate('/dashboard');
  };

  const register = async (email: string, _password: string, role: 'user' | 'admin') => {
    // In a real app, you would make an API call to your backend
    // For demo purposes, we'll simulate a successful registration
    const mockUser = {
      id: Date.now().toString(),
      email,
      role
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
