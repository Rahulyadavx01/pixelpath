import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { validateStudentId } from '../../lib/studentIdValidator';
import {
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { verifyRosterId, activateStudentAccount } = useApp();

  const [step, setStep] = useState<'verify_id' | 'create_password' | 'success'>('verify_id');
  const [studentId, setStudentId] = useState('');
  const [rosterData, setRosterData] = useState<{
    fullName: string;
    department: string;
    email: string;
    role: string;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyId = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setErrorMsg(val.error || 'Enter your student ID in this format: Mains-24813');
      return;
    }

    setStudentId(val.normalizedId);
    setIsLoading(true);
    const result = await verifyRosterId(val.normalizedId);
    setIsLoading(false);

    if (result.success && result.student) {
      setRosterData({
        fullName: result.student.fullName,
        department: result.student.department,
        email: result.student.email,
        role: result.student.role,
      });
      setStep('create_password');
    } else {
      setErrorMsg(result.error || 'Student ID not found in roster.');
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type your password.');
      return;
    }

    setIsLoading(true);
    const result = await activateStudentAccount(studentId.trim(), password);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(result.error || 'Failed to activate account. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#24324B]/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-[#F1E5E9] shadow-2xl p-6 sm:p-7 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#64748B] hover:text-[#24324B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#DB2777] border border-[#F9A8D4]">
                FIRST-TIME REGISTRATION
              </span>
              <span className="text-xs text-[#64748B]">Roster Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#24324B]">
              Activate Your Questify Account
            </h2>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Verify your official Student ID on the college roster to set your permanent credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'verify_id' && (
            <form onSubmit={handleVerifyId} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Official Student ID (Mains ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="Mains-24813"
                    className="w-full px-4 py-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-sm text-[#24324B] placeholder-[#94A3B8] font-mono focus:outline-none focus:border-[#F472B6] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1.5">
                  Try demo IDs: <code className="font-bold text-[#24324B]">Mains-24813</code> (Alex) or <code className="font-bold text-[#24324B]">Mains-24814</code> (Kenji).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#24324B] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Roster Security</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Only student IDs pre-approved by college faculty may activate an account. Passwords are encrypted through Supabase Auth.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Checking Roster...</span>
                ) : (
                  <>
                    <span>Verify My Student ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'create_password' && rosterData && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              {/* Student details verified banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Identity Confirmed
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {studentId}
                  </span>
                </div>
                <p className="font-bold text-sm text-[#24324B]">{rosterData.fullName}</p>
                <p className="text-[11px] text-[#64748B]">
                  {rosterData.department} • {rosterData.email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-sm text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F472B6] transition-colors"
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-sm text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F472B6] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('verify_id')}
                  className="px-4 py-3 rounded-2xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:text-[#24324B] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Activating Account...' : 'Set Password & Activate'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#24324B]">Account Activated!</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Welcome to Questify, {rosterData?.fullName}. Signing you into your dashboard...
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
