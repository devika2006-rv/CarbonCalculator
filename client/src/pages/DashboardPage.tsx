import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Calculator,
  Award,
  TrendingDown,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CalculationRecord } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#F59E0B',
  Transportation: '#0284C7',
  'Food Habits': '#10B981',
  'Plastic & Shopping': '#EC4899',
  'Waste Management': '#8B5CF6',
  'Lifestyle & Cooking': '#14B8A6'
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { user, stats, refreshUser } = useAuth();
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.calculator.getHistory().then(res => setHistory(res.history)),
        api.challenges.getUserHistory().then(res => setChallengeHistory(res.history)),
        refreshUser()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Sign in to View Your Impact Dashboard
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your personal dashboard tracks saved footprint calculations, historical trends, Green Points, and earned sustainability badges.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('auth')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm"
        >
          <span>Sign In / Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const latest = history.length > 0 ? history[0] : null;

  // Prepare trend data for Recharts (chronological order)
  const trendData = [...history].reverse().map(h => ({
    date: new Date(h.calculated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    monthlyCo2: h.monthly_co2_kg,
    electricity: h.electricity_co2_kg,
    transport: h.transport_co2_kg
  }));

  // Latest Category Breakdown for Donut Chart
  const categoryData = latest ? [
    { name: 'Electricity', value: latest.electricity_co2_kg, color: CATEGORY_COLORS['Electricity'] },
    { name: 'Transportation', value: latest.transport_co2_kg, color: CATEGORY_COLORS['Transportation'] },
    { name: 'Food Habits', value: latest.food_co2_kg, color: CATEGORY_COLORS['Food Habits'] },
    { name: 'Plastic & Shopping', value: latest.plastic_co2_kg, color: CATEGORY_COLORS['Plastic & Shopping'] },
    { name: 'Waste Management', value: latest.waste_co2_kg, color: CATEGORY_COLORS['Waste Management'] },
    { name: 'Lifestyle & Cooking', value: latest.lifestyle_co2_kg, color: CATEGORY_COLORS['Lifestyle & Cooking'] },
  ].filter(c => c.value > 0) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold">
                {user.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {user.institution_name ? `${user.institution_name} • ` : ''}{user.district}
            </p>
            <p className="text-[11px] text-emerald-400">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-emerald-800/80 pt-4 md:pt-0 md:pl-6">
          <div className="text-left">
            <span className="text-xs text-emerald-300 font-medium block">Total Green Points</span>
            <span className="text-3xl font-extrabold text-white">{stats?.totalPoints ?? 0}</span>
            <span className="text-xs text-emerald-400 ml-1 font-semibold">pts</span>
          </div>

          <div className="text-left pl-6 border-l border-emerald-800/80">
            <span className="text-xs text-emerald-300 font-medium block">Badges Unlocked</span>
            <span className="text-3xl font-extrabold text-white">{stats?.badgesCount ?? 0}</span>
            <span className="text-xs text-emerald-400 ml-1 font-semibold">badges</span>
          </div>
        </div>
      </div>

      {/* Main Stats or Empty State */}
      {!latest ? (
        <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            No Carbon Footprint Calculations Saved Yet
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Take 2 minutes to calculate your everyday energy and lifestyle footprint. Your results will automatically appear here with visual trends and suggestions.
          </p>
          <button
            onClick={() => setActiveTab('calculator')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate My Footprint Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Latest Monthly Footprint
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {latest.monthly_co2_kg}
              </p>
              <span className="text-xs font-medium text-emerald-700 block">kg CO2e / month</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Annual Projected Footprint
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {latest.annual_co2_tonnes}
              </p>
              <span className="text-xs font-medium text-sky-700 block">tonnes CO2e / year</span>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Daily Average
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {latest.daily_co2_kg}
              </p>
              <span className="text-xs font-medium text-amber-700 block">kg CO2e / day</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Donut Chart (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  Category Emissions Share
                </h3>
                <span className="text-[11px] text-slate-400">Latest calculation</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} kg CO2e`, 'Share']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></span>
                    <span className="text-slate-600 truncate">{c.name}:</span>
                    <span className="font-bold text-slate-800 ml-auto">{c.value} kg</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Trend Chart (7 cols) */}
            <div className="lg:col-span-7 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  Footprint Progression Over Time
                </h3>
                <span className="text-[11px] text-slate-400">{history.length} logged record(s)</span>
              </div>

              <div className="h-56 w-full">
                {trendData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="monthlyCo2"
                        name="Total Monthly CO2e (kg)"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="electricity"
                        name="Electricity (kg)"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="transport"
                        name="Transport (kg)"
                        stroke="#0284C7"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center space-y-2">
                    <TrendingDown className="w-8 h-8 opacity-40" />
                    <p>Single calculation recorded so far.</p>
                    <p className="text-[11px] text-slate-500">Calculate again next week or month to view your downward emission trajectory!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earned Badges Shelf */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Sustainability Badges & Achievements
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {stats?.badges.length ?? 0} unlocked
          </span>
        </div>

        {stats && stats.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.badges.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1 text-center">
                <span className="text-2xl block">🏅</span>
                <p className="font-bold text-xs text-amber-950">{b.badge_name}</p>
                <p className="text-[10px] text-amber-800 line-clamp-2">{b.badge_description}</p>
                <span className="text-[9px] text-slate-400 block pt-1">
                  Unlocked {new Date(b.awarded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 space-y-1">
            <p>No badges unlocked yet.</p>
            <p>Complete your first carbon calculation or daily green challenge to earn your inaugural badge!</p>
          </div>
        )}
      </div>

      {/* Recent Challenge Completions */}
      {challengeHistory.length > 0 && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Recent Green Challenge Activity
          </h3>
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {challengeHistory.slice(0, 5).map((ch) => (
              <div key={ch.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{ch.title}</p>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ch.completed_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +{ch.points_earned} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
