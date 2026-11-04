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

export function createDefaultStats(points = 0, calcs = 0, challenges = 0, badges = 0): UserStats {
  return {
    totalPoints: points,
    calcCount: calcs,
    challengeCount: challenges,
    badgesCount: badges,
    badges: [],
    latestCalc: null
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('cc_token');
    const storedUser = localStorage.getItem('cc_current_user');

    if (!token && !storedUser) {
      setUser(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setStats(data.stats);
      if (data.user.role === 'admin' || localStorage.getItem('cc_admin_token')) {
        setIsAdmin(true);
      }
    } catch {
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          if (parsed.role === 'admin' || localStorage.getItem('cc_admin_token')) {
            setIsAdmin(true);
          }
          setStats(createDefaultStats(0, 0, 0, 0));
        } catch {
          setUser(null);
          setStats(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('cc_admin_token');
    const storedUser = localStorage.getItem('cc_current_user');
    if (adminToken) {
      setIsAdmin(true);
    }
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role === 'admin') setIsAdmin(true);
      } catch {}
    }
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('cc_token', res.token);
    localStorage.setItem('cc_current_user', JSON.stringify(res.user));
    setUser(res.user);
    if (res.user.role === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('cc_admin_token', res.token);
    }
    setStats(createDefaultStats(0, 0, 0, 0));
    refreshUser();
  };

  const register = async (userData: any) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('cc_token', res.token);
    localStorage.setItem('cc_current_user', JSON.stringify(res.user));
    setUser(res.user);
    setStats(createDefaultStats(0, 0, 0, 0));
    refreshUser();
  };

  const googleLogin = async (payload: any) => {
    const res = await api.auth.googleLogin(payload);
    localStorage.setItem('cc_token', res.token);
    localStorage.setItem('cc_current_user', JSON.stringify(res.user));
    setUser(res.user);
    setStats(createDefaultStats(0, 0, 0, 0));
    refreshUser();
    return { needsProfileCompletion: res.needsProfileCompletion };
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.admin.login({ email, password });
    localStorage.setItem('cc_admin_token', res.token);
    localStorage.setItem('cc_token', res.token);
    localStorage.setItem('cc_current_user', JSON.stringify(res.admin));
    setIsAdmin(true);
    setUser(res.admin);
    setStats(createDefaultStats(0, 0, 0, 0));
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_admin_token');
    localStorage.removeItem('cc_current_user');
    setUser(null);
    setStats(null);
    setIsAdmin(false);
  };

  const adminLogout = () => {
    localStorage.removeItem('cc_admin_token');
    localStorage.removeItem('cc_current_user');
    setIsAdmin(false);
    setUser(null);
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
