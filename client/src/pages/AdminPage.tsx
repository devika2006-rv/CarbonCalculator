import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building,
  Calculator,
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Search,
  Filter,
  Trash2,
  Lock,
  Mail,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminPageProps {
  setActiveTab: (tab: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ setActiveTab }) => {
  const { user, isAdmin, adminLogin, adminLogout } = useAuth();

  // Admin Login Credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Sub-Tab
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'analytics' | 'enquiries' | 'exports'>('overview');

  // Overview data
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Users Management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userCategoryFilter, setUserCategoryFilter] = useState('');
  const [userDistrictFilter, setUserDistrictFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Export controls state
  const [exportType, setExportType] = useState<'users' | 'calculations' | 'institutions'>('users');
  const [isDownloading, setIsDownloading] = useState(false);

  // Load Overview Data
  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await api.admin.getOverview();
      setOverview(res);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Users Data with filters
  const loadUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const res = await api.admin.getUsers({
        search: userSearch,
        category: userCategoryFilter,
        district: userDistrictFilter,
        page,
        limit: 15
      });
      setUsersList(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Analytics Data
  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await api.admin.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load Enquiries
  const loadEnquiries = async () => {
    try {
      setLoadingEnquiries(true);
      const res = await api.admin.getEnquiries();
      setEnquiries(res.enquiries);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (adminTab === 'overview') loadOverview();
      else if (adminTab === 'users') loadUsers(pagination.page);
      else if (adminTab === 'analytics') loadAnalytics();
      else if (adminTab === 'enquiries') loadEnquiries();
    }
  }, [isAdmin, adminTab]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      await adminLogin(adminEmail, adminPassword);
      loadOverview();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrative credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm(`Are you sure you want to purge user #${id} pursuant to a data removal request? This action permanently clears their calculation history.`)) {
      return;
    }

    try {
      const res = await api.admin.deleteUser(id);
      setUserActionMessage(res.message);
      loadUsers(pagination.page);
      setTimeout(() => setUserActionMessage(null), 5000);
    } catch (err: any) {
      setUserActionMessage(`Error: ${err.message || 'Failed to delete'}`);
    }
  };

  // Direct download triggers using authenticated token
  const handleDownload = (endpoint: string, fallbackFilename: string) => {
    const token = localStorage.getItem('cc_admin_token') || localStorage.getItem('cc_token');
    const apiBase = import.meta.env.VITE_API_BASE || '';
    const targetUrl = endpoint.startsWith('http')
      ? endpoint
      : (apiBase && endpoint.startsWith('/api') ? `${apiBase.replace(/\/api\/?$/, '')}${endpoint}` : endpoint);
    fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fallbackFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        alert(`Export error: ${err.message}`);
      });
  };

  // If not authenticated as Admin, show separate Admin Login Portal
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-left">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-500">
              Authorized access for VAST Energy Cell coordinators & programme administrators.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="admin@vastenergycell.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Enter administrator password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-sm"
            >
              <span>{isLoggingIn ? 'Verifying...' : 'Authorize Access'}</span>
            </button>
          </form>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 text-center space-y-1">
            <span className="font-semibold">Coordinators default credentials:</span>
            <button
              type="button"
              onClick={() => {
                setAdminEmail('admin@vastenergycell.in');
                setAdminPassword('vastEnergyCell@2026');
              }}
              className="font-mono text-amber-950 font-bold underline block mx-auto hover:text-black cursor-pointer text-xs"
            >
              Click to autofill: admin@vastenergycell.in / vastEnergyCell@2026
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      {/* Top Banner & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">CarbonCalculator System Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Administrative Operations & Reporting
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition-colors"
          >
            Back to Website
          </button>
          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Platform Overview', icon: TrendingUp },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'analytics', label: 'Usage Analytics', icon: Calculator },
          { id: 'enquiries', label: 'Contact Messages', icon: Mail },
          { id: 'exports', label: 'Reports & Data Export', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {overview ? (
            <>
              {/* 6 Key Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Users</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalUsers}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Registered</span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Institutions</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalInstitutions}</p>
                  <span className="text-[10px] text-sky-700 font-semibold">Participating</span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Calculations</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalCalculations}</p>
                  <span className="text-[10px] text-amber-700 font-semibold">Logged</span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Challenges</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalChallenges}</p>
                  <span className="text-[10px] text-purple-700 font-semibold">Completed</span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Green Points</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalGreenPoints}</p>
                  <span className="text-[10px] text-emerald-700 font-semibold">Awarded</span>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Active (30d)</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.activeUsers}</p>
                  <span className="text-[10px] text-indigo-700 font-semibold">Recent logins</span>
                </div>
              </div>

              {/* Institutions & Districts Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    Top Participating Educational Institutions
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    {overview.institutions.map((inst: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{inst.institution_name}</p>
                          <span className="text-[10px] text-slate-500">{inst.district} • {inst.institution_type}</span>
                        </div>
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {inst.student_count} users
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    District-Wise Participation
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    {overview.districts.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800">{d.district}</span>
                        <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          {d.count} users
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Loading overview...</div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: USER DIRECTORY & MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Registered Users Directory</h3>
              <p className="text-xs text-slate-500">Filter, search, inspect engagement, and process account removal requests.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name or email..."
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none"
              />
              <select
                value={userCategoryFilter}
                onChange={(e) => setUserCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Student">Student</option>
                <option value="NSS Volunteer">NSS Volunteer</option>
                <option value="Teacher">Teacher</option>
                <option value="General Public">General Public</option>
              </select>
              <button
                onClick={() => loadUsers(1)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Search
              </button>
            </div>
          </div>

          {userActionMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
              {userActionMessage}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Name & Email</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Institution</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Registered</th>
                  <th className="py-2.5 px-3">Calculations</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {u.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {u.institution_name || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{u.district}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{u.calc_count}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{u.total_points} pts</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Purge record (Data Removal Request)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadUsers(pagination.page - 1)}
                className="p-1 rounded-md border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadUsers(pagination.page + 1)}
                className="p-1 rounded-md border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: USAGE ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              {/* Calculations Timeline Chart */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Carbon Calculator Usage Over Time (Last 30 Days)
                </h3>
                <div className="h-60 w-full">
                  {analytics.calcsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.calcsOverTime}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Calculations"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      No calculations recorded in the last 30 days yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Challenge Completion Engagements */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Green Challenge Engagement Counts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {analytics.challengeStats.map((cs: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div className="max-w-[75%]">
                        <p className="font-bold text-slate-900 truncate">{cs.title}</p>
                        <span className="text-[10px] text-slate-500">{cs.category} • {cs.difficulty}</span>
                      </div>
                      <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-1 rounded-md text-xs">
                        {cs.completion_count} done
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Loading analytics...</div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: ENQUIRIES */}
      {adminTab === 'enquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-5 h-5 text-emerald-600" />
            Received Contact Messages & Suggestions ({enquiries.length})
          </h3>

          <div className="space-y-3">
            {enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div key={enq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{enq.name}</span>
                      <span className="text-slate-400 font-mono">({enq.email})</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                        {enq.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(enq.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    {enq.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No feedback or enquiry messages submitted yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: REPORTS & DATA EXPORT CENTER (Major Requirement) */}
      {adminTab === 'exports' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Export Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Official Reports & Database Backup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Export real platform records in open standard formats (CSV, XLSX, PDF) or download complete database binary and JSON snapshots.
              </p>
            </div>

            {/* Export Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CSV Exporter */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">CSV Spreadsheet Export</h4>
                    <span className="text-[11px] text-slate-500">Comma-separated values</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleDownload('/api/admin/export/csv?type=users', 'carboncalculator-users.csv')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>Registered Users CSV</span>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => handleDownload('/api/admin/export/csv?type=calculations', 'carboncalculator-calculations.csv')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>Footprint Calculations CSV</span>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => handleDownload('/api/admin/export/csv?type=institutions', 'carboncalculator-institutions.csv')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>Institutions Summary CSV</span>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Excel XLSX Exporter */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Multi-Sheet Excel (XLSX)</h4>
                    <span className="text-[11px] text-slate-500">Includes Users, Calcs & Challenges</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Comprehensive workbook containing synchronized sheets for participants, emission records, institutional rankings, and challenge completions.
                </p>

                <button
                  onClick={() => handleDownload('/api/admin/export/xlsx', 'carboncalculator-comprehensive.xlsx')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download XLSX Workbook</span>
                </button>
              </div>

              {/* Formatted PDF Report */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Executive PDF Report</h4>
                    <span className="text-[11px] text-slate-500">Formatted for print & archives</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Formatted summary report with official VAST Energy Cell header, key performance indicators, and institutional participation tables.
                </p>

                <button
                  onClick={() => handleDownload('/api/admin/export/pdf', 'carboncalculator-official-report.pdf')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            </div>

            {/* Database Direct Backup & Disaster Recovery Section */}
            <div className="p-6 bg-emerald-950 text-white rounded-2xl space-y-4 border border-emerald-900">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-base">Database Backup & Portability</h4>
                  <p className="text-xs text-emerald-200">
                    Direct raw SQLite binary and portable JSON dumps ensure zero cloud vendor lock-in.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => handleDownload('/api/admin/backup/db', 'carboncalculator-backup.db')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Raw Database (.db)</span>
                </button>

                <button
                  onClick={() => handleDownload('/api/admin/backup/json', 'carboncalculator-dump.json')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full JSON Dump</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
