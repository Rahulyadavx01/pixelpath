import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  LayoutDashboard,
  HelpCircle,
  FileCode,
  Users2,
  AlertTriangle,
  GraduationCap,
  Megaphone,
  History,
  LogOut,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface FacultyNavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const facultyNavItems: FacultyNavItem[] = [
  { name: 'Console Overview', path: '/faculty', icon: LayoutDashboard },
  { name: 'Curriculum Manager', path: '/faculty/curriculum', icon: BookOpen, badge: 'CORE' },
  { name: 'Daily Quest Manager', path: '/faculty/daily-quest', icon: HelpCircle, badge: 'NEW' },
  { name: 'Daily Quiz Manager', path: '/faculty/quizzes', icon: ShieldCheck },
  { name: 'Coding Problems', path: '/faculty/problems', icon: FileCode },
  { name: 'Team Battles', path: '/faculty/battles', icon: Users2 },
  { name: 'Students & Roster', path: '/faculty/students', icon: GraduationCap },
  { name: 'Integrity Flags', path: '/faculty/integrity', icon: AlertTriangle, badge: 'ALERT' },
  { name: 'Announcements', path: '/faculty/announcements', icon: Megaphone },
  { name: 'Audit Log', path: '/faculty/audit', icon: History },
];

export const FacultySidebar: React.FC = () => {
  const { user, signOutUser } = useApp();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/faculty/login');
  };

  return (
    <aside className="hidden lg:flex w-64 glass-regular border-r border-white/80 flex-col shrink-0 min-h-screen justify-between select-none shadow-glassRegular z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-white/60">
          <Link to="/faculty" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-sky p-0.5 shadow-glowSky group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-quest-skyDark" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-quest-textPrimary">PIXELPATH</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold bg-sky-100 text-quest-skyDark border border-sky-200 font-mono">
                  FACULTY
                </span>
              </div>
              <p className="text-[11px] text-quest-textSecondary font-medium tracking-tight">
                Academic Operations Console
              </p>
            </div>
          </Link>
        </div>

        {/* Faculty Active Badge */}
        <div className="px-4 py-3 border-b border-white/60 bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-quest-sky/20 border border-quest-sky/30 flex items-center justify-center font-bold text-xs text-quest-skyDark">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-quest-textPrimary truncate">{user.name}</p>
              <p className="text-[10px] text-quest-textSecondary font-mono truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto">
          <span className="px-3 text-[10px] font-bold text-quest-textSecondary uppercase tracking-wider font-mono block mb-1">
            MANAGEMENT SUITE
          </span>
          {facultyNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/faculty'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-quest-sky text-white shadow-glassSubtle font-bold'
                    : 'text-quest-textPrimary hover:bg-white/80 hover:text-quest-skyDark'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    item.badge === 'ALERT'
                      ? 'bg-rose-100 text-rose-600 border border-rose-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/60 space-y-2">
        <a
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-quest-textSecondary hover:text-quest-textPrimary hover:bg-white/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            View Student Portal
          </span>
          <span className="text-[10px] font-mono text-slate-400">Exit</span>
        </a>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Faculty Portal
        </button>
      </div>
    </aside>
  );
};
