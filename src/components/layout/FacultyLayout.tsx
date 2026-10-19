import React from 'react';
import { Outlet } from 'react-router-dom';
import { FacultySidebar } from './FacultySidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { ToastContainer } from '../ui/ToastContainer';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Award } from 'lucide-react';

export const FacultyLayout: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();

  return (
    <div className="min-h-screen bg-quest-bg text-quest-textPrimary flex relative overflow-x-hidden selection:bg-quest-sky/30">
      {/* Drifting Aurora Mesh Backdrop */}
      <div className="aurora-mesh-container">
        <div className="aurora-orb aurora-orb-sky" />
        <div className="aurora-orb aurora-orb-peach" />
        <div className="aurora-orb aurora-orb-pink" />
      </div>

      {/* Desktop Left Faculty Sidebar */}
      <div className="relative z-20">
        <FacultySidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8 relative z-10">
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} portalMode="faculty" />

        {/* Faculty Security & Audit Header Strip */}
        <div className="glass-subtle border-b border-white/60 px-4 lg:px-8 py-2 flex items-center justify-between text-[11px] text-quest-textSecondary">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-quest-textPrimary">Faculty Authorized Workspace:</span>
            <span className="truncate">Restricted to verified @msot.edu faculty allowlist • All authoring operations versioned and audited</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 font-mono text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              <Award className="w-3 h-3 text-quest-skyDark" />
              Role: Faculty Officer
            </span>
          </div>
        </div>

        {/* Faculty Page Content Outlet */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Dock for Faculty */}
      <MobileNav />

      {/* Global Modals & Notifications */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
};
