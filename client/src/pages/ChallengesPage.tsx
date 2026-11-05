import React from 'react';
import {
  Award,
  Sparkles,
  Clock,
  Leaf,
  ShieldCheck,
  Zap,
  Calculator,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle2,
  Camera,
  MessageSquare
} from 'lucide-react';

interface ChallengesPageProps {
  setActiveTab: (tab: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ setActiveTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>Under Active Development</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Daily Green Challenges
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          We are building an upgraded sustainability challenge experience for Kerala colleges, schools, and NSS units. This feature will be live soon!
        </p>
      </div>

      {/* 2. Main Coming Soon Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-800/50 text-center space-y-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
          {/* Animated Icon Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold uppercase tracking-widest inline-block">
              Feature Coming Soon
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              A Smarter Way to Track Everyday Green Habits
            </h2>
          </div>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            The Daily Challenges module is undergoing enhancements to provide meaningful everyday sustainability tasks, verified impact tracking, and institutional Green Points competition.
          </p>

          {/* Development Milestones */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Habit Taxonomy</span>
              </div>
              <p className="text-[11px] text-emerald-100/70 mt-1">10+ vetted daily energy & waste reduction actions.</p>
            </div>

            <div className="p-3.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-emerald-400/30">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Impact Engine</span>
              </div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Refining scoring formulas and institutional leaderboards.</p>
            </div>

            <div className="p-3.5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Public Launch</span>
              </div>
              <p className="text-[11px] text-emerald-100/70 mt-1">Scheduled for rollout in upcoming platform release.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sneak Peek / What to Expect Section */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            What to Expect in Daily Green Challenges
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed specifically for student routines, hostel life, and campus eco-clubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Tangible Everyday Habits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated daily and weekly actions focusing on phantom load elimination, single-use plastic reduction, zero food waste, and low-carbon transit.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Verified Evidence & Integrity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent verification ensuring Green Points represent genuine, verifiable eco-habits rather than unverified self-assertions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Campus Leaderboards & Badges</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compete alongside NSS units and college departments. Earn digital milestone badges and showcase institutional sustainability leadership.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Actionable Alternatives While Waiting */}
      <div className="p-6 sm:p-8 bg-slate-100/70 rounded-3xl border border-slate-200/80 space-y-6 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">Available Right Now</span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Explore Other CarbonCalculator Tools
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            You can still calculate emissions, read climate guides, and explore campus initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Calculator */}
          <div
            onClick={() => setActiveTab('calculator')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Carbon Calculator
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculate your monthly household footprint across electricity, transport, and diet.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Start Calculating</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2: Learn */}
          <div
            onClick={() => setActiveTab('learn')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Learn & Explore
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read actionable guides on rooftop solar, e-waste, energy efficiency, and climate science.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Read Guides</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 3: Community */}
          <div
            onClick={() => setActiveTab('community')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Campus Community
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore campus sustainability drives and college participation across Kerala.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>View Community</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Feedback / Idea Suggestion Box */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Have ideas for student green challenges?
          </h4>
          <p className="text-xs text-slate-500">
            Send your challenge suggestions or campus sustainability project ideas to the VAST Energy Cell team.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('contact')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          Contact Coordinator
        </button>
      </div>
    </div>
  );
};
