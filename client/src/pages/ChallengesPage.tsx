import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Leaf,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Camera,
  UploadCloud,
  X,
  Eye,
  RotateCcw,
  Info,
  Check,
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Challenge, ChallengeSubmission } from '../types';

interface ChallengesPageProps {
  setActiveTab: (tab: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ setActiveTab }) => {
  const { user, stats, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly'>('all');
  const [pageView, setPageView] = useState<'catalog' | 'submissions'>('catalog');
  const [userSubmissions, setUserSubmissions] = useState<ChallengeSubmission[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  // Proof submission modal state
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState('');
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<'idle' | 'uploading' | 'verifying' | 'result'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'verified' | 'needs_review' | 'rejected';
    message: string;
    pointsEarned: number;
    aiFeedback?: { confidence?: number; reason?: string; description?: string };
  } | null>(null);

  // High-res photo inspection modal
  const [inspectedPhoto, setInspectedPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const loadChallengesAndSubmissions = async () => {
    try {
      const res = await api.challenges.list();
      setChallenges(res.challenges);
      if (user) {
        const subRes = await api.challenges.getSubmissions();
        setUserSubmissions(subRes.submissions);
      } else {
        const stored = JSON.parse(localStorage.getItem('cc_submissions') || '[]');
        setUserSubmissions(stored);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    }
  };

  useEffect(() => {
    loadChallengesAndSubmissions();
  }, [user]);

  const handleOpenSubmission = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setSelectedFiles([]);
    setFilePreviews([]);
    setUserNotes('');
    setEvidenceConfirmed(false);
    setSubmitError(null);
    setVerificationResult(null);
    setSubmitStep('idle');
  };

  const handleResetLocalData = () => {
    if (window.confirm('Reset challenge completions and submissions in this browser to start fresh?')) {
      localStorage.removeItem('cc_completed_challenges');
      localStorage.removeItem('cc_submissions');
      loadChallengesAndSubmissions();
      window.location.reload();
    }
  };

  const handleCloseSubmission = () => {
    if (isSubmitting) return;
    setSelectedChallenge(null);
    setSelectedFiles([]);
    setFilePreviews([]);
    setSubmitError(null);
    setVerificationResult(null);
    setSubmitStep('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [...filePreviews];

    for (const file of files) {
      if (selectedFiles.length + validFiles.length >= 2) {
        setSubmitError('You can upload a maximum of 2 photos for evidence.');
        break;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSubmitError(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }

      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validMimes.includes(file.type.toLowerCase())) {
        setSubmitError(`"${file.name}" is not a supported format. Please upload JPG, PNG, or WebP.`);
        continue;
      }

      validFiles.push(file);
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setFilePreviews(newPreviews);
    setSubmitError(null);

    // Reset input element value so the same file can be re-selected if removed
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
    setSubmitError(null);
  };

  const handleSubmitProof = async () => {
    if (!selectedChallenge) return;
    if (selectedFiles.length === 0) {
      setSubmitError('Please upload or capture at least 1 photo of your challenge evidence.');
      return;
    }
    if (!evidenceConfirmed) {
      setSubmitError('Please certify that the evidence is genuine and taken by you.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitStep('uploading');

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });
      formData.append('notes', userNotes);
      formData.append('evidenceConfirmed', 'true');

      // Visual progress feedback
      setTimeout(() => {
        setSubmitStep('verifying');
      }, 700);

      const res = await api.challenges.submitProof(selectedChallenge.id, formData);

      setSubmitStep('result');
      setVerificationResult({
        status: res.status,
        message: res.message,
        pointsEarned: res.pointsEarned || 0,
        aiFeedback: res.aiFeedback
      });

      if (res.newBadges && res.newBadges.length > 0) {
        setUnlockedBadges(res.newBadges);
      }

      await refreshUser();
      await loadChallengesAndSubmissions();
    } catch (err: any) {
      setSubmitStep('idle');
      setSubmitError(err.message || 'Failed to submit proof. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
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

  const pendingSubmissionsCount = userSubmissions.filter(s => s.status === 'needs_review' || s.status === 'verifying').length;
  const verifiedSubmissionsCount = userSubmissions.filter(s => s.status === 'verified').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Vision Verified • Meaningful Everyday Habits</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Daily Green Challenges
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Adopt tangible eco-friendly habits for your household, classroom, and community. Submit honest photo proof, get verified by AI vision or campus coordinators, and earn Green Points.
        </p>
      </div>

      {/* Upgraded AI Photo Verification Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl shadow-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Camera className="w-6 h-6 text-emerald-200" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-400/30">
                Active Upgrade
              </span>
              <h2 className="font-bold text-base sm:text-lg">Photo Evidence Verification Enabled</h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Direct button clicks are replaced with honest photo verification. Click <strong>"Submit Photo Proof"</strong> on any challenge to upload up to 2 photos and get verified by Google Gemini AI vision.
            </p>
          </div>
        </div>
      </div>

      {/* Gamification & Verification Transparency Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-left">
        <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          <span className="font-bold">Verified Challenge Policy:</span> Every challenge requires photo evidence. Photos are verified with Google Gemini vision evaluation or queued for NSS/coordinator review. Points represent verified sustainable actions, not carbon offset certificates.
        </div>
      </div>

      {/* User Progress Bar & Stats (if logged in) */}
      {user && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
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
              <span className="text-xs text-slate-500 font-medium">Verified Proofs</span>
              <p className="text-2xl font-extrabold text-slate-900">{verifiedSubmissionsCount} completed</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
              ⏳
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Pending Review</span>
              <p className="text-2xl font-extrabold text-slate-900">{pendingSubmissionsCount} pending</p>
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

      {/* Navigation Tabs (Challenge Catalogue vs My Submissions) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageView('catalog')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              pageView === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🌱 Challenges Catalogue
          </button>
          <button
            onClick={() => setPageView('submissions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
              pageView === 'submissions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📸 My Evidence Submissions
            {userSubmissions.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                {userSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {pageView === 'catalog' && (
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'daily', label: 'Daily Habits' },
              { id: 'weekly', label: 'Weekly Initiatives' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: CHALLENGES CATALOGUE */}
      {pageView === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const isCompletedPeriod = challenge.completedCurrentPeriod;
            const latestSub = challenge.latestSubmission;
            const isPendingReview = latestSub && (latestSub.status === 'needs_review' || latestSub.status === 'verifying');
            const isRejected = latestSub && latestSub.status === 'rejected';

            return (
              <div
                key={challenge.id}
                className={`p-6 bg-white rounded-3xl border transition-all flex flex-col justify-between text-left space-y-5 ${
                  isCompletedPeriod
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : isPendingReview
                    ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Points Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                        {challenge.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full border font-semibold text-[10px] ${difficultyColors[challenge.difficulty]}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>Photo Proof</span>
                      </span>
                    </div>

                    <span className="font-extrabold text-emerald-700 text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      +{challenge.points} Points
                    </span>
                  </div>

                  {/* Challenge Title */}
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Action Step */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                      Action Step:
                    </span>
                    <p>{challenge.action_steps}</p>
                  </div>

                  {/* Photo Evidence Guidelines Box */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-[11px] uppercase tracking-wide">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evidence Required:</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {challenge.evidence_guidance || 'Clear photo demonstrating your completed sustainable habit.'}
                    </p>
                    {challenge.acceptable_evidence && (
                      <p className="text-slate-500 text-[10px] italic">
                        <span className="font-semibold text-slate-600">Acceptable:</span> {challenge.acceptable_evidence}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status & Action Button */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] text-emerald-800 font-medium">
                    🌱 {challenge.environmental_benefit}
                  </div>

                  {isCompletedPeriod ? (
                    <div className="space-y-2">
                      <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed for this {challenge.category === 'daily' ? 'day' : 'week'}</span>
                        </div>
                        <button
                          onClick={() => handleOpenSubmission(challenge)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300 transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3 text-emerald-600" />
                          <span>Submit New Proof</span>
                        </button>
                      </div>
                    </div>
                  ) : isPendingReview ? (
                    <div className="space-y-2">
                      <div className="w-full py-2.5 px-3 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>Evidence Under Review</span>
                        </div>
                        <button
                          onClick={() => handleOpenSubmission(challenge)}
                          className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-300 transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3 text-amber-600" />
                          <span>Update Photo</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        Submitted on {latestSub ? new Date(latestSub.createdAt).toLocaleDateString() : 'today'}. Points credited once verified.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmission(challenge)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                        isRejected
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isRejected ? 'Resubmit Photo Proof' : 'Submit Photo Proof'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: USER'S SUBMISSIONS HISTORY */}
      {pageView === 'submissions' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs text-left">
          {!user && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Guest Mode:</strong> Evidence submissions are stored locally in your browser. Log in or create an account to sync points to your institution.</span>
              </div>
              <button
                onClick={() => setActiveTab('auth')}
                className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Evidence Submissions</h2>
              <p className="text-xs text-slate-500">Track all photo proof submissions, verification logs, and awarded points.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {userSubmissions.length} Submissions
            </span>
          </div>

          {userSubmissions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Camera className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No photo submissions yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select any green challenge from the catalogue and upload your photo evidence to earn your first Green Points.
              </p>
              <button
                onClick={() => setPageView('catalog')}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700"
              >
                Browse Challenges
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {userSubmissions.map((sub) => {
                const statusStyles = {
                  verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  needs_review: 'bg-amber-100 text-amber-800 border-amber-200',
                  verifying: 'bg-blue-100 text-blue-800 border-blue-200',
                  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
                  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
                  failed: 'bg-rose-100 text-rose-800 border-rose-200'
                };

                const statusLabels = {
                  verified: 'Verified & Points Awarded',
                  needs_review: 'Under Coordinator Review',
                  verifying: 'AI Vision Verifying',
                  submitted: 'Submitted',
                  rejected: 'Evidence Needs Revision',
                  failed: 'Verification Failed'
                };

                return (
                  <div key={sub.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusStyles[sub.status] || 'bg-slate-100 text-slate-700'}`}>
                          {statusLabels[sub.status] || sub.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">
                        {sub.challengeTitle || 'Green Challenge'}
                      </h3>

                      {sub.userNotes && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          "{sub.userNotes}"
                        </p>
                      )}

                      {/* AI Reasoning / Review Feedback */}
                      {sub.status === 'verified' && (
                        <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Verification Note: </span>
                            {sub.aiReason || sub.reviewReason || 'Evidence accepted for this challenge.'}
                          </div>
                        </div>
                      )}

                      {sub.status === 'needs_review' && (
                        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Coordinator Review: </span>
                            {sub.aiReason || 'Queued for manual coordinator review. Your Green Points will be credited once verified.'}
                          </div>
                        </div>
                      )}

                      {sub.status === 'rejected' && (
                        <div className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/80 p-3 rounded-xl border border-rose-100">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Feedback: </span>
                            {sub.reviewReason || sub.aiReason || 'The photo evidence did not clearly match challenge requirements. Please check guidance and resubmit.'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photos Preview & Points */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        {sub.photos.map((photoName, pIdx) => {
                          const photoUrl = api.challenges.getProofUrl(photoName);
                          return (
                            <button
                              key={pIdx}
                              onClick={() => setInspectedPhoto(photoUrl)}
                              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs focus:ring-2 focus:ring-emerald-500"
                            >
                              <img
                                src={photoUrl}
                                alt={`Proof ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  // Fallback display if not found
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-5 h-5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Award</span>
                        <span className="font-extrabold text-base text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 block">
                          +{sub.pointsAwarded || (sub.status === 'verified' ? sub.challengePoints || 20 : 0)} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: PROOF SUBMISSION MODAL */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 text-left relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                    {selectedChallenge.category}
                  </span>
                  <span className="font-bold text-emerald-700 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    +{selectedChallenge.points} Points
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {selectedChallenge.title}
                </h2>
              </div>
              <button
                onClick={handleCloseSubmission}
                disabled={isSubmitting}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step 1: Form View (Idle or In Progress) */}
            {submitStep !== 'result' ? (
              <div className="space-y-5">
                {/* Evidence Guidance Banner */}
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Evidence Guidelines for this Challenge:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedChallenge.evidence_guidance || 'Submit a clear, well-lit photo showing your completed habit.'}
                  </p>
                  {selectedChallenge.acceptable_evidence && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-emerald-900">Acceptable Alternatives:</span> {selectedChallenge.acceptable_evidence}
                    </p>
                  )}
                  <div className="pt-2 border-t border-emerald-200/50 flex items-start gap-1.5 text-[11px] text-emerald-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      {selectedChallenge.privacy_guidance || 'Privacy first: avoid capturing faces, personal IDs, or unsafe actions.'}
                    </span>
                  </div>
                </div>

                {/* Photo Upload & Camera Dropzone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Upload Photo Evidence (Max 2 Photos)
                  </label>

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Previews if photos selected */}
                  {filePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {filePreviews.map((previewUrl, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs group aspect-video">
                          <img
                            src={previewUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {filePreviews.length < 2 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-4 text-slate-500 hover:text-emerald-700 transition-colors aspect-video"
                        >
                          <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                          <span className="text-xs font-semibold">Add 2nd Photo</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Empty Upload Area */
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-4 hover:border-emerald-500 transition-colors bg-slate-50/50">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          Select or capture your evidence photo
                        </p>
                        <p className="text-[11px] text-slate-500">
                          JPG, PNG, or WebP up to 5MB (Up to 2 photos)
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>Choose from Gallery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Action Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Briefly describe what you did (e.g., 'Unplugged all chargers at my study desk before sleep')..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Mandatory Honesty Declaration */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={evidenceConfirmed}
                    onChange={(e) => setEvidenceConfirmed(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">Honesty Declaration:</span> I certify that this photo evidence is genuine, taken by me, and truthfully reflects completion of this sustainability challenge.
                  </span>
                </label>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Animated Verification Loading State */}
                {isSubmitting && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-pulse">
                    <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>
                        {submitStep === 'uploading'
                          ? 'Uploading evidence photos...'
                          : 'AI Vision Verifying sustainability evidence...'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Inspecting image clarity, relevance, and safety standards. Please do not close this window.
                    </p>
                  </div>
                )}

                {!user && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      Guest Mode: You can test AI verification immediately. Sign in to save points to your college!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseSubmission();
                        setActiveTab('auth');
                      }}
                      className="text-amber-800 underline font-bold shrink-0 hover:text-amber-950"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseSubmission}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitProof}
                    disabled={isSubmitting || selectedFiles.length === 0 || !evidenceConfirmed}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{user ? 'Submit for Verification' : 'Verify Photo (Guest Test)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Verification Result View */
              <div className="space-y-6 text-center py-4">
                {verificationResult?.status === 'verified' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Challenge Verified!
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        +{verificationResult.pointsEarned} Green Points Awarded!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
                        {verificationResult.message}
                      </p>
                    </div>

                    {verificationResult.aiFeedback?.reason && (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
                        <span className="font-bold block text-[11px] uppercase tracking-wide">
                          Verification Assessment:
                        </span>
                        <p>{verificationResult.aiFeedback.reason}</p>
                      </div>
                    )}

                    <button
                      onClick={handleCloseSubmission}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
                    >
                      Great! Continue
                    </button>
                  </div>
                )}

                {verificationResult?.status === 'needs_review' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                      <Clock className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                        Submitted for Review
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        Queued for Coordinator Review
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
                        {verificationResult.message}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                      <span className="font-bold block text-[11px] uppercase tracking-wide">
                        Status Note:
                      </span>
                      <p>
                        Your photo evidence is preserved safely. Your institution coordinator or NSS officer will review it, and your points will be automatically credited upon approval.
                      </p>
                    </div>

                    <button
                      onClick={handleCloseSubmission}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md"
                    >
                      Understood
                    </button>
                  </div>
                )}

                {verificationResult?.status === 'rejected' && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                      <AlertCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                        Evidence Incomplete
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        Photo Not Verified
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
                        {verificationResult.message}
                      </p>
                    </div>

                    {verificationResult.aiFeedback?.reason && (
                      <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-left text-xs text-rose-900 space-y-1">
                        <span className="font-bold block text-[11px] uppercase tracking-wide">
                          Guidance:
                        </span>
                        <p>{verificationResult.aiFeedback.reason}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCloseSubmission}
                        className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSubmitStep('idle');
                          setSelectedFiles([]);
                          setFilePreviews([]);
                        }}
                        className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Try Again</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: HIGH-RES PHOTO INSPECTION MODAL */}
      {inspectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setInspectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={inspectedPhoto}
              alt="Enlarged Evidence Proof"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
      {/* Testing Utility: Reset Completions */}
      <div className="text-center pt-6 border-t border-slate-200/60 text-xs text-slate-400 flex items-center justify-center gap-2 flex-wrap">
        <span>Need a clean slate to test challenge submissions again?</span>
        <button
          onClick={handleResetLocalData}
          className="text-emerald-700 font-semibold underline hover:text-emerald-900 transition-colors"
        >
          Reset Local Challenge Completions
        </button>
      </div>
    </div>
  );
};
