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
  ExternalLink
} from 'lucide-react';

export const FacultyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithFacultyGoogle, switchUserRole } = useApp();

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : '/faculty';

  const handleFacultyGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const result = await signInWithFacultyGoogle();
    setIsLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    }
  };

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
              <ShieldCheck className="w-7 h-7 text-quest-skyDark" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-quest-textPrimary">QUESTIFY</h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200 font-mono">
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
            <h2 className="text-base font-bold text-quest-textPrimary">Faculty Authentication</h2>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Sign in with your official <span className="font-mono text-quest-textPrimary font-semibold">@msot.edu</span> faculty Google account.
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

          {/* Google OAuth Button */}
          <div className="space-y-3">
            <button
              onClick={handleFacultyGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-quest-textPrimary font-bold text-sm shadow-sm transition-all disabled:opacity-50"
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
              <span>{isLoading ? 'Verifying with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Quick Demo Switcher */}
            <button
              onClick={handleDemoFacultyLogin}
              className="w-full py-2.5 px-4 rounded-2xl glass-subtle hover:bg-sky-50/80 border border-sky-200 text-quest-skyDark font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Faculty Demo Mode (Prof. Alan Vance)</span>
            </button>
          </div>

          {/* Verification Requirement Notice */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
            <p className="text-[11px] font-bold text-quest-skyDark flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Verified Faculty Allowlist Required
            </p>
            <p className="text-[11px] text-quest-textSecondary leading-relaxed">
              Google OAuth accounts are matched server-side against the MSOT Faculty Roster table. Unregistered accounts are blocked from accessing faculty management tools.
            </p>
          </div>

          {/* Link to Student Portal */}
          <div className="pt-4 border-t border-slate-200/60 text-center">
            <p className="text-xs text-quest-textSecondary">
              Are you a student looking for coursework?{' '}
              <Link to="/login" className="font-bold text-quest-skyDark hover:underline inline-flex items-center gap-1">
                Student Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
