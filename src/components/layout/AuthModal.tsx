import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ActivationModal } from '../auth/ActivationModal';
import { validateStudentId } from '../../lib/studentIdValidator';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Database,
  User
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithStudentId, isSupabaseActive, switchUserRole } = useApp();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showActivation, setShowActivation] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = validateStudentId(studentId);
    if (!val.isValid) {
      setError(val.error || 'Enter your student ID in this format: Mains-24813');
      return;
    }

    setIsLoading(true);
    const result = await signInWithStudentId(val.normalizedId, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 900);
    } else {
      setError('Incorrect student ID or password.');
    }
  };

  const handleDemoSignIn = async (role: 'student' | 'faculty') => {
    setIsLoading(true);
    if (role === 'faculty') {
      switchUserRole('faculty');
    } else {
      await signInWithStudentId('Mains-24813', 'password123');
    }
    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 700);
  };

  return (
    <>
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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-3xl bg-white border border-[#F1E5E9] p-8 shadow-2xl z-10 space-y-5"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[#94A3B8] hover:text-[#24324B] p-1.5 rounded-xl hover:bg-[#FFF5F8]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 flex items-center justify-center text-white mx-auto shadow-sm mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#24324B]">Student & Faculty Sign In</h3>
              <p className="text-xs text-[#64748B]">
                Sign in with your official college ID and password
              </p>
            </div>

            {/* Connection status tag */}
            <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#F1E5E9] flex items-center justify-between text-xs">
              <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
                Auth Engine:
              </span>
              <span
                className={`font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  isSupabaseActive
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {isSupabaseActive ? '● Supabase Auth' : '● Verified Roster Session'}
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Authenticated! Redirecting to dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#64748B] font-bold block mb-1">Mains Student / Faculty ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="Mains-24813"
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FFF9F5] border border-[#F1E5E9] text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9A8D4] font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#64748B] font-bold block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FFF9F5] border border-[#F1E5E9] text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9A8D4]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => setShowActivation(true)}
                  className="text-pink-600 font-bold hover:underline"
                >
                  First time? Activate account
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In with Student ID'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Bypass Buttons */}
            <div className="pt-2 border-t border-[#F1E5E9] space-y-2">
              <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block text-center">
                Reviewer Quick Sign-In
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('student')}
                  className="py-2 px-2 rounded-xl bg-[#FFF9F5] hover:bg-[#FCE7F3]/60 border border-[#F1E5E9] text-[#24324B] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                  <span>Student (Alex)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('faculty')}
                  className="py-2 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Faculty (Prof. Alan)</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Roster Activation Modal */}
      <ActivationModal
        isOpen={showActivation}
        onClose={() => setShowActivation(false)}
        onSuccess={() => {
          setShowActivation(false);
          onClose();
        }}
      />
    </>
  );
};
