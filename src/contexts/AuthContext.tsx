import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  profilePhotoUrl?: string;
  languagePreference?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string, isAdmin?: boolean, adminSecret?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions for localStorage
const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('globetrotter_token');
    const user = localStorage.getItem('globetrotter_user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  } catch {
    return { token: null, user: null };
  }
};

const setStoredAuth = (token: string, user: User) => {
  localStorage.setItem('globetrotter_token', token);
  localStorage.setItem('globetrotter_user', JSON.stringify(user));
};

const clearStoredAuth = () => {
  localStorage.removeItem('globetrotter_token');
  localStorage.removeItem('globetrotter_user');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredAuth();
      
      if (stored.token && stored.user) {
        // Verify token is still valid
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${stored.token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(stored.token);
          } else {
            // Token invalid, clear storage
            clearStoredAuth();
          }
        } catch (error) {
          // Network error, use stored data (offline support)
          setUser(stored.user);
          setToken(stored.token);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      setStoredAuth(data.token, data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (
    fullName: string, 
    email: string, 
    password: string,
    isAdmin: boolean = false,
    adminSecret?: string
  ) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (isAdmin && adminSecret) {
        headers['x-admin-secret'] = adminSecret;
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          fullName, 
          email, 
          password,
          role: isAdmin ? 'admin' : 'user'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      setStoredAuth(data.token, data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (token) {
        setStoredAuth(token, updatedUser);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { adminOnly?: boolean }
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    if (options?.adminOnly && !isAdmin) {
      window.location.href = '/dashboard';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
