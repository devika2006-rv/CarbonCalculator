import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Leaf,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Challenge } from '../types';

interface ChallengesPageProps {
  setActiveTab: (tab: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ setActiveTab }) => {
  const { user, stats, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly'>('all');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);

  const loadChallenges = async () => {
    try {
      const res = await api.challenges.list();
      setChallenges(res.challenges);
      if (user) {
        const hist = await api.challenges.getUserHistory();
        setUserHistory(hist.history);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const handleComplete = async (challenge: Challenge) => {
    if (!user) {
      setActiveTab('auth');
      return;
    }

    try {
      setCompletingId(challenge.id);
      const res = await api.challenges.complete(challenge.id);
      setCompletionMessage(res.message);
      if (res.newBadges && res.newBadges.length > 0) {
        setUnlockedBadges(res.newBadges);
      }
      await refreshUser();
      await loadChallenges();
      setTimeout(() => {
        setCompletionMessage(null);
      }, 5000);
    } catch (err: any) {
      setCompletionMessage(`Notice: ${err.message || 'Could not complete challenge'}`);
      setTimeout(() => setCompletionMessage(null), 4000);
    } finally {
      setCompletingId(null);
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Hard: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Everyday Habits • Meaningful Impact</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Daily Green Challenges
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Adopt tangible eco-friendly habits for your household, classroom, and community. Track completions, earn Green Points, and unlock milestone badges.
        </p>
      </div>

      {/* Gamification Transparency Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-left">
        <AlertCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          <span className="font-bold">Transparency Note:</span> Green Points are gamification points designed to motivate habit building and foster campus camaraderie. They represent completed sustainability actions, not scientifically verified carbon offset certificates.
        </div>
      </div>

      {/* User Progress Bar & Stats (if logged in) */}
      {user && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              🏆
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Your Green Points</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.totalPoints ?? 0} pts</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              ✅
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Challenges Completed</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.challengeCount ?? 0} actions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
              🎖️
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Badges Earned</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.badgesCount ?? 0} badges</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Alert */}
      {completionMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{completionMessage}</span>
          </div>
          <button onClick={() => setCompletionMessage(null)} className="text-xs opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Newly Unlocked Badges Announcement */}
      {unlockedBadges.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl shadow-md text-left space-y-2 animate-bounce">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Congratulations!</span>
          <h3 className="text-xl font-bold">New Badge Unlocked!</h3>
          <div className="flex flex-wrap gap-3 pt-1">
            {unlockedBadges.map((b, i) => (
              <span key={i} className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold">
                🌟 {b.name} - {b.desc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'daily', label: 'Daily Habits' },
          { id: 'weekly', label: 'Weekly Initiatives' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeFilter === f.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => {
          const isDone = challenge.completedCurrentPeriod;
          return (
            <div
              key={challenge.id}
              className={`p-6 bg-white rounded-3xl border transition-all flex flex-col justify-between text-left space-y-5 ${
                isDone
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Badges & Difficulty Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      {challenge.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border font-semibold text-[10px] ${difficultyColors[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  <span className="font-extrabold text-emerald-700 text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    +{challenge.points} Points
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {challenge.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {challenge.description}
                </p>

                {/* Action Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                    Action Step:
                  </span>
                  <p>{challenge.action_steps}</p>
                </div>
              </div>

              {/* Card Footer: Environmental Benefit & Completion Action */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="text-[11px] text-emerald-800 font-medium">
                  🌱 {challenge.environmental_benefit}
                </div>

                <button
                  onClick={() => handleComplete(challenge)}
                  disabled={isDone || completingId === challenge.id}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-xs'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed for this {challenge.category === 'daily' ? 'day' : 'week'}</span>
                    </>
                  ) : completingId === challenge.id ? (
                    <span>Recording...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{user ? 'Mark as Completed' : 'Login to Complete'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion History (if logged in) */}
      {user && userHistory.length > 0 && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 text-left space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Your Activity History
          </h3>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {userHistory.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{h.title}</p>
                  <span className="text-[11px] text-slate-400">
                    Completed on {new Date(h.completed_at).toLocaleDateString()} at {new Date(h.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +{h.points_earned} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
