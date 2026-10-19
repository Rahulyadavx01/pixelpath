import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { ToastContainer } from '../ui/ToastContainer';
import { AuthModal } from './AuthModal';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-canvas bg-page-mesh bg-fixed font-sans text-ink antialiased flex relative overflow-x-hidden selection:bg-brand/20">
      {/* Desktop Left Sidebar */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8 relative z-10">
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} portalMode="student" />

        {/* MSOT Integrity Banner */}
        <div className="bg-surface/80 backdrop-blur border-b border-line px-4 lg:px-8 py-2 flex items-center justify-between text-[11px] text-ink-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <span className="font-semibold text-ink">MSOT Campus Cloud:</span>
            <span className="truncate">Active Term 2026-2027 • Anti-Gaming Verification Engine Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="inline-flex h-[22px] items-center gap-1 font-mono text-[10px] text-win-ink bg-win-tint px-2 rounded-badge border border-[#BDEBD7]">
              <ShieldCheck className="w-3 h-3 text-win" />
              Non-Academic Marks Protected
            </span>
            <span className="font-mono text-[10px] text-brand-ink flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              PIXELPATH Engine
            </span>
          </div>
        </div>

        {/* Page Content Outlet */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <MobileNav />

      {/* Global Modals & Notifications */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};
