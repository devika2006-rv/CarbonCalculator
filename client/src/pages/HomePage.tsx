import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Award,
  Sparkles,
  BookOpen,
  Users,
  ArrowRight,
  Zap,
  Leaf,
  Globe2,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Smile
} from 'lucide-react';
import { api } from '../services/api';
import { Challenge, CommunityOverview } from '../types';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [featuredChallenges, setFeaturedChallenges] = useState<Challenge[]>([]);
  const [overview, setOverview] = useState<CommunityOverview | null>(null);

  useEffect(() => {
    // Fetch live challenges preview
    api.challenges.list()
      .then(res => {
        setFeaturedChallenges(res.challenges.slice(0, 3));
      })
      .catch(() => {});

    // Fetch live community stats (real database records only)
    api.community.getOverview()
      .then(res => {
        setOverview(res.overview);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* A. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 bg-radial from-emerald-50/60 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>VAST Energy Cell & NSS Sustainability Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your Everyday Choices <br />
                <span className="text-emerald-700">Shape Our Planet.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                Discover your carbon footprint, understand your environmental impact, and take simple actions towards a more sustainable future.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => { setActiveTab('calculator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-base"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Calculate My Footprint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { setActiveTab('challenges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-semibold rounded-xl shadow-xs hover:border-emerald-300 transition-all text-base"
                >
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Explore Green Challenges</span>
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Based on CEA & IPCC factors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free & Open Education</span>
                </div>
              </div>
            </div>

            {/* Original Sustainability Illustration / Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl">
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-sky-400/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 space-y-4">
                  {/* Visual Earth & Leaf graphic */}
                  <div className="h-44 sm:h-52 w-full rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">Interactive Footprint</span>
                        <h4 className="text-xl font-bold">Carbon Balance</h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Globe2 className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-emerald-200">
                        <span>Electricity • Transit • Diet</span>
                        <span>Track Daily</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time platform pulse */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-left">
                      <span className="text-xs text-slate-500 font-medium">Logged Calculations</span>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {overview ? overview.totalCalculations : '—'}
                      </p>
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                        <TrendingDown className="w-3 h-3" /> Real database records
                      </span>
                    </div>

                    <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 text-left">
                      <span className="text-xs text-slate-500 font-medium">Green Points Earned</span>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {overview ? overview.totalGreenPoints : '—'}
                      </p>
                      <span className="text-[11px] text-sky-700 font-medium flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3" /> Community actions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. Why Carbon Awareness Matters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Carbon Awareness Matters
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every unit of grid electricity, every short vehicle commute, and every unsegregated plastic container generates invisible greenhouse gas emissions. Calculating your baseline is the essential first step toward measurable conservation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Demystify Everyday Energy</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              In India, grid electricity averages <span className="font-semibold text-slate-800">~0.716 kg CO2e per kWh</span> (CEA Baseline v19). Even small changes like turning off idle appliances immediately curtail thermal generation emissions.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Action Over Overwhelm</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Global climate discussions can feel abstract. CarbonCalculator breaks down sustainability into bite-sized daily green actions—from source segregation to taking public transit.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow text-left space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Empowering Campus & Community</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Engineered for school and college energy awareness drives, enabling NSS volunteers, teachers, and student cells to benchmark and measure collective impact across Kerala and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* C. Explore the Platform */}
      <section className="bg-slate-50/80 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Features</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Explore the Platform</h2>
            <p className="text-sm sm:text-base text-slate-600">Everything you need to understand, calculate, and reduce your environmental footprint.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Calculator */}
            <div
              onClick={() => { setActiveTab('calculator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Carbon Calculator
                </h3>
                <p className="text-sm text-slate-600">
                  Interactive multi-category estimation for electricity, travel, diet, waste, and lifestyle using verified emission factors.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>Start calculation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Challenges */}
            <div
              onClick={() => { setActiveTab('challenges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Daily Green Challenges
                </h3>
                <p className="text-sm text-slate-600">
                  Adopt tangible eco-friendly habits like zero single-use plastic, room audits, and earn gamified Green Points.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>View challenges</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Dashboard */}
            <div
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  My Impact Dashboard
                </h3>
                <p className="text-sm text-slate-600">
                  Visual charts tracking your monthly emissions trend, earned badges, and custom recommendations.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>Open dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Learn */}
            <div
              onClick={() => { setActiveTab('learn'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Learn & Explore
                </h3>
                <p className="text-sm text-slate-600">
                  12 accessible environmental topics tailored for school and college workshops with facts and practical tips.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>Explore guides</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Community */}
            <div
              onClick={() => { setActiveTab('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Community Participation
                </h3>
                <p className="text-sm text-slate-600">
                  Aggregated, privacy-safe leaderboard showcasing green participation across colleges, schools, and districts.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>See rankings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: About Us */}
            <div
              onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  About VAST & Energy Cell
                </h3>
                <p className="text-sm text-slate-600">
                  Learn about Vidya Academy of Science and Technology, Vidya NSS units, and the APJAKTU NSS Energy Cell.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span>Meet the team</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. How It Works (Three-Stage Process) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Methodology</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">How It Works</h2>
          <p className="text-sm sm:text-base text-slate-600">A structured three-stage process to turn awareness into long-term habits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Calculate Your Footprint</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter your monthly electricity usage, travel habits, dietary choices, and waste management. Our engine applies documented Indian and IPCC emission factors.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Understand Your Impact</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Review transparent category-wise breakdowns in kg CO2e and annual tonnes. Identify your primary emission drivers and compare against your own historical baseline.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Take Action & Track</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Participate in daily and weekly green challenges, accumulate Green Points, unlock sustainability badges, and contribute to your institution's environmental leadership.
            </p>
          </div>
        </div>
      </section>

      {/* E. Daily Green Action Preview */}
      <section className="bg-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Start Today</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-1">Daily Green Actions</h2>
              <p className="text-sm text-emerald-200 mt-2 max-w-xl">
                Small consistent habits that reduce emissions and build environmental consciousness.
              </p>
            </div>
            <button
              onClick={() => { setActiveTab('challenges'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors self-start md:self-auto"
            >
              <span>View All Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredChallenges.length > 0 ? (
              featuredChallenges.map((c) => (
                <div
                  key={c.id}
                  className="p-6 bg-emerald-800/60 rounded-2xl border border-emerald-700/60 flex flex-col justify-between text-left space-y-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 font-semibold uppercase">
                        {c.category}
                      </span>
                      <span className="font-bold text-amber-300">+{c.points} Points</span>
                    </div>
                    <h3 className="font-bold text-base text-white leading-snug">{c.title}</h3>
                    <p className="text-xs text-emerald-200 line-clamp-3">{c.description}</p>
                  </div>
                  <div className="pt-2 text-xs text-emerald-300 font-medium">
                    🌱 {c.environmental_benefit}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 bg-emerald-800/40 rounded-2xl text-center text-emerald-200">
                Loading today's challenges...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* F. Community Participation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl text-white text-left relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Collective Engagement</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Inspiring Environmental Leadership in Every Campus
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whether you are an NSS volunteer conducting campus energy audits, a school student learning about renewable power, or a teacher spearheading environmental awareness, CarbonCalculator is built for you.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => { setActiveTab('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
              >
                View Community Leaderboard
              </button>
              <button
                onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Organize a Campus Workshop
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
