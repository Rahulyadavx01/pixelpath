import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ActivationModal } from '../components/auth/ActivationModal';
import { validateStudentId, normalizeStudentId } from '../lib/studentIdValidator';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  User,
  Sparkles,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithStudentId, requestPasswordReset } = useApp();

  const [studentId, setStudentId] = useState('Mains-24813');
  const [password, setPassword] = useState('password123');
  const [idError, setIdError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : '/dashboard';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setForgotMsg('');

    // Field-level validation on submit
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setIdError(val.error || 'Enter your student ID in this format: Mains-24813');
      return;
    }
    setIdError('');
    const normalized = val.normalizedId;
    setStudentId(normalized);

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await signInWithStudentId(normalized, password);
    setIsLoading(false);

    if (result.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      if (result.error && (result.error.includes('Faculty') || result.error.includes('faculty'))) {
        setErrorMsg('This page is for students. Use Faculty Login.');
      } else {
        // Clear error for wrong ID or password, without revealing which one is wrong
        setErrorMsg('Incorrect student ID or password.');
      }
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
    <div className="min-h-screen bg-quest-bg text-quest-textPrimary flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Drifting Aurora Mesh Backdrop */}
      <div className="aurora-mesh-container">
        <div className="aurora-orb aurora-orb-sky" />
        <div className="aurora-orb aurora-orb-peach" />
        <div className="aurora-orb aurora-orb-pink" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-sky p-0.5 shadow-glowSky flex items-center justify-center mb-3">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Zap className="w-7 h-7 text-quest-skyDark fill-quest-sky" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-quest-textPrimary">PIXELPATH</h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200 font-mono">
              STUDENT
            </span>
          </div>
          <p className="text-xs text-quest-textSecondary mt-1">
            Student ID & Password Authentication
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-prominent rounded-3xl border border-white p-8 shadow-glassProminent space-y-6">
          <div className="border-b border-slate-200/60 pb-3">
            <h2 className="text-base font-bold text-quest-textPrimary">Student Sign In</h2>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Enter your official Student ID (e.g. Mains-24813) and password.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed font-semibold">{errorMsg}</div>
            </motion.div>
          )}

          {forgotMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-quest-skyDark text-xs flex items-start gap-2.5"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-quest-sky" />
              <div className="leading-relaxed">{forgotMsg}</div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">
                STUDENT ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={studentId}
                  disabled={isLoading}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    if (idError) setIdError('');
                  }}
                  onBlur={handleValidateIdOnBlur}
                  placeholder="Mains-24813"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border ${
                    idError
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-quest-sky'
                  } text-xs font-mono font-bold text-quest-textPrimary outline-none transition-all placeholder:text-slate-400 disabled:opacity-50`}
                />
              </div>
              {idError && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{idError}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-quest-textPrimary font-mono">PASSWORD</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-quest-skyDark hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200 focus:border-quest-sky text-xs text-quest-textPrimary outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-quest-sky hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm shadow-glassSubtle transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to PixelPath'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* First Time Activation CTA */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-quest-textPrimary">First time logging in?</p>
              <p className="text-[11px] text-quest-textSecondary">Activate your official Student ID</p>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsActivationOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-quest-skyDark font-bold text-xs hover:bg-sky-50 shadow-xs transition-all disabled:opacity-50"
            >
              Activate Account
            </button>
          </div>

          {/* Link to Faculty Portal */}
          <div className="pt-4 border-t border-slate-200/60 text-center">
            <p className="text-xs text-quest-textSecondary">
              Are you faculty or instructor?{' '}
              <Link
                to="/faculty/login"
                className="font-bold text-quest-skyDark hover:underline inline-flex items-center gap-1"
              >
                Faculty Portal <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>
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
