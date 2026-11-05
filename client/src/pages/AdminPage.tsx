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
  ChevronRight,
  Clock,
  UserCheck,
  UserX,
  XCircle,
  Camera,
  Check,
  X,
  Eye,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { ChallengeSubmission } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
  const [adminTab, setAdminTab] = useState<'overview' | 'verifications' | 'users' | 'analytics' | 'enquiries' | 'exports'>('overview');

  // Overview data
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Verifications State (Photo proof audit)
  const [submissionsList, setSubmissionsList] = useState<ChallengeSubmission[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState({ total: 0, needsReview: 0, verified: 0, rejected: 0 });
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<'all' | 'needs_review' | 'verified' | 'rejected'>('needs_review');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedProofForModal, setSelectedProofForModal] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ submission: ChallengeSubmission; action: 'approve' | 'reject'; reason: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Users Management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userCategoryFilter, setUserCategoryFilter] = useState('');
  const [userDistrictFilter, setUserDistrictFilter] = useState('');
  const [userProfileStatusFilter, setUserProfileStatusFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Audit, Refresh & Connection Status
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'live' | 'local'>('live');

  // Load Overview Data
  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await api.admin.getOverview();
      setOverview(res);
      setLastUpdated(new Date());
      setConnectionStatus('live');
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setConnectionStatus('local');
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Submissions Data
  const loadSubmissions = async (status = submissionStatusFilter) => {
    try {
      setLoadingSubmissions(true);
      const res = await api.admin.getSubmissions(status);
      setSubmissionsList(res.submissions || []);
      setSubmissionCounts(res.counts || { total: 0, needsReview: 0, verified: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load challenge submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Review submission action (Approve / Reject)
  const handleReviewAction = async () => {
    if (!reviewDialog) return;
    try {
      setIsSubmittingReview(true);
      const res = await api.admin.reviewSubmission(reviewDialog.submission.id, reviewDialog.action, reviewDialog.reason);
      setReviewSuccessMsg(res.message);
      setReviewDialog(null);
      await loadSubmissions(submissionStatusFilter);
      await loadOverview();
      setTimeout(() => setReviewSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Review error: ${err.message || 'Failed to submit review'}`);
    } finally {
      setIsSubmittingReview(false);
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
        profile_status: userProfileStatusFilter,
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

  // Global manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (adminTab === 'overview') await loadOverview();
      else if (adminTab === 'verifications') await loadSubmissions(submissionStatusFilter);
      else if (adminTab === 'users') await loadUsers(pagination.page);
      else if (adminTab === 'analytics') await loadAnalytics();
      else if (adminTab === 'enquiries') await loadEnquiries();
      // Always refresh badge count
      const countsRes = await api.admin.getSubmissions('all', 1, 1).catch(() => null);
      if (countsRes?.counts) setSubmissionCounts(countsRes.counts);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (adminTab === 'overview') loadOverview();
      else if (adminTab === 'verifications') loadSubmissions(submissionStatusFilter);
      else if (adminTab === 'users') loadUsers(pagination.page);
      else if (adminTab === 'analytics') loadAnalytics();
      else if (adminTab === 'enquiries') loadEnquiries();

      // Keep badge updated
      api.admin.getSubmissions('all', 1, 1).then(res => {
        if (res?.counts) setSubmissionCounts(res.counts);
      }).catch(() => {});
    }
  }, [isAdmin, adminTab, submissionStatusFilter]);

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
    if (!window.confirm(`Are you sure you want to permanently purge user #${id} pursuant to a data removal request? This action cannot be undone.`)) {
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

  const handleResetFilters = () => {
    setUserSearch('');
    setUserCategoryFilter('');
    setUserDistrictFilter('');
    setUserProfileStatusFilter('');
    // Trigger load immediately
    setTimeout(() => loadUsers(1), 0);
  };

  // Direct download triggers using authenticated token with client-side fallback
  const handleDownload = (endpoint: string, fallbackFilename: string, exportTypeKey?: 'users' | 'calculations' | 'institutions') => {
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
        if (!res.ok) throw new Error('Server download endpoint unavailable');
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
      .catch(() => {
        // Honest client-side export fallback directly from actual records in memory/storage
        let content = '';
        let mime = 'text/csv';

        if (fallbackFilename.endsWith('.json')) {
          const registered = JSON.parse(localStorage.getItem('cc_registered_users') || '[]');
          const history = JSON.parse(localStorage.getItem('cc_user_history') || '[]');
          const completed = JSON.parse(localStorage.getItem('cc_completed_challenges') || '[]');
          const enquiries = JSON.parse(localStorage.getItem('cc_contact_enquiries') || '[]');
          content = JSON.stringify({
            platform: 'CarbonCalculator - VAST Energy Cell',
            exported_at: new Date().toISOString(),
            tables: { users: registered, carbon_calculations: history, user_challenge_completions: completed, enquiries }
          }, null, 2);
          mime = 'application/json';
        } else {
          // CSV export
          if (exportTypeKey === 'users') {
            const registered = JSON.parse(localStorage.getItem('cc_registered_users') || '[]');
            const rows = registered.length > 0 ? registered : usersList;
            content = 'ID,Name,Email,Category,Institution,District,Registered At,Last Login,Green Points\n';
            for (const u of rows) {
              content += `${u.id},"${(u.name || '').replace(/"/g, '""')}","${(u.email || '').replace(/"/g, '""')}","${u.category}","${(u.institution_name || '').replace(/"/g, '""')}","${u.district}","${u.created_at}","${u.last_login_at || 'Never'}","${u.total_points || 0}"\n`;
            }
          } else if (exportTypeKey === 'calculations') {
            const history = JSON.parse(localStorage.getItem('cc_user_history') || '[]');
            content = 'ID,Daily CO2 (kg),Monthly CO2 (kg),Annual CO2 (tonnes),Electricity (kg),Transport (kg),Food (kg),Plastic (kg),Waste (kg),Lifestyle (kg),Calculated At\n';
            for (const h of history) {
              content += `${h.id},${h.daily_co2_kg},${h.monthly_co2_kg},${h.annual_co2_tonnes},${h.electricity_co2_kg},${h.transport_co2_kg},${h.food_co2_kg},${h.plastic_co2_kg},${h.waste_co2_kg},${h.lifestyle_co2_kg},"${h.calculated_at}"\n`;
            }
          } else {
            const institutions = overview?.institutions || [];
            content = 'Institution Name,Type,District,Registered Users,Active Participants,Calculations,Green Points\n';
            for (const inst of institutions) {
              content += `"${(inst.institution_name || '').replace(/"/g, '""')}","${inst.institution_type}","${inst.district}",${inst.registered_count || inst.student_count || 0},${inst.participating_count || 0},${inst.calculation_count || 0},${inst.total_points || 0}\n`;
            }
          }
        }

        const blob = new Blob([content], { type: mime });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fallbackFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
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
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      {/* Top Banner & Navigation Header with Live Status & Audit Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase">
              Admin Portal
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real Database Records
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Administrative Operations & Reporting
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition-colors"
            title="Re-query database for latest records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
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
        {([
          { id: 'overview', label: 'Platform Overview', icon: TrendingUp },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'analytics', label: 'Usage Analytics', icon: Calculator },
          { id: 'enquiries', label: 'Contact Messages', icon: Mail },
          { id: 'exports', label: 'Reports & Data Export', icon: Download },
        ] as { id: string; label: string; icon: any; badge?: number }[]).map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all relative ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {loadingOverview ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium">Querying real database records...</p>
            </div>
          ) : overview ? (
            <>
              {/* 6 Key Stat Cards Connected Strictly to Database */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* 1. Registered Users */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Users</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalUsers}</p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-emerald-700 font-semibold block">
                      {overview.stats.completedProfiles} completed profiles
                    </span>
                    {overview.stats.newRegistrations7d !== undefined && (
                      <span className="text-slate-400 block">
                        +{overview.stats.newRegistrations7d} this week
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Active Users (Authentications Only) */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Active (7d)</span>
                  <p className="text-2xl font-bold text-slate-900">
                    {overview.stats.activeUsers7d !== undefined ? overview.stats.activeUsers7d : overview.stats.activeUsers}
                  </p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-indigo-700 font-semibold block">
                      {overview.stats.activeUsers30d !== undefined ? `${overview.stats.activeUsers30d} active (30d)` : 'Recent logins'}
                    </span>
                    <span className="text-slate-400 block">Authenticated logins</span>
                  </div>
                </div>

                {/* 3. Saved Calculations */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Calculations</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalCalculations}</p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-amber-700 font-semibold block">
                      {overview.stats.calcsToday || 0} today • {overview.stats.calcsThisMonth || 0} this month
                    </span>
                    <span className="text-slate-400 block">Saved footprint audits</span>
                  </div>
                </div>

                {/* 4. Challenges Completed */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Challenges</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalChallenges}</p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-purple-700 font-semibold block">
                      {overview.stats.uniqueChallengeUsers || 0} participants
                    </span>
                    <span className="text-slate-400 block">Verified completions</span>
                  </div>
                </div>

                {/* 5. Green Points */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Green Points</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalGreenPoints}</p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-emerald-700 font-semibold block">Awarded to users</span>
                    <span className="text-slate-400 block">From genuine activity</span>
                  </div>
                </div>

                {/* 6. Institutions */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">Institutions</span>
                  <p className="text-2xl font-bold text-slate-900">{overview.stats.totalInstitutions}</p>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span className="text-sky-700 font-semibold block">Colleges & Schools</span>
                    <span className="text-slate-400 block">Registered partners</span>
                  </div>
                </div>
              </div>

              {/* Institutions & Districts Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institutions Table */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" />
                      Participating Educational Institutions
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {overview.institutions?.length || 0} registered
                    </span>
                  </div>

                  {overview.institutions && overview.institutions.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
                      {overview.institutions.map((inst: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                          <div className="max-w-[70%]">
                            <p className="font-bold text-slate-800 truncate">{inst.institution_name}</p>
                            <span className="text-[10px] text-slate-500">
                              {inst.district} • {inst.institution_type}
                              {inst.participating_count !== undefined && (
                                <> • <strong className="text-slate-700">{inst.participating_count} active</strong></>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block text-[11px]">
                              {inst.registered_count || inst.student_count || 0} users
                            </span>
                            {inst.total_points !== undefined && inst.total_points > 0 && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {inst.total_points} pts
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                      <Building className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                      <p className="font-semibold text-slate-600">No institution participation data available yet.</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Rankings are populated exclusively from genuine student and faculty account registrations. As institutions join, verified statistics will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* District Breakdown */}
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                      District-Wise Participation
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {overview.districts?.length || 0} active
                    </span>
                  </div>

                  {overview.districts && overview.districts.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
                      {overview.districts.map((d: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                          <span className="font-semibold text-slate-800">{d.district}</span>
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            {d.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                      <TrendingUp className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                      <p className="font-semibold text-slate-600">No district participation recorded yet.</p>
                      <p className="text-[11px] text-slate-400">
                        When users register their district across Kerala, regional engagement counts will render here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              Unable to load overview. Click "Refresh" to try again.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: CHALLENGE PROOF VERIFICATION REVIEW */}
      {adminTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Challenge Photo Evidence Verification Review
              </h3>
              <p className="text-xs text-slate-500">
                Audit student & volunteer photo evidence, review Gemini AI vision scores, inspect full-resolution proofs, and grant Green Points.
              </p>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'needs_review', label: 'Pending Review', count: submissionCounts.needsReview, color: 'bg-amber-100 text-amber-800 border-amber-200' },
                { id: 'verified', label: 'Verified', count: submissionCounts.verified, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                { id: 'rejected', label: 'Rejected', count: submissionCounts.rejected, color: 'bg-rose-100 text-rose-800 border-rose-200' },
                { id: 'all', label: 'All Submissions', count: submissionCounts.total, color: 'bg-slate-100 text-slate-800 border-slate-200' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => {
                    setSubmissionStatusFilter(pill.id as any);
                    loadSubmissions(pill.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    submissionStatusFilter === pill.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${submissionStatusFilter === pill.id ? 'bg-white/20 text-white' : pill.color}`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Success Alert */}
          {reviewSuccessMsg && (
            <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>{reviewSuccessMsg}</span>
              </div>
              <button onClick={() => setReviewSuccessMsg(null)} className="text-white/80 hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium">Fetching challenge evidence records...</p>
            </div>
          ) : submissionsList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No submissions found in this category</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {submissionStatusFilter === 'needs_review'
                  ? 'All submitted photo proofs have been reviewed! New submissions will appear here automatically.'
                  : 'No submissions match the current status filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissionsList.map((sub) => {
                const isPending = sub.status === 'needs_review' || sub.status === 'verifying';
                const isVerified = sub.status === 'verified';

                return (
                  <div
                    key={sub.id}
                    className={`p-6 rounded-3xl border transition-all space-y-4 ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                        : isVerified
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-rose-200 bg-rose-50/10'
                    }`}
                  >
                    {/* Top Row: User details & Challenge badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{sub.userName || 'Participant'}</span>
                          <span className="text-xs text-slate-400">({sub.userEmail})</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {sub.userCategory || 'Student'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sub.institutionName || 'Independent'} • {sub.district || 'Kerala'} • Submitted on {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                          +{sub.challengePoints || 20} Points
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {isVerified ? 'Verified' : isPending ? 'Pending Review' : 'Rejected'}
                        </span>
                      </div>
                    </div>

                    {/* Challenge Title & Evidence Requirement */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base">
                        {sub.challengeTitle}
                      </h4>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Requirement:</span> {sub.evidenceGuidance || 'Direct photo evidence of sustainable action.'}
                      </p>
                      {sub.userNotes && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 inline-block mt-1">
                          "{sub.userNotes}"
                        </p>
                      )}
                    </div>

                    {/* Photos Preview & AI Assessment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Photo Evidence Thumbnails */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                          Submitted Photo Evidence ({sub.photos.length})
                        </span>
                        <div className="flex items-center gap-3">
                          {sub.photos.map((photo, pIdx) => {
                            const photoUrl = api.challenges.getProofUrl(photo);
                            return (
                              <button
                                key={pIdx}
                                onClick={() => setSelectedProofForModal(photoUrl)}
                                className="relative group w-32 h-24 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-xs focus:ring-2 focus:ring-emerald-500"
                                title="Click to enlarge full resolution evidence"
                              >
                                <img
                                  src={photoUrl}
                                  alt={`Proof ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Vision Assessment Box */}
                      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            AI Vision Assessment
                          </span>
                          {sub.aiConfidence !== null && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {sub.aiConfidence}% Confidence
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-800">Relevance:</span> {sub.aiRelevance || 'Unknown'} • <span className="font-semibold text-slate-800">Quality:</span> {sub.aiQuality || 'Clear'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">AI Reasoning:</span> {sub.aiReason || 'Evidence evaluated against challenge criteria.'}
                          </div>
                        </div>

                        {sub.reviewerName && (
                          <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                            Reviewed by <strong>{sub.reviewerName}</strong> on {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : 'N/A'}: "{sub.reviewReason}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Coordinators */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-3">
                      <button
                        onClick={() => setReviewDialog({
                          submission: sub,
                          action: 'reject',
                          reason: 'Evidence does not clearly meet the required criteria or photo is too blurry.'
                        })}
                        className="px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject / Request Resubmission</span>
                      </button>

                      <button
                        onClick={() => setReviewDialog({
                          submission: sub,
                          action: 'approve',
                          reason: 'Evidence accepted by institution coordinator'
                        })}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Award Points</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: USER DIRECTORY & MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Registered Users Directory ({pagination.total})
              </h3>
              <p className="text-xs text-slate-500">
                Inspect registered participants, audit profile completion status, and process GDPR/data deletion requests.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

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

              <select
                value={userDistrictFilter}
                onChange={(e) => setUserDistrictFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="">All Districts</option>
                {['Thrissur', 'Ernakulam', 'Palakkad', 'Kozhikode', 'Thiruvananthapuram', 'Kottayam', 'Malappuram', 'Kollam', 'Alappuzha', 'Idukki', 'Wayanad', 'Kannur', 'Kasaragod', 'Pathanamthitta'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={userProfileStatusFilter}
                onChange={(e) => setUserProfileStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="">All Profile States</option>
                <option value="complete">Completed Profiles</option>
                <option value="incomplete">Incomplete Profiles</option>
              </select>

              <button
                onClick={() => loadUsers(1)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Filter
              </button>

              {(userSearch || userCategoryFilter || userDistrictFilter || userProfileStatusFilter) && (
                <button
                  onClick={handleResetFilters}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 text-xs transition-colors"
                  title="Clear all filters"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {userActionMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{userActionMessage}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                <span>Loading registered users...</span>
              </div>
            ) : usersList.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Institution & District</th>
                    <th className="py-2.5 px-3">Profile Status</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3">Audits</th>
                    <th className="py-2.5 px-3">Points</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <p className="font-medium text-slate-800">{u.institution_name || '—'}</p>
                        <span className="text-[10px] text-slate-400">{u.district}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {u.is_profile_complete === 1 || (u.institution_name && u.district) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px] border border-amber-200">
                            <UserX className="w-3 h-3 text-amber-600" />
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {u.last_login_at ? (
                          <span>{new Date(u.last_login_at).toLocaleDateString()} {new Date(u.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span className="text-slate-400 italic">No logins recorded</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {u.calc_count || 0} calcs
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {u.total_points || 0} pts
                      </td>
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
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs space-y-3">
                <Users className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">
                  {userSearch || userCategoryFilter || userDistrictFilter || userProfileStatusFilter
                    ? 'No registered users match the selected filters.'
                    : '0 Registered Users — No registered participants in the database yet.'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {userSearch || userCategoryFilter || userDistrictFilter || userProfileStatusFilter
                    ? 'Try clearing or modifying your filter parameters to view other participant accounts.'
                    : 'All accounts displayed in this table represent genuine registered users only. No dummy or demo accounts are populated.'}
                </p>
                {(userSearch || userCategoryFilter || userDistrictFilter || userProfileStatusFilter) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} registered users)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadUsers(pagination.page - 1)}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadUsers(pagination.page + 1)}
                className="p-1.5 rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
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
          {loadingAnalytics ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium">Computing usage analytics from database...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Calculations Timeline Chart */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    Carbon Calculator Usage Over Time (Last 30 Days)
                  </h3>
                  <span className="text-xs text-slate-400">
                    {analytics.calcsOverTime?.length || 0} active calculation days
                  </span>
                </div>

                <div className="h-60 w-full">
                  {analytics.calcsOverTime && analytics.calcsOverTime.length > 0 ? (
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
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
                      <Calculator className="w-8 h-8 opacity-30 text-slate-400" />
                      <p className="font-semibold text-slate-600">No carbon calculations recorded yet.</p>
                      <p className="text-[11px] text-slate-400">
                        When users save calculations on the site, daily emission baselines and trends will render here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emission Category Averages */}
              {analytics.categoryAverages && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <PieIcon className="w-4 h-4 text-sky-600" />
                    Emission Category Averages Across Platform (kg CO2e / month)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Electricity', val: analytics.categoryAverages.avg_electricity || analytics.categoryAverages.avgElectricity || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                      { label: 'Transport', val: analytics.categoryAverages.avg_transport || analytics.categoryAverages.avgTransport || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                      { label: 'Food Habits', val: analytics.categoryAverages.avg_food || analytics.categoryAverages.avgFood || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                      { label: 'Plastic', val: analytics.categoryAverages.avg_plastic || analytics.categoryAverages.avgPlastic || 0, color: 'text-rose-700 bg-rose-50 border-rose-200' },
                      { label: 'Waste', val: analytics.categoryAverages.avg_waste || analytics.categoryAverages.avgWaste || 0, color: 'text-purple-700 bg-purple-50 border-purple-200' },
                      { label: 'Lifestyle', val: analytics.categoryAverages.avg_lifestyle || analytics.categoryAverages.avgLifestyle || 0, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${item.color} space-y-1 text-center`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{item.label}</span>
                        <p className="text-xl font-extrabold">{Number(item.val).toFixed(1)} <span className="text-[10px] font-normal">kg</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge Completion Engagements */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Green Challenge Completion Counts
                  </h3>
                  <span className="text-xs text-slate-400">
                    {analytics.challengeStats?.filter((c: any) => c.completion_count > 0).length || 0} challenges completed
                  </span>
                </div>

                {analytics.challengeStats && analytics.challengeStats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {analytics.challengeStats.map((cs: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center hover:bg-slate-100/70 transition-colors">
                        <div className="max-w-[75%]">
                          <p className="font-bold text-slate-900 truncate">{cs.title}</p>
                          <span className="text-[10px] text-slate-500">{cs.category} • {cs.difficulty}</span>
                        </div>
                        <span className={`font-extrabold px-2.5 py-1 rounded-md text-xs border ${
                          cs.completion_count > 0
                            ? 'text-amber-800 bg-amber-100 border-amber-300'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                          {cs.completion_count} {cs.completion_count === 1 ? 'done' : 'done'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                    <Award className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600">No challenge completions recorded yet.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              Unable to load usage analytics. Click "Refresh" to try again.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: ENQUIRIES */}
      {adminTab === 'enquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              Received Contact Messages & Suggestions ({enquiries.length})
            </h3>
            <span className="text-xs text-slate-400">
              Real submissions from Contact form
            </span>
          </div>

          <div className="space-y-3">
            {enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div key={enq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <Mail className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600">No feedback or enquiry messages submitted yet.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Enquiries submitted by teachers, students, and coordinators through the Contact page will be catalogued here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: REPORTS & DATA EXPORT CENTER */}
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
                Export real platform records in open standard formats (CSV, XLSX, PDF) or download raw database binary and JSON snapshots.
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
                    onClick={() => handleDownload('/api/admin/export/csv?type=users', 'carboncalculator-users.csv', 'users')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>Registered Users CSV</span>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => handleDownload('/api/admin/export/csv?type=calculations', 'carboncalculator-calculations.csv', 'calculations')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>Footprint Calculations CSV</span>
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => handleDownload('/api/admin/export/csv?type=institutions', 'carboncalculator-institutions.csv', 'institutions')}
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
                  onClick={() => handleDownload('/api/admin/export/xlsx', 'carboncalculator-comprehensive.xlsx', 'users')}
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
                  onClick={() => handleDownload('/api/admin/export/pdf', 'carboncalculator-official-report.pdf', 'users')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            </div>

            {/* Database Direct Backup & Portability */}
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

      {/* MODAL 1: HIGH-RES EVIDENCE PHOTO INSPECTION */}
      {selectedProofForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedProofForModal(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={selectedProofForModal}
              alt="Enlarged Evidence Proof"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* MODAL 2: COORDINATOR REVIEW DECISION DIALOG */}
      {reviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {reviewDialog.action === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Approve Evidence & Award Points</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>Reject or Request Resubmission</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setReviewDialog(null)}
                disabled={isSubmittingReview}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-700">
              <p>
                <strong>Participant:</strong> {reviewDialog.submission.userName} ({reviewDialog.submission.userEmail})
              </p>
              <p>
                <strong>Challenge:</strong> {reviewDialog.submission.challengeTitle} (+{reviewDialog.submission.challengePoints || 20} pts)
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Coordinator Feedback / Review Notes
              </label>
              <textarea
                rows={3}
                value={reviewDialog.reason}
                onChange={(e) => setReviewDialog({ ...reviewDialog, reason: e.target.value })}
                disabled={isSubmittingReview}
                placeholder="Enter feedback or note for the user..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewDialog(null)}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReviewAction}
                disabled={isSubmittingReview}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-2 ${
                  reviewDialog.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingReview ? (
                  <span>Saving...</span>
                ) : (
                  <span>Confirm {reviewDialog.action === 'approve' ? 'Approval' : 'Rejection'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
