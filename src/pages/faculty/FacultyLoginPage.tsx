import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Award,
  GraduationCap,
  Mail,
  Lock,
  KeyRound
} from 'lucide-react';

export const FacultyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithFacultyGoogle, switchUserRole, facultyAllowlist } = useApp();

  const [email, setEmail] = useState('faculty@pixelpath.edu');
  const [password, setPassword] = useState('admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : '/faculty';

  // 1. Google OAuth Flow
  const handleFacultyGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await signInWithFacultyGoogle();
      setIsLoading(false);

      if (result.error) {
        setErrorMsg(result.error);
      } else {
        // Successful authentication (live OAuth or simulated session)
        navigate(redirectTarget, { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Google authentication encountered an issue.');
    }
  };

  // 2. Email & Password Flow
  const handleFacultyEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your institutional faculty email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Verify against faculty allowlist or standard faculty domain
    const isAllowlisted = facultyAllowlist.some(
      (f) => f.email.toLowerCase() === trimmedEmail
    );
    const isDemoFaculty =
      trimmedEmail === 'faculty@pixelpath.edu' ||
      trimmedEmail === 'faculty@questify.edu' ||
      trimmedEmail === 'alan.vance@msot.edu' ||
      trimmedEmail.endsWith('@msot.edu') ||
      trimmedEmail.includes('faculty') ||
      trimmedEmail.includes('admin');

    if (isAllowlisted || isDemoFaculty) {
      setTimeout(() => {
        switchUserRole('faculty');
        setIsLoading(false);
        navigate(redirectTarget, { replace: true });
      }, 300);
    } else {
      setIsLoading(false);
      setErrorMsg('Access restricted. Your email is not registered on the faculty roster.');
    }
  };

  // 3. Instant Demo Access
  const handleDemoFacultyLogin = () => {
    switchUserRole('faculty');
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="min-h-screen bg-quest-bg text-quest-textPrimary flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Drifting Aurora Mesh Backdrop */}
      <div className="aurora-mesh-container">
        <div className="aurora-orb aurora-orb-sky" />
        <div className="aurora-orb aurora-orb-peach" />
        <div className="aurora-orb aurora-orb-pink" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-sky p-0.5 shadow-glowSky flex items-center justify-center mb-3">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#7C3AED]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-quest-textPrimary">PIXELPATH</h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] border border-purple-200 font-mono">
              FACULTY
            </span>
          </div>
          <p className="text-xs text-quest-textSecondary mt-1">
            Academic Operations & Governance Console
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-prominent rounded-3xl border border-white p-8 shadow-glassProminent space-y-6">
          <div className="border-b border-slate-200/60 pb-4">
            <h2 className="text-base font-bold text-quest-textPrimary">Faculty Portal Authentication</h2>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Sign in with your Google account or institutional credentials.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed">{errorMsg}</div>
            </motion.div>
          )}

          {/* Primary Option: Google OAuth Button */}
          <button
            onClick={handleFacultyGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-quest-textPrimary font-bold text-sm shadow-sm transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
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
            <span>{isLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-white/80 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or sign in with email
            </span>
          </div>

          {/* Secondary Option: Email & Password Form */}
          <form onSubmit={handleFacultyEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1">
                Faculty Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@pixelpath.edu"
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm font-medium transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-sm font-medium transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In as Faculty'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handleDemoFacultyLogin}
              className="w-full py-2.5 px-4 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 text-[#7C3AED] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click Faculty Demo Access</span>
            </button>
          </div>

          {/* Link to Student Portal */}
          <div className="pt-2 border-t border-slate-200/60 text-center">
            <p className="text-xs text-quest-textSecondary">
              Are you a student looking for coursework?{' '}
              <Link to="/login" className="font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1">
                Student Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
