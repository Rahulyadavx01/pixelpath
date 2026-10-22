import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ActivationModal } from '../components/auth/ActivationModal';
import { validateStudentId } from '../lib/studentIdValidator';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  User,
  Sparkles,
  GraduationCap,
  Mail,
  CheckCircle2,
  LogOut
} from 'lucide-react';

interface LoginPageProps {
  defaultRole?: 'student' | 'faculty';
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    signInWithStudentId,
    signInWithFacultyGoogle,
    switchUserRole,
    facultyAllowlist,
    signOutUser,
    requestPasswordReset,
  } = useApp();

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const initialRole =
    defaultRole ||
    (tabParam === 'faculty' || location.pathname.includes('/faculty')
      ? 'faculty'
      : 'student');

  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>(initialRole);

  // Student Form State
  const [studentId, setStudentId] = useState('Mains-24813');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [idError, setIdError] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  // Faculty Form State
  const [facultyEmail, setFacultyEmail] = useState('alan.vance@msot.edu');
  const [facultyPassword, setFacultyPassword] = useState('admin');
  const [facultyError, setFacultyError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setActiveTab(defaultRole);
    } else if (tabParam === 'faculty' || location.pathname.includes('/faculty')) {
      setActiveTab('faculty');
    }
  }, [defaultRole, tabParam, location.pathname]);

  const redirectTarget = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : activeTab === 'faculty'
    ? '/faculty'
    : '/dashboard';

  // Student ID Validation
  const handleValidateIdOnBlur = () => {
    if (!studentId.trim()) {
      setIdError('Enter your student ID in this format: Mains-24813');
      return false;
    }
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setIdError(val.error || 'Enter your student ID in this format: Mains-24813');
      return false;
    }
    setIdError('');
    setStudentId(val.normalizedId);
    return true;
  };

  // Student Login Handler
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    setForgotMsg('');

    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setIdError(val.error || 'Enter your student ID in this format: Mains-24813');
      return;
    }
    setIdError('');
    const normalized = val.normalizedId;
    setStudentId(normalized);

    if (!studentPassword) {
      setStudentError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await signInWithStudentId(normalized, studentPassword);
    setIsLoading(false);

    if (result.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      if (result.error && (result.error.includes('Faculty') || result.error.includes('faculty'))) {
        setStudentError('This account is registered for faculty. Please switch to the Faculty tab.');
      } else {
        setStudentError('Incorrect student ID or password.');
      }
    }
  };

  // Faculty Google OAuth Handler
  const handleFacultyGoogleLogin = async () => {
    setFacultyError('');
    setIsLoading(true);
    try {
      const result = await signInWithFacultyGoogle();
      setIsLoading(false);

      if (result.error) {
        setFacultyError(result.error);
      } else {
        navigate('/faculty', { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setFacultyError(err instanceof Error ? err.message : 'Google authentication failed.');
    }
  };

  // Faculty Email Login Handler (Strict @msot.edu)
  const handleFacultyEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacultyError('');

    const trimmedEmail = facultyEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setFacultyError('Please enter your institutional faculty email.');
      return;
    }

    if (!trimmedEmail.endsWith('@msot.edu')) {
      setFacultyError('Access denied: Only verified @msot.edu institutional faculty accounts are permitted.');
      return;
    }

    if (!facultyPassword) {
      setFacultyError('Please enter your faculty account password.');
      return;
    }

    setIsLoading(true);

    const matchedFaculty = facultyAllowlist.find(
      (f) => f.email.toLowerCase() === trimmedEmail
    );

    if (matchedFaculty) {
      setTimeout(() => {
        switchUserRole('faculty');
        setIsLoading(false);
        navigate('/faculty', { replace: true });
      }, 350);
    } else {
      setIsLoading(false);
      setFacultyError(
        `Access restricted: The email "${trimmedEmail}" is not listed on the active MSOT faculty roster. Contact the Department Dean.`
      );
    }
  };

  const handleForgotPassword = async () => {
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setIdError(val.error || 'Enter your student ID in this format: Mains-24813');
      return;
    }
    setIdError('');
    const res = await requestPasswordReset(val.normalizedId);
    setForgotMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-quest-bg text-quest-textPrimary flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Drifting Aurora Mesh Backdrop */}
      <div className="aurora-mesh-container pointer-events-none">
        <div className="aurora-orb aurora-orb-sky" />
        <div className="aurora-orb aurora-orb-peach" />
        <div className="aurora-orb aurora-orb-pink" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-sky p-0.5 shadow-glowSky flex items-center justify-center mb-3">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Zap className="w-7 h-7 text-quest-skyDark fill-quest-sky" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-quest-textPrimary">PIXELPATH</h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200 font-mono">
              PORTAL LOGIN
            </span>
          </div>
          <p className="text-xs text-quest-textSecondary mt-1">
            Sign in to access your student coursework or faculty console
          </p>
        </div>

        {/* If Already Authenticated, show quick continue banner */}
        {isAuthenticated && user?.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950">Active Session: </span>
                <span className="text-emerald-800 font-medium">{user.name} ({user.role})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(user.role === 'faculty' ? '/faculty' : '/dashboard')}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Continue →
              </button>
              <button
                type="button"
                onClick={signOutUser}
                title="Sign out"
                className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="glass-prominent rounded-3xl border border-white p-7 sm:p-8 shadow-glassProminent space-y-6">
          {/* Dual Portal Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-quest-skyDark shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-quest-skyDark" />
              <span>Student Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('faculty');
                setFacultyError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'faculty'
                  ? 'bg-white text-[#7C3AED] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
              <span>Faculty Login</span>
            </button>
          </div>

          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === 'student' && (
            <motion.div
              key="student-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-200/60 pb-3">
                <h2 className="text-base font-bold text-quest-textPrimary">Student Sign In</h2>
                <p className="text-xs text-quest-textSecondary mt-0.5">
                  Enter your official Student ID (e.g. Mains-24813) and password.
                </p>
              </div>

              {studentError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div>{studentError}</div>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => {
                        setStudentId(e.target.value);
                        if (idError) setIdError('');
                      }}
                      onBlur={handleValidateIdOnBlur}
                      placeholder="Mains-24813"
                      className={`w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border text-sm font-mono font-medium transition-all focus:outline-none focus:ring-2 ${
                        idError
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/30'
                          : 'border-slate-200 focus:ring-quest-sky focus:border-transparent'
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {idError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{idError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-quest-textPrimary">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-quest-skyDark hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-quest-sky focus:border-transparent text-sm font-medium transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {forgotMsg && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>{forgotMsg}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-quest-sky hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm shadow-glassSubtle transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In as Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* First Time Activation CTA */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-quest-textPrimary">First time logging in?</p>
                  <p className="text-[11px] text-quest-textSecondary">Activate your official Student ID</p>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsActivationOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-quest-skyDark font-bold text-xs hover:bg-sky-50 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Activate Account
                </button>
              </div>

              {/* Quick Demo Student Button */}
              <button
                type="button"
                onClick={() => {
                  setStudentId('Mains-24813');
                  setStudentPassword('password123');
                  setIdError('');
                  setStudentError('');
                }}
                className="w-full py-2 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-quest-skyDark" />
                <span>Fill Demo Student (Alex Morgan — Mains-24813)</span>
              </button>
            </motion.div>
          )}

          {/* TAB 2: FACULTY LOGIN */}
          {activeTab === 'faculty' && (
            <motion.div
              key="faculty-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-200/60 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-quest-textPrimary">Faculty Authentication</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    @msot.edu verified only
                  </span>
                </div>
                <p className="text-xs text-quest-textSecondary">
                  Sign in with your verified institutional <span className="font-mono text-quest-textPrimary font-bold">@msot.edu</span> faculty credentials.
                </p>
              </div>

              {facultyError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="leading-relaxed">{facultyError}</div>
                </div>
              )}

              {/* Google Workspace SSO Button */}
              <button
                onClick={handleFacultyGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-quest-textPrimary font-bold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Verifying @msot.edu...' : 'Sign In with Google (@msot.edu)'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200/80 w-full" />
                <span className="bg-white/80 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Or email login
                </span>
              </div>

              {/* Strict @msot.edu Email & Password Form */}
              <form onSubmit={handleFacultyEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1">
                    Faculty Email <span className="text-[#7C3AED] font-mono">(@msot.edu)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={facultyEmail}
                      onChange={(e) => setFacultyEmail(e.target.value)}
                      placeholder="alan.vance@msot.edu"
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm font-medium transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm font-medium transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying Faculty Roster...' : 'Sign In as Faculty'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Faculty Button */}
              <button
                type="button"
                onClick={() => {
                  setFacultyEmail('alan.vance@msot.edu');
                  setFacultyPassword('admin');
                  setFacultyError('');
                }}
                className="w-full py-2 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Fill Demo Faculty (Prof. Alan Vance — alan.vance@msot.edu)</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <ActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        onSuccess={() => setIsActivationOpen(false)}
      />
    </div>
  );
};
