import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  Code2,
  Trophy,
  Shield,
  Users,
  Award,
  ShoppingBag,
  MessagesSquare,
  User,
  Settings,
  Flame,
  Snowflake,
  Sparkles,
  Compass,
  LogOut,
  ExternalLink,
  History
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { user, signOutUser } = useApp();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  const navSections: NavSection[] = [
    {
      group: 'STUDENT HUB',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Daily Quest', path: '/daily-quest', icon: Compass, badge: 'DAILY' },
        { name: 'Daily Quiz', path: '/quiz', icon: BookOpen },
      ],
    },
    {
      group: 'LEARNING & CODE',
      items: [
        { name: 'Code Arena', path: '/coding', icon: Code2, badge: 'C++17' },
        { name: 'Course Modules', path: '/courses', icon: BookOpen },
      ],
    },
    {
      group: 'COMPETITION',
      items: [
        { name: 'Cohort Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Weekly Leagues', path: '/leagues', icon: Shield },
        { name: 'Team Battles', path: '/battles', icon: Users, badge: 'LIVE' },
      ],
    },
    {
      group: 'PROGRESSION',
      items: [
        { name: 'XP Ledger', path: '/xp-history', icon: History },
        { name: 'Achievements', path: '/achievements', icon: Award },
        { name: 'Rewards Store', path: '/rewards', icon: ShoppingBag },
        { name: 'Community Discussions', path: '/community', icon: MessagesSquare },
        { name: 'Settings & Privacy', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 qf-sidebar flex-col shrink-0 min-h-screen justify-between select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-line">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-inner bg-brand-tint border border-[#D9DDFF] flex items-center justify-center text-brand group-hover:scale-105 transition-transform shadow-xs">
              <Zap className="w-5 h-5 fill-brand" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-ink">PIXELPATH</span>
                <span className="inline-flex h-[20px] items-center rounded-badge border border-[#D9DDFF] bg-brand-tint px-2 text-[10px] font-bold text-brand-ink font-mono">
                  STUDENT
                </span>
              </div>
              <p className="text-[11px] text-ink-3 font-medium tracking-tight">
                Gamified Mastery Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="p-2 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
          {navSections.map((sec) => (
            <div key={sec.group}>
              <div className="qf-nav-group uppercase">{sec.group}</div>
              <div className="space-y-0.5">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `qf-nav-item ${isActive ? 'is-active' : ''}`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-sm">{item.name}</span>

                    {item.badge && (
                      <span
                        className={`inline-flex h-[20px] items-center rounded-badge px-2 text-[10px] font-mono font-bold ${
                          item.badge === 'DAILY'
                            ? 'border border-[#FBDDA0] bg-streak-tint text-streak-ink'
                            : item.badge === 'LIVE'
                            ? 'border border-[#FFC9D3] bg-live-tint text-live-ink animate-pulse'
                            : 'border border-[#D9DDFF] bg-brand-tint text-brand-ink'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Portal Switch */}
      <div className="p-4 border-t border-line space-y-2.5">
        <div className="flex items-center justify-between p-2.5 rounded-inner bg-surface-2 border border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink truncate">{user.name}</p>
              <p className="text-[10px] text-ink-3 font-mono truncate">{user.collegeId}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 rounded-inner hover:bg-live-tint text-ink-3 hover:text-live-ink transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] px-1">
          <Link
            to="/faculty/login"
            className="text-ink-3 hover:text-brand flex items-center gap-1 font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Faculty Portal
          </Link>
          <span className="text-ink-3 font-mono text-[10px]">{user.batch || '2024-2028'}</span>
        </div>
      </div>
    </aside>
  );
};
