import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowLeft, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyFacultySession, signInWithFacultyGoogle, signOutUser } = useApp();

  const [status, setStatus] = useState<'verifying' | 'restricted' | 'success'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      try {
        const result = await verifyFacultySession();
        if (!isMounted) return;

        if (result.success && result.isAllowed) {
          setStatus('success');
          // Retrieve intended redirect if saved
          const searchParams = new URLSearchParams(location.search);
          const redirectTarget = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')!) : '/faculty/quizzes';
          setTimeout(() => {
            navigate(redirectTarget, { replace: true });
          }, 800);
        } else {
          setStatus('restricted');
          setErrorMessage(result.error || 'Access restricted - your account is not registered as faculty. Contact your administrator.');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setStatus('restricted');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication verification failed.');
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [verifyFacultySession, navigate, location.search]);

  const handleTryAnother = async () => {
    await signOutUser();
    await signInWithFacultyGoogle();
  };

  const handleReturnHome = async () => {
    await signOutUser();
    navigate('/login?tab=faculty', { replace: true });
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-sunset p-1 flex items-center justify-center animate-spin">
            <div className="w-full h-full bg-white rounded-[20px]" />
          </div>
          <Zap className="w-7 h-7 text-[#EC4899] fill-[#EC4899] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <h2 className="text-xl font-black text-[#24324B]">Verifying Faculty Credentials</h2>
        <p className="text-xs text-[#64748B] mt-1.5 max-w-sm">
          Checking institutional single sign-on against the MSOT Faculty Allowlist...
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mb-6 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#24324B]">Faculty Authorization Confirmed</h2>
        <p className="text-xs text-[#64748B] mt-1.5">
          Redirecting to the Faculty Quiz Control Room...
        </p>
      </div>
    );
  }

  // Restricted Screen
  return (
    <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Soft atmospheric gradient */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#FCE7F3]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-[#DBEAFE]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-white rounded-3xl border border-[#F1E5E9] shadow-2xl p-7 sm:p-9 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono">
          Security Restriction
        </span>

        <h2 className="text-2xl font-black text-[#24324B] tracking-tight mt-3">
          Access Restricted
        </h2>

        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          {errorMessage || 'Your Google account is verified with @msot.edu, but is not registered on the official faculty allowlist.'}
        </p>

        <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left">
          <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
            Next Steps for Faculty & Staff
          </h4>
          <p className="text-[11px] text-amber-800 mt-1 leading-normal">
            Contact the MSOT Department Chair or Academic Dean to add your official institutional email to the verified faculty roster.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleTryAnother}
            className="w-full h-11 px-4 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Another Google Account</span>
          </button>

          <button
            type="button"
            onClick={handleReturnHome}
            className="w-full h-11 px-4 rounded-2xl bg-white border border-[#F1E5E9] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#64748B]" />
            <span>Return to Questify</span>
          </button>
        </div>
      </div>
    </div>
  );
};
