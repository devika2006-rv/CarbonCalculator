import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStats } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (payload: any) => Promise<{ needsProfileCompletion: boolean }>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  adminLogout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('cc_token');
    if (!token) {
      setUser(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setStats(data.stats);
      if (data.user.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing local credentials');
      localStorage.removeItem('cc_token');
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('cc_admin_token');
    if (adminToken) {
      setIsAdmin(true);
    }
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('cc_token', res.token);
    setUser(res.user);
    if (res.user.role === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('cc_admin_token', res.token);
    }
    await refreshUser();
  };

  const register = async (userData: any) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('cc_token', res.token);
    setUser(res.user);
    await refreshUser();
  };

  const googleLogin = async (payload: any) => {
    const res = await api.auth.googleLogin(payload);
    localStorage.setItem('cc_token', res.token);
    setUser(res.user);
    await refreshUser();
    return { needsProfileCompletion: res.needsProfileCompletion };
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.admin.login({ email, password });
    localStorage.setItem('cc_admin_token', res.token);
    // Also set cc_token so authenticated API calls work
    localStorage.setItem('cc_token', res.token);
    setIsAdmin(true);
    setUser(res.admin);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setUser(null);
    setStats(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('cc_admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        isAdmin,
        login,
        register,
        googleLogin,
        adminLogin,
        logout,
        adminLogout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
