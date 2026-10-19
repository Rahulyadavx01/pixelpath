import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import {
  User,
  KeyRound,
  ShieldCheck,
  Snowflake,
  Database,
  Volume2,
  VolumeX,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    soundEnabled,
    setSoundEnabled,
    changePassword,
    requestPasswordReset,
    isSupabaseActive,
    signOutUser,
    reduceTransparency,
    toggleReduceTransparency,
    toggleLeaderboardOptOut
  } = useApp();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeStatus, setChangeStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });
  const [isChanging, setIsChanging] = useState(false);

  // Forgot Password state
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeStatus({ type: 'idle' });

    if (newPassword.length < 8) {
      setChangeStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsChanging(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setChangeStatus({ type: 'success', message: 'Your password has been securely updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setChangeStatus({ type: 'error', message: res.error || 'Failed to update password.' });
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleRequestFacultyReset = async () => {
    const res = await requestPasswordReset(user.collegeId);
    setResetStatus(res.message);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="pb-4 border-b border-white/60">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-sky-800 border border-cyan-500/30 font-mono">
          ACCOUNT GOVERNANCE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-quest-textPrimary mt-1">Settings & Preferences</h1>
        <p className="text-xs text-quest-textSecondary mt-0.5 font-medium">
          Manage your credentials, accessibility preferences (Reduce Transparency), and platform audio synthesis.
        </p>
      </div>

      {/* Account Info */}
      <div className="glass-regular rounded-3xl border border-white/80 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-quest-textPrimary">Student Account & Campus Identity</h2>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-sky-800 font-mono border border-cyan-500/30">
            {user.role} ACCOUNT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-quest-textSecondary font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user.name}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-quest-textPrimary font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-quest-textSecondary font-semibold block mb-1">Institutional Email</label>
            <input
              type="text"
              readOnly
              value={user.email}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-quest-textPrimary font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-quest-textSecondary font-semibold block mb-1">Official Student / Mains ID</label>
            <input
              type="text"
              readOnly
              value={user.collegeId}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-sky-800 font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-quest-textSecondary font-semibold block mb-1">Academic Cohort Batch</label>
            <input
              type="text"
              readOnly
              value={user.batch || '2024-2028'}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-quest-textPrimary font-semibold cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="glass-regular rounded-3xl border border-white/80 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
          <KeyRound className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-quest-textPrimary">Change Security Password</h2>
        </div>

        {changeStatus.type === 'success' && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{changeStatus.message}</span>
          </div>
        )}

        {changeStatus.type === 'error' && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{changeStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-quest-textSecondary block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-quest-textPrimary focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-quest-textSecondary block mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-quest-textPrimary focus:outline-none focus:border-sky-500 font-mono"
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div>
              <label className="text-xs font-semibold text-quest-textSecondary block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/60 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-quest-textPrimary focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleRequestFacultyReset}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold hover:underline"
            >
              Forgot password? Request Faculty Reset
            </button>

            <button
              type="submit"
              disabled={isChanging}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {isChanging ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          {resetStatus && (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-sky-800 text-xs font-medium">
              {resetStatus}
            </div>
          )}
        </form>
      </div>

      {/* Accessibility & Visual Settings (Liquid Glass & Reduce Transparency) */}
      <div className="glass-regular rounded-3xl border border-white/80 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
          <Sliders className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-quest-textPrimary">Visual Themes & Accessibility</h2>
        </div>

        {/* Reduce Transparency Toggle */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-subtle border border-white/80">
          <div>
            <h3 className="text-xs font-bold text-quest-textPrimary">Reduce Interface Transparency</h3>
            <p className="text-[11px] text-quest-textSecondary mt-0.5 leading-relaxed font-medium">
              Replaces semi-transparent glass layers and backdrop blurs with solid surfaces for enhanced contrast.
            </p>
          </div>

          <button
            onClick={toggleReduceTransparency}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center shrink-0 ${
              reduceTransparency ? 'bg-sky-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
            aria-label="Toggle Reduce Transparency"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Audio Effects Toggle */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-subtle border border-white/80">
          <div>
            <h3 className="text-xs font-bold text-quest-textPrimary">Interactive Audio & Synthesized Chimes</h3>
            <p className="text-[11px] text-quest-textSecondary mt-0.5 leading-relaxed font-medium">
              Plays subtle synthesis chimes when earning verified XP, completing daily sprints, or ascending league tiers.
            </p>
          </div>

          <button
            onClick={setSoundEnabled ? () => setSoundEnabled(!soundEnabled) : undefined}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center shrink-0 ${
              soundEnabled ? 'bg-emerald-500 justify-end shadow-sm' : 'bg-slate-300 justify-start'
            }`}
            aria-label="Toggle Sound Effects"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Leaderboard Visibility & Privacy (MSOT Privacy Opt-Out) */}
      <div className="glass-regular rounded-3xl border border-white/80 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
          <Eye className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-quest-textPrimary">Leaderboard Visibility & Privacy</h2>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-subtle border border-white/80">
          <div>
            <h3 className="text-xs font-bold text-quest-textPrimary">Hide Me from Public Cohort Leaderboards</h3>
            <p className="text-[11px] text-quest-textSecondary mt-0.5 leading-relaxed font-medium">
              When enabled, your name and standing are hidden from other students on cohort leaderboards. Your verified XP accumulation, level progression, and academic milestones remain 100% active.
            </p>
          </div>

          <button
            onClick={toggleLeaderboardOptOut}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center shrink-0 ${
              user.leaderboardOptOut ? 'bg-amber-500 justify-end shadow-sm' : 'bg-slate-300 justify-start'
            }`}
            aria-label="Toggle Leaderboard Opt Out"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Streak Freeze & Academic Safety */}
      <div className="glass-regular rounded-3xl border border-white/80 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
          <Snowflake className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-quest-textPrimary">Streak Freeze Shield Allocation</h2>
        </div>

        <div className="p-4 rounded-2xl glass-subtle border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sky-800 font-black text-sm font-mono">
              {user.streakFreezeCount}
            </div>
            <div>
              <p className="text-xs font-bold text-quest-textPrimary">Active Streak Freezes Available</p>
              <p className="text-[11px] text-quest-textSecondary font-medium">
                Auto-applied if a calendar day is missed due to illness or personal reasons.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30">
            Protected
          </span>
        </div>
      </div>

      {/* Sign Out & Session Reset */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-quest-textSecondary font-mono">
          <Database className="w-4 h-4 text-purple-600" />
          <span>{isSupabaseActive ? 'Supabase Session Active' : 'Demo Roster Session Active'}</span>
        </div>

        <button
          onClick={signOutUser}
          className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>

      {/* Academic Charter Reference */}
      <div className="p-4 rounded-2xl glass-subtle border border-white/80 flex items-center justify-between text-xs text-quest-textSecondary">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliant with MSOT Gamified Learning Student Proposal specifications</span>
        </div>
        <span className="text-sky-700 font-semibold cursor-pointer hover:underline">
          Charter V1.4
        </span>
      </div>
    </div>
  );
};
