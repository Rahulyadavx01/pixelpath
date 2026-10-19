import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { ToastContainer } from '../ui/ToastContainer';
import { DemoTourHUD } from './DemoTourHUD';
import { AuthModal } from './AuthModal';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isLogin = location.pathname === '/login';

  // If on landing or dedicated login page, render standalone with aurora backdrop
  if (isLanding || isLogin) {
    return (
      <div className="min-h-screen bg-[#070B17] text-[#F8FAFC] relative overflow-hidden">
        {/* Animated Aurora Backdrop */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-purple-600/15 blur-[120px] animate-aurora-drift" />
          <div className="absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/15 blur-[130px] animate-aurora-drift" style={{ animationDelay: '-5s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-500/10 blur-[140px] animate-aurora-drift" style={{ animationDelay: '-10s' }} />
        </div>
        <div className="relative z-10">
          <Outlet />
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          <DemoTourHUD />
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B17] text-[#F8FAFC] flex relative overflow-x-hidden">
      {/* Animated Liquid Aurora Gradient Mesh Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-purple-600/15 blur-[120px] animate-aurora-drift" />
        <div className="absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/15 blur-[130px] animate-aurora-drift" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-500/10 blur-[140px] animate-aurora-drift" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Desktop Left Sidebar (Floating Glass) */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8 relative z-10">
        {/* Top Header (Floating Glass) */}
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* MSOT Integrity Banner (Frosted Liquid Glass Accent) */}
        <div className="glass-subtle border-b border-white/60 px-4 lg:px-8 py-2 flex items-center justify-between text-[11px] text-quest-textSecondary">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
            <span className="font-bold text-quest-textPrimary">MSOT Learning Standard:</span>
            <span className="hidden sm:inline font-medium">100% verified learning actions • Zero negative XP • Separated from official grades</span>
            <span className="sm:hidden font-medium">Verified learning actions • Never affects GPA</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sky-800 font-mono font-bold text-[10px] bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full hidden md:inline">
              SYSTEM INTEGRITY: 98.7%
            </span>
          </div>
        </div>

        {/* Page Content View */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Glass Dock */}
      <div className="relative z-20">
        <MobileNav />
      </div>

      {/* Global Quick Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Institutional Student Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Hackathon Demo Tour Stepper */}
      <DemoTourHUD />

      {/* Floating Action / XP Notification Toast Container */}
      <ToastContainer />
    </div>
  );
};
