import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { classLeaderboard, leagueCohort } from '../mock/data';
import { LeaderboardStudent } from '../types';
import {
  Trophy,
  Flame,
  Search,
  Heart,
  TrendingUp,
  Sparkles,
  EyeOff,
  Settings,
  Clock
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user, roster, leaderboardPeriods } = useApp();
  const [activeTab, setActiveTab] = useState<'class' | 'league' | 'campus'>('class');
  const [searchFilter, setSearchFilter] = useState('');

  // Choose data based on active tab
  const baseList: LeaderboardStudent[] = useMemo(() => {
    return activeTab === 'league' ? leagueCohort : classLeaderboard;
  }, [activeTab]);

  // Substitute current user data in real-time, filter opted-out peers, and sort dynamically
  const currentList = useMemo(() => {
    const listCopy = baseList
      .filter((st) => {
        // Current user is always kept in their own view
        if (st.isCurrentUser || st.id === user.id) return true;
        // Check if student has opted out via campus roster
        const rosterEntry = roster.find((r) => r.studentId === st.id || r.fullName === st.name);
        if (rosterEntry?.leaderboardOptOut) return false;
        return true;
      })
      .map((st) => {
        if (st.isCurrentUser || st.id === user.id) {
          return {
            ...st,
            name: user.name,
            avatar: user.avatar,
            xp: user.xp,
            streak: user.streakDays,
            isCurrentUser: true,
          };
        }
        return st;
      });

    // Re-sort descending by XP
    listCopy.sort((a, b) => b.xp - a.xp);

    // Re-assign ranks 1..N
    return listCopy.map((s, idx) => ({
      ...s,
      rank: idx + 1,
    }));
  }, [baseList, user.id, user.name, user.avatar, user.xp, user.streakDays, roster]);

  const filtered = currentList.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const currentUserEntry = currentList.find((s) => s.isCurrentUser);
  const currentRank = currentUserEntry?.rank || 7;

  // Find previous rank student to show XP gap
  const previousStudent = currentList.find((s) => s.rank === currentRank - 1);
  const xpDifference = previousStudent ? previousStudent.xp - user.xp : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-sky-800 border border-cyan-500/30 font-mono">
              COLLABORATIVE RANKINGS
            </span>
            <span className="text-xs text-quest-textSecondary font-mono">Weekly Cycle Resets Sunday 23:59:59 UTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-textPrimary mt-1">Inclusive Leaderboards</h1>
          <p className="text-xs text-quest-textSecondary mt-0.5 font-medium">
            Recognizing improvement, daily habits, and peer tutoring. Never linked to official examination grades.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-subtle border border-white/80 text-xs text-quest-textPrimary font-bold shadow-sm font-mono">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Active Division: {user.league} League</span>
        </div>
      </div>

      {/* Persistent User Position Hero Banner (Liquid Glass) */}
      <div className="rounded-3xl glass-prominent border border-cyan-500/30 p-6 shadow-glassRegular flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full bg-[#12243B] rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-slate-300 uppercase font-mono">RANK</span>
              <span className="text-2xl font-black text-white tabular-nums font-mono">#{currentRank}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-quest-textPrimary">You&rsquo;re #{currentRank} in Cohort</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 font-mono">
                Active Weekly Yield
              </span>
            </div>
            <p className="text-xs text-quest-textSecondary mt-1 font-medium leading-relaxed">
              {previousStudent
                ? `Only ${Math.max(1, xpDifference)} XP to overtake #${previousStudent.rank} ${previousStudent.name} — achievable via one quiz or code challenge!`
                : 'You are currently leading the cohort! Keep up the daily momentum.'}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="text-sm font-mono font-black text-amber-800 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 shadow-sm tabular-nums">
            {user.xp.toLocaleString()} XP Total
          </span>
        </div>
      </div>

      {/* Privacy Opt-Out Notice */}
      {user.leaderboardOptOut && (
        <div className="rounded-2xl glass-regular border border-amber-300/80 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Private Mode Active:</strong> You have opted out of public leaderboards. Your personal standing (#{currentRank}) is visible only to you. Other students cannot see your name or rank.
            </span>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 font-bold hover:bg-amber-100 transition-colors shrink-0 font-mono text-[11px]"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* Growth-First Charter Banner */}
      <div className="rounded-2xl glass-subtle border border-pink-500/30 p-4 flex items-center justify-between text-xs text-quest-textSecondary">
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-pink-500 shrink-0" />
          <span>
            <strong className="text-quest-textPrimary font-bold">Growth-First Competition:</strong> Every student who improves their weekly consistency earns comeback multiplier points. Zero negative XP penalties for absence.
          </span>
        </div>
      </div>

      {/* Leaderboard Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 glass-subtle p-1.5 rounded-2xl border border-white/80 text-xs shadow-sm">
          {(
            [
              { id: 'class', label: 'My Class (CS204)' },
              { id: 'league', label: 'Gold Division' },
              { id: 'campus', label: 'Campus Overall' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-quest-textSecondary hover:text-quest-textPrimary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-quest-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search classmate..."
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-subtle border border-white/80 text-xs text-quest-textPrimary placeholder:text-quest-textMuted focus:outline-none focus:border-quest-sky shadow-sm"
          />
        </div>
      </div>

      {/* Leaderboard Ranking Table */}
      <div className="rounded-3xl glass-regular border border-white/80 shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-3.5 glass-subtle border-b border-white/60 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-quest-textMuted font-mono">
          <div className="col-span-2 sm:col-span-1">Rank</div>
          <div className="col-span-6 sm:col-span-6">Student</div>
          <div className="hidden sm:block sm:col-span-2 text-center">Velocity</div>
          <div className="col-span-4 sm:col-span-3 text-right">Verified XP</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/60">
          {filtered.map((st) => {
            const isUser = st.isCurrentUser;

            return (
              <div
                key={st.id}
                className={`px-6 py-4 grid grid-cols-12 items-center transition-colors ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border-l-4 border-l-quest-sky text-quest-textPrimary font-bold'
                    : 'hover:bg-white/40 text-quest-textPrimary'
                }`}
              >
                {/* Rank number & medal */}
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 font-black text-sm">
                  {st.rank === 1 ? (
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30 flex items-center justify-center text-xs font-black shadow-sm font-mono">
                      1
                    </span>
                  ) : st.rank === 2 ? (
                    <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-sky-800 border border-cyan-500/30 flex items-center justify-center text-xs font-black shadow-sm font-mono">
                      2
                    </span>
                  ) : st.rank === 3 ? (
                    <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-800 border border-purple-500/30 flex items-center justify-center text-xs font-black shadow-sm font-mono">
                      3
                    </span>
                  ) : (
                    <span className="font-mono text-quest-textSecondary font-bold text-xs pl-2">#{st.rank}</span>
                  )}
                </div>

                {/* Student Info */}
                <div className="col-span-6 sm:col-span-6 flex items-center gap-3">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-9 h-9 rounded-full object-cover border border-white shrink-0 shadow-xs"
                  />
                  <div className="truncate">
                    <p className={`text-xs truncate ${isUser ? 'font-black text-quest-textPrimary' : 'font-semibold text-quest-textPrimary'}`}>
                      {st.name} {isUser && '(You)'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-quest-textSecondary">
                      <span className="font-mono">{st.league} League</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {st.streak}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Velocity / Promotion zone */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-center text-xs font-mono font-bold">
                  {st.rank <= 5 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 text-[10px] font-bold">
                      Promotion Zone ↑
                    </span>
                  ) : (
                    <span className="text-quest-textSecondary text-[10px] font-medium">Maintenance Zone</span>
                  )}
                </div>

                {/* Verified XP */}
                <div className="col-span-4 sm:col-span-3 text-right">
                  <span className="font-mono font-black text-xs sm:text-sm text-quest-textPrimary">
                    {st.xp.toLocaleString()}{' '}
                    <span className="text-[10px] text-amber-600 font-bold">XP</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
