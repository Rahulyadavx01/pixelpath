import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'faculty';
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthLoading, isAuthenticated } = useApp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-quest-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-3xl p-0.5 bg-gradient-sky shadow-glowSky animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-white/95 rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-quest-sky" />
          </div>
        </div>
        <div className="text-center font-mono text-xs text-quest-textSecondary">
          Validating verified credentials...
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isAuthenticated || !user || !user.id) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    if (allowedRole === 'faculty') {
      return <Navigate to={`/faculty/login?redirect=${redirectParam}`} replace />;
    }
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  // Role mismatch
  if (user.role !== allowedRole) {
    if (allowedRole === 'faculty') {
      // Student tried to access faculty portal
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-quest-bg">
          <div className="max-w-md w-full p-8 rounded-3xl glass-regular border border-white text-center space-y-4 shadow-glassProminent">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-quest-textPrimary">Faculty Access Required</h2>
            <p className="text-sm text-quest-textSecondary leading-relaxed">
              Your account (<strong className="font-mono text-quest-textPrimary">{user.collegeId || user.email}</strong>) is registered as a student. The faculty console requires an authorized <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">@msot.edu</code> faculty profile.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href="/dashboard"
                className="flex-1 py-2.5 px-4 rounded-xl bg-quest-sky text-white font-bold text-sm shadow-glassSubtle hover:brightness-105 transition-all text-center"
              >
                Return to Dashboard
              </a>
              <a
                href="/faculty/login"
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white/80 text-quest-textPrimary font-bold text-sm hover:bg-slate-50 transition-all text-center"
              >
                Faculty Sign In
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      // Faculty tried to view student gameplay page
      return <Navigate to="/faculty" replace />;
    }
  }

  return <>{children}</>;
};
