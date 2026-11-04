import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Building,
  MapPin,
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { CommunityOverview, InstitutionLeaderboardItem } from '../types';

interface CommunityPageProps {
  setActiveTab: (tab: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ setActiveTab }) => {
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionLeaderboardItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<any[]>([]);
  const [districtCounts, setDistrictCounts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, instRes] = await Promise.all([
        api.community.getOverview(),
        api.community.getInstitutions(selectedDistrict || undefined, selectedType || undefined)
      ]);
      setOverview(ovRes.overview);
      setCategoryCounts(ovRes.categoryCounts);
      setDistrictCounts(ovRes.districtCounts);
      setInstitutions(instRes.institutions);
    } catch (err) {
      console.error('Community data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDistrict, selectedType]);

  const filteredInstitutions = institutions.filter(i =>
    i.institution_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Collective Action • Institutional Engagement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Community Participation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Celebrating the collective environmental leadership of schools, engineering colleges, NSS cells, and citizen volunteers across Kerala.
        </p>
      </div>

      {/* Real Database Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Active Participants</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview ? overview.totalUsers : '—'}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block">Registered Users</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Institutions</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview ? overview.totalInstitutions : '—'}
          </p>
          <span className="text-[11px] text-sky-700 font-semibold block">Colleges & Schools</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Logged Calculations</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview ? overview.totalCalculations : '—'}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold block">Footprint Baselines</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Green Points</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview ? overview.totalGreenPoints : '—'}
          </p>
          <span className="text-[11px] text-purple-700 font-semibold block">Habit Milestones</span>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
        <span>
          <strong className="text-slate-800">Privacy Guarantee:</strong> All rankings and community statistics are strictly aggregated at the institutional level. Individual names, emails, and private footprint breakdowns are never exposed on public leaderboards.
        </span>
      </div>

      {/* Main Section: Institution Leaderboard & Community Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Institutional Leaderboard (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Institutional Engagement Leaderboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by collective community green points and participant engagement.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="">All Districts</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Ernakulam">Ernakulam</option>
                <option value="Palakkad">Palakkad</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Malappuram">Malappuram</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="College">Colleges</option>
                <option value="School">Schools</option>
              </select>
            </div>
          </div>

          {/* Search box inside table */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institution name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredInstitutions.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Participants</th>
                    <th className="py-2.5 px-3">Calculations</th>
                    <th className="py-2.5 px-3 text-right">Green Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstitutions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-400">
                        {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{item.institution_name}</p>
                        <span className="text-[10px] text-slate-500">{item.institution_type}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {item.district}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {item.participant_count}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.calculations_count}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                        {item.total_points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <Building className="w-8 h-8 mx-auto opacity-40" />
                <p>No institutions matching the selected filter criteria yet.</p>
                <p className="text-[11px] text-slate-500">
                  Register with your institution name to see it featured on the community board!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Community Campaigns & Role Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Role Distribution */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Volunteer & Student Cohorts
            </h3>
            <div className="space-y-2 text-xs">
              {categoryCounts.length > 0 ? (
                categoryCounts.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">{cat.category}</span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {cat.count} members
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-3 text-center italic">No registered cohort members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
