import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Building,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserCategory, InstitutionType } from '../types';

interface AuthPageProps {
  setActiveTab: (tab: string) => void;
}

const KERALA_DISTRICTS = [
  'Thrissur',
  'Ernakulam',
  'Palakkad',
  'Kozhikode',
  'Thiruvananthapuram',
  'Malappuram',
  'Kottayam',
  'Kollam',
  'Alappuzha',
  'Kannur',
  'Kasaragod',
  'Wayanad',
  'Idukki',
  'Pathanamthitta',
  'Other State / District'
];

export const AuthPage: React.FC<AuthPageProps> = ({ setActiveTab }) => {
  const { login, register, googleLogin, adminLogin } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState<UserCategory>('Student');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('College');
  const [district, setDistrict] = useState('Thrissur');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password strength meter
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, text: 'Too short (min 6 chars)', color: 'bg-rose-500' };
    let score = 1;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (pass.length >= 8) score++;

    if (score <= 2) return { score: 2, text: 'Weak', color: 'bg-amber-500' };
    if (score === 3 || score === 4) return { score: 3, text: 'Good', color: 'bg-emerald-500' };
    return { score: 4, text: 'Strong', color: 'bg-emerald-700' };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(adminEmail, adminPassword);
      setActiveTab('admin');
    } catch (err: any) {
      setError(err.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        category,
        institution_name: institutionName,
        institution_type: institutionType,
        district
      });
      setSuccess('Registration successful! Redirecting to your dashboard...');
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSimulated = async () => {
    // Interactive Google sign in prompt
    const simulatedEmail = prompt(
      'Enter your Google account email for direct sign-in (or click OK with the sample to test):',
      'student.vast@gmail.com'
    );
    if (!simulatedEmail) return;

    const simulatedName = prompt('Enter your name for your Google account:', 'Campus Volunteer') || 'Google Volunteer';

    try {
      setLoading(true);
      const res = await googleLogin({
        email: simulatedEmail,
        name: simulatedName,
        category: 'Student',
        institution_name: 'Vidya Academy of Science and Technology',
        institution_type: 'College',
        district: 'Thrissur'
      });
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 text-left">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-lg space-y-6">
        {/* Toggle between User Login, Register, and Admin Access */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(null); setSuccess(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all text-center ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(null); setSuccess(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all text-center ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            New User
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin'); setError(null); setSuccess(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
              authMode === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
            <span>Admin</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Existing User Login Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-xs text-slate-500">
                Log in to access your saved footprints, green points, and community leaderboard.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Sign In Option */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSimulated}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center justify-between">
              <span>Campus evaluator or volunteer?</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('volunteer@vidya.ac.in');
                  setLoginPassword('vidya@2026');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
              >
                Autofill demo login
              </button>
            </div>

            {/* Quick Admin Access Link inside login form */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need coordinator privileges?</span>
              <button
                type="button"
                onClick={() => { setAuthMode('admin'); setError(null); }}
                className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Login →</span>
              </button>
            </div>
          </form>
        ) : authMode === 'admin' ? (
          /* Administrator Access Form */
          <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h2 className="text-lg font-bold text-amber-950">Administrator Access</h2>
              </div>
              <p className="text-xs text-amber-900">
                Authorized access for VAST Energy Cell coordinators & programme administrators.
              </p>
            </div>

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
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Enter administrator password"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Authorizing Access...' : 'Authorize Admin Access'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 text-center space-y-1">
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

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); }}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                ← Return to Normal User Login
              </button>
            </div>
          </form>
        ) : (
          /* New User Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Create Your Profile</h2>
              <p className="text-xs text-slate-500">
                Join students and NSS volunteers tracking daily campus and household sustainability.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Anjana Nair"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="anjana@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>

            {/* Password strength guidance */}
            {password && (
              <div className="text-[11px] flex items-center justify-between">
                <span className="text-slate-500">Strength: <strong className="text-slate-800">{strength.text}</strong></span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`w-6 h-1 rounded-full ${
                        strength.score >= step ? strength.color : 'bg-slate-200'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>
            )}

            {/* User Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UserCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Student">Student</option>
                <option value="NSS Volunteer">NSS Volunteer</option>
                <option value="Teacher">Teacher / Faculty</option>
                <option value="General Public">General Public</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Institution Details (contextual) */}
            {(category === 'Student' || category === 'NSS Volunteer' || category === 'Teacher') && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Institutional Affiliation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Institution Type
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                    >
                      <option value="College">College / University</option>
                      <option value="School">School</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                      placeholder="e.g. Vidya Academy of Science & Technology"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District / Region *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all text-sm mt-2"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
