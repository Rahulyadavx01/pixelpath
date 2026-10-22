import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireFaculty?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireFaculty = false,
}) => {
  const { user, isAuthLoading, isAuthenticated } = useApp();
  const location = useLocation();

  // Show branded loading screen while checking auth session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-sunset p-0.5 shadow-sunset animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-white/95 rounded-[22px] flex items-center justify-center">
            <Zap className="w-7 h-7 text-[#EC4899] fill-[#EC4899]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#24324B]">PIXELPATH</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">Authenticating student session...</p>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect to /login preserving target URL
  if (!isAuthenticated || !user || !user.id) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // Faculty-only route guard
  if (requireFaculty && user.role !== 'faculty') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
