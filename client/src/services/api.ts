import {
  User,
  UserStats,
  CalculationInputs,
  CalculationResult,
  CalculationRecord,
  Challenge,
  EmissionFactor,
  CommunityOverview,
  InstitutionLeaderboardItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (userData: any) => request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials: any) => request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    googleLogin: (payload: any) => request<{ message: string; token: string; user: User; needsProfileCompletion: boolean }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    getMe: () => request<{ user: User; stats: UserStats }>('/auth/me'),
    updateProfile: (profile: Partial<User>) => request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
    changePassword: (passwords: { currentPassword: string; newPassword: string }) => request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    }),
  },

  calculator: {
    getFactors: () => request<{ factors: EmissionFactor[] }>('/calculator/factors'),
    calculate: (inputs: CalculationInputs) => request<CalculationResult>('/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),
    save: (inputs: CalculationInputs) => request<{ message: string; id: number; result: CalculationResult; newBadgeAwarded: any }>('/calculator/save', {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),
    getHistory: () => request<{ history: CalculationRecord[] }>('/calculator/history'),
  },

  challenges: {
    list: () => request<{ challenges: Challenge[] }>('/challenges'),
    complete: (id: number, notes?: string) => request<{ message: string; pointsEarned: number; totalPoints: number; newBadges: any[] }>(`/challenges/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
    getUserHistory: () => request<{ history: any[] }>('/challenges/user-history'),
  },

  community: {
    getOverview: () => request<{ overview: CommunityOverview; categoryCounts: any[]; districtCounts: any[] }>('/community/overview'),
    getInstitutions: (district?: string, type?: string) => {
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (type) params.append('type', type);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ institutions: InstitutionLeaderboardItem[] }>(`/community/institutions${query}`);
    },
    getDistricts: () => request<{ districts: any[] }>('/community/districts'),
  },

  contact: {
    submit: (enquiry: { name: string; email: string; category: string; message: string }) => request<{ message: string; id: number }>('/contact', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    }),
  },

  admin: {
    login: (credentials: { email: string; password: string }) => request<{ message: string; token: string; admin: User }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    getOverview: () => request<{ stats: any; categories: any[]; districts: any[]; institutions: any[] }>('/admin/overview'),
    getUsers: (filters: any) => {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(filters)) {
        if (val) params.append(key, String(val));
      }
      return request<{ users: any[]; pagination: any }>(`/admin/users?${params.toString()}`);
    },
    deleteUser: (id: number) => request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
    getAnalytics: () => request<{ calcsOverTime: any[]; challengeStats: any[]; categoryAverages: any }>('/admin/analytics'),
    getEnquiries: () => request<{ enquiries: any[] }>('/admin/enquiries'),
  }
};
