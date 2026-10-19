import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  Database,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  portalMode?: 'student' | 'faculty';
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch, portalMode = 'student' }) => {
  const {
    user,
    soundEnabled,
    setSoundEnabled,
    setIsAuthModalOpen,
    isSupabaseActive,
    signOutUser
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    if (portalMode === 'faculty') {
      navigate('/faculty/login');
    } else {
      navigate('/login');
    }
  };

  const notifications = [
    { id: 1, title: 'Daily Quest Ready', desc: 'Today\'s problem-solving quest is live! (+50 XP)', time: '15m ago', unread: true },
    { id: 2, title: 'Team Battle Active', desc: 'Squad Phoenix opened submissions in Coding Arena', time: '1h ago', unread: true },
    { id: 3, title: 'Solution Verified', desc: 'Alex, your C++17 solution passed all hidden suites (+40 XP)', time: '3h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-line px-4 lg:px-8 flex items-center justify-between transition-all select-none">
      {/* Left: Quick Command Palette Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-inner bg-surface-2 hover:bg-surface border border-line hover:border-brand text-ink-3 hover:text-ink transition-all text-xs group shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-brand group-hover:scale-110 transition-transform" />
            <span className="font-medium text-ink-3 group-hover:text-ink">
              {portalMode === 'faculty' ? 'Search student roster, quests, quizzes...' : 'Quick jump or search quests...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-surface border border-line px-2 py-0.5 rounded-md text-ink-3 font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: HUD Control Center */}
      <div className="flex items-center gap-2 sm:gap-3">
        {portalMode === 'student' ? (
          <>
            {/* Streak Pill */}
            <Link
              to="/dashboard"
              className="inline-flex h-[28px] items-center gap-1.5 rounded-badge border border-[#FBDDA0] bg-streak-tint px-2.5 text-badge text-streak-ink font-semibold transition-all shadow-xs"
              title="Consecutive Day Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-streak text-streak" />
              <span className="tabular-nums">{user.streakDays}d Streak</span>
            </Link>

            {/* Level Reactor Pill */}
            <div className="hidden sm:inline-flex h-[28px] items-center gap-1.5 rounded-badge border border-[#D9DDFF] bg-brand-tint px-2.5 text-badge text-brand-ink font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>LVL {user.level}</span>
            </div>

            {/* XP Balance Widget */}
            <div className="inline-flex h-[28px] items-center gap-1.5 rounded-badge border border-[#FBDDA0] bg-streak-tint px-2.5 text-badge text-streak-ink font-bold tabular-nums shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-streak text-streak" />
              <span>
                {user.xp.toLocaleString()} <span className="text-[10px] font-bold text-streak-ink">XP</span>
              </span>
            </div>
          </>
        ) : (
          /* Faculty Status Pill */
          <div className="inline-flex h-[28px] items-center gap-1.5 rounded-badge border border-[#D9DDFF] bg-brand-tint px-2.5 text-badge text-brand-ink font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>FACULTY MODE</span>
          </div>
        )}

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-inner bg-surface-2 hover:bg-surface border border-line text-ink-3 hover:text-ink transition-colors shadow-xs"
          title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-brand" /> : <VolumeX className="w-4 h-4 text-ink-3" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-inner bg-surface-2 hover:bg-surface border border-line text-ink-3 hover:text-ink relative transition-colors shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live-ink ring-2 ring-surface" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-card bg-surface border border-line shadow-lift p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
                <span className="text-xs font-extrabold text-ink uppercase tracking-wider font-mono">
                  Notifications
                </span>
                <span className="text-[10px] text-brand font-bold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-inner text-left border transition-all ${
                      n.unread ? 'bg-brand-tint border-[#D9DDFF]' : 'bg-surface-2 border-line'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">{n.title}</span>
                      <span className="text-[10px] text-ink-3">{n.time}</span>
                    </div>
                    <p className="text-xs text-ink-2 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Quick Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-surface-2 hover:bg-surface border border-line transition-all shadow-xs group"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-brand/40 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-win ring-1 ring-surface" />
            </div>
            <span className="hidden sm:inline text-xs font-bold text-ink max-w-[90px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-transform" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-card bg-surface border border-line shadow-lift p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-line mb-1">
                <p className="text-xs font-extrabold text-ink truncate">{user.name}</p>
                <p className="text-[10px] text-ink-3 font-mono">{user.collegeId || user.email}</p>
                {portalMode === 'student' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-streak-ink font-bold">
                    <Sparkles className="w-3 h-3 text-streak" />
                    <span>Gold League • Rank #{user.classRank}</span>
                  </div>
                )}
              </div>

              {portalMode === 'student' ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-inner text-xs font-medium text-ink hover:bg-surface-2 transition-colors"
                  >
                    <span>Student Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-inner text-xs font-medium text-ink hover:bg-surface-2 transition-colors"
                  >
                    <span>Settings & Preferences</span>
                  </Link>
                  <Link
                    to="/faculty/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-inner text-xs font-bold text-brand hover:bg-brand-tint transition-colors"
                  >
                    <span>Faculty Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/faculty"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-inner text-xs font-medium text-ink hover:bg-surface-2 transition-colors"
                  >
                    <span>Console Overview</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-inner text-xs font-bold text-brand hover:bg-brand-tint transition-colors"
                  >
                    <span>Student Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </>
              )}

              <div className="pt-2 mt-2 border-t border-line space-y-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-inner text-xs font-semibold text-live-ink hover:bg-live-tint transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
