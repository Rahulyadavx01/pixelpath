import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  Trophy,
  User,
  MoreHorizontal,
  Code2,
  Shield,
  Users,
  Award,
  ShoppingBag,
  MessagesSquare,
  ShieldCheck,
  Settings,
  X,
  Sparkles,
  Compass
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const location = useLocation();
  const { user } = useApp();
  const isFaculty = user.role === 'faculty';

  const primaryTabs = isFaculty
    ? [
        { name: 'Console', path: '/faculty', icon: LayoutDashboard },
        { name: 'D. Quest', path: '/faculty/daily-quest', icon: Compass },
        { name: 'Quizzes', path: '/faculty/quizzes', icon: BookOpen },
        { name: 'Problems', path: '/faculty/problems', icon: Code2 },
        { name: 'Roster', path: '/faculty/students', icon: ShieldCheck },
      ]
    : [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Quest', path: '/daily-quest', icon: Compass, badge: 'DAILY' },
        { name: 'Quiz', path: '/quiz', icon: BookOpen },
        { name: 'Arena', path: '/coding', icon: Code2, badge: 'C++' },
        { name: 'Rank', path: '/leaderboard', icon: Trophy },
      ];

  const drawerLinks = isFaculty
    ? [
        { name: 'Console Overview', path: '/faculty', icon: LayoutDashboard, desc: 'Analytics & Health' },
        { name: 'Daily Quest Manager', path: '/faculty/daily-quest', icon: Compass, desc: 'Schedule Daily Problems' },
        { name: 'Curriculum Quizzes', path: '/faculty/quizzes', icon: BookOpen, desc: 'Author & Schedule' },
        { name: 'Coding Problems', path: '/faculty/problems', icon: Code2, desc: 'Manage C++ Problems' },
        { name: 'Team Battles', path: '/faculty/battles', icon: Users, desc: 'Squad Competitions' },
        { name: 'Integrity Flags', path: '/faculty/integrity', icon: ShieldCheck, desc: 'Anti-Gaming Watchdog' },
        { name: 'Audit Log', path: '/faculty/audit', icon: Settings, desc: 'Faculty Event Trail' },
      ]
    : [
        { name: 'Course Modules', path: '/courses', icon: BookOpen, desc: 'Curriculum Syllabus' },
        { name: 'Weekly Leagues', path: '/leagues', icon: Shield, desc: 'Division Standing' },
        { name: 'Team Battles', path: '/battles', icon: Users, desc: 'Live Squad Arena' },
        { name: 'Achievements', path: '/achievements', icon: Award, desc: 'Mastery Badges' },
        { name: 'Rewards Store', path: '/rewards', icon: ShoppingBag, desc: 'Redeem XP Perks' },
        { name: 'Community Discussions', path: '/community', icon: MessagesSquare, desc: 'Peer Help & Threads' },
        { name: 'Settings & Privacy', path: '/settings', icon: Settings, desc: 'Account Preferences' },
      ];

  return (
    <>
      {/* Floating Mobile Bottom Navigation Dock */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-surface/95 backdrop-blur-md rounded-card px-2 py-1.5 flex items-center justify-around shadow-lift border border-line">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-inner min-w-[50px] min-h-[46px] transition-all relative ${
                isActive ? 'text-brand' : 'text-ink-3 hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-badge bg-streak-tint border border-[#FBDDA0] text-streak-ink text-[8px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-bold tracking-tight ${isActive ? 'text-brand font-extrabold' : 'text-ink-3'}`}>
                {tab.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-1 rounded-full bg-brand shadow-xs" />
              )}
            </NavLink>
          );
        })}

        {/* More Actions Trigger */}
        <button
          onClick={() => setShowDrawer(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-inner min-w-[50px] min-h-[46px] text-ink-3 hover:text-ink"
          aria-label="Open all modules drawer"
        >
          <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 font-bold tracking-tight">More</span>
        </button>
      </nav>

      {/* Slide-over More Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-surface rounded-t-card p-6 shadow-lift border-t border-line animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-inner bg-brand-tint flex items-center justify-center text-brand">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink">All Modules</h3>
                  <p className="text-[10px] text-ink-3 font-mono">{isFaculty ? 'Faculty Operations' : 'Student Navigation'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-inner bg-surface-2 hover:bg-line flex items-center justify-center text-ink-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
              {drawerLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowDrawer(false)}
                  className="flex items-center gap-3 p-3 rounded-inner bg-surface-2 hover:bg-surface border border-line transition-all group"
                >
                  <div className="w-10 h-10 rounded-inner bg-brand-tint flex items-center justify-center text-brand group-hover:scale-105 transition-transform shrink-0">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{link.name}</p>
                    <p className="text-[10px] text-ink-3 truncate">{link.desc}</p>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
