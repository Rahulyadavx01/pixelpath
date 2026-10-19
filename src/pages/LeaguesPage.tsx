import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { leagueCohort } from '../mock/data';
import {
  Shield,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

/**
 * Calculates remaining time until next Sunday 23:59:59 UTC
 */
function getTimeUntilSundayReset(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const nowUtc = now.getTime();

  // Find next Sunday 23:59:59 UTC
  const target = new Date(now);
  const dayOfWeek = target.getUTCDay(); // 0 is Sunday
  const daysUntilSunday = (7 - dayOfWeek) % 7;

  target.setUTCDate(target.getUTCDate() + daysUntilSunday);
  target.setUTCHours(23, 59, 59, 999);

  // If already past today's Sunday reset, push to next week
  if (target.getTime() <= nowUtc) {
    target.setUTCDate(target.getUTCDate() + 7);
  }

  const diffMs = Math.max(0, target.getTime() - nowUtc);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${days}d ${hours}h ${minutes}m`;

  return { days, hours, minutes, seconds, formatted };
}

export const LeaguesPage: React.FC = () => {
  const { user } = useApp();
  const [countdown, setCountdown] = useState(getTimeUntilSundayReset());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilSundayReset());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tiers = [
    { name: 'Bronze', text: 'text-amber-700', icon: '🥉' },
    { name: 'Silver', text: 'text-slate-600', icon: '🥈' },
    { name: 'Gold', text: 'text-amber-600', active: true, icon: '🥇' },
    { name: 'Platinum', text: 'text-sky-600', icon: '💠' },
    { name: 'Diamond', text: 'text-purple-600', icon: '💎' },
    { name: 'Master', text: 'text-rose-600', icon: '👑' },
  ];

  // Dynamically inject the authenticated user's real live XP and re-sort cohort
  const dynamicCohort = useMemo(() => {
    const cohortCopy = leagueCohort.map((student) => {
      if (student.isCurrentUser || student.id === user.id) {
        return {
          ...student,
          name: user.name,
          avatar: user.avatar,
          xp: user.xp,
          streak: user.streakDays,
          isCurrentUser: true,
        };
      }
      return student;
    });

    // If user is not yet in cohort, replace or append
    const hasUser = cohortCopy.some((s) => s.isCurrentUser);
    if (!hasUser) {
      cohortCopy.push({
        id: user.id,
        name: user.name,
        rank: 0,
        xp: user.xp,
        change: 'New',
        changeType: 'same',
        league: user.league,
        streak: user.streakDays,
        avatar: user.avatar,
        isCurrentUser: true,
      });
    }

    // Sort descending by XP
    cohortCopy.sort((a, b) => b.xp - a.xp);

    // Re-assign ranks 1..N
    return cohortCopy.map((s, idx) => ({
      ...s,
      rank: idx + 1,
    }));
  }, [user.id, user.name, user.avatar, user.xp, user.streakDays, user.league]);

  // Current user rank & zone status
  const currentUserIndex = dynamicCohort.findIndex((s) => s.isCurrentUser);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : 7;
  const userZone =
    currentUserRank <= 5 ? 'promotion' : currentUserRank <= 15 ? 'safe' : 'relegation';

  // Difference to next promotion or cushion
  const rank5Student = dynamicCohort[4];
  const rank6Student = dynamicCohort[5];
  const rank15Student = dynamicCohort[14];

  let zoneHeadline = '';
  let zoneSubline = '';

  if (userZone === 'promotion') {
    zoneHeadline = `Promotion Zone (Rank #${currentUserRank})`;
    const cushion = rank6Student ? user.xp - rank6Student.xp : 0;
    zoneSubline = `You are in the top 5! You lead #6 by ${Math.max(0, cushion)} XP. Keep pace until Sunday to ascend to Platinum.`;
  } else if (userZone === 'safe') {
    zoneHeadline = `Safe Zone (Rank #${currentUserRank})`;
    const gapToPromo = rank5Student ? Math.max(0, rank5Student.xp - user.xp + 1) : 50;
    zoneSubline = `You are ${gapToPromo} XP away from #${5} ${rank5Student ? rank5Student.name : ''} to enter the Promotion Zone!`;
  } else {
    zoneHeadline = `Comeback Zone (Rank #${currentUserRank})`;
    const gapToSafe = rank15Student ? Math.max(0, rank15Student.xp - user.xp + 1) : 40;
    zoneSubline = `You are at risk of relegation. Earn ${gapToSafe} XP to enter the Safe Zone before Sunday midnight.`;
  }

  // 20 students split dynamically into zones
  const promotionZone = dynamicCohort.slice(0, 5); // 1-5
  const safeZone = dynamicCohort.slice(5, 15); // 6-15
  const relegationZone = dynamicCohort.slice(15, 20); // 16-20

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-quest-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono">
              WEEKLY DIVISION
            </span>
            <span className="text-xs text-quest-muted">Cohort 4B • 20 Active Students</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-navy mt-1">Weekly Leagues</h1>
          <p className="text-xs text-quest-muted mt-0.5 font-medium">
            Climb tiers through weekly study velocity. Top 5 advance to Platinum every Sunday at 23:59:59 UTC.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-quest-border text-xs text-quest-navy font-mono font-bold shadow-sm">
          <Clock className="w-4 h-4 text-sky-500 animate-pulse" />
          <span className="tabular-nums">Weekly Reset: {countdown.formatted} ({countdown.seconds}s)</span>
        </div>
      </div>

      {/* League Tier Visual Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              t.active
                ? 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-card scale-105'
                : 'bg-white border-quest-border opacity-70 hover:opacity-100 shadow-sm'
            }`}
          >
            <span className="text-2xl block mb-1">{t.icon}</span>
            <span className={`text-xs font-black uppercase tracking-wider ${t.text}`}>
              {t.name}
            </span>
            {t.active && (
              <span className="mt-1 block text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                CURRENT TIER
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Your Rank Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-50 via-purple-50/70 to-blue-50 border border-purple-200/60 p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-sky-400 p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-quest-muted uppercase">RANK</span>
              <span className="text-2xl font-black text-quest-navy tabular-nums">#{currentUserRank}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-quest-navy">{zoneHeadline}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                userZone === 'promotion'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : userZone === 'safe'
                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                {userZone === 'promotion' ? 'Ascending to Platinum' : userZone === 'safe' ? 'Retaining Gold Tier' : 'Relegation Danger'}
              </span>
            </div>
            <p className="text-xs text-quest-muted mt-1 leading-relaxed">
              {zoneSubline}
            </p>
          </div>
        </div>

        <div className="relative z-10 text-right hidden sm:block">
          <span className="text-[10px] uppercase font-bold text-quest-muted">Your Current Yield</span>
          <p className="text-base font-black text-quest-navy font-mono tabular-nums">{user.xp.toLocaleString()} XP</p>
        </div>
      </div>

      {/* Three Zone Breakdown */}
      <div className="space-y-6">
        {/* 1. Promotion Zone (Top 5) */}
        <div className="rounded-3xl bg-white border border-emerald-200 overflow-hidden shadow-card">
          <div className="px-6 py-3.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider">
                Promotion Zone (TOP 5) → Ascends to Platinum
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 font-mono">Top 25%</span>
          </div>

          <div className="divide-y divide-quest-border">
            {promotionZone.map((s) => {
              const isUser = s.isCurrentUser;
              return (
                <div
                  key={s.id}
                  className={`px-6 py-3.5 flex items-center justify-between text-xs transition-colors ${
                    isUser ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 font-black text-emerald-600 font-mono tabular-nums">#{s.rank}</span>
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-quest-navy">{s.name}</p>
                        {isUser && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-quest-muted font-medium">🔥 {s.streak} day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{s.change}</span>
                    <span className="font-black text-quest-navy font-mono tabular-nums">{s.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Safe Zone (6-15) */}
        <div className="rounded-3xl bg-white border border-quest-border overflow-hidden shadow-card">
          <div className="px-6 py-3.5 bg-slate-50/80 border-b border-quest-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-quest-navy">
              <Shield className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-black uppercase tracking-wider">
                Safe Zone (6–15) → Remains in Gold Tier
              </span>
            </div>
            <span className="text-[11px] font-bold text-quest-muted font-mono">10 Students</span>
          </div>

          <div className="divide-y divide-quest-border">
            {safeZone.map((s) => {
              const isUser = s.isCurrentUser;
              return (
                <div
                  key={s.id}
                  className={`px-6 py-3.5 flex items-center justify-between text-xs transition-colors ${
                    isUser
                      ? 'bg-purple-50/70 border-l-4 border-l-purple-400 text-quest-navy'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-6 font-black font-mono tabular-nums ${isUser ? 'text-purple-700' : 'text-quest-muted'}`}>
                      #{s.rank}
                    </span>
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-bold ${isUser ? 'text-purple-800' : 'text-quest-navy'}`}>
                          {s.name}
                        </p>
                        {isUser && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-sm font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-quest-muted font-medium">🔥 {s.streak} day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-quest-muted text-[11px]">{s.change}</span>
                    <span className="font-black text-quest-navy font-mono tabular-nums">{s.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Relegation Zone (16-20) */}
        <div className="rounded-3xl bg-white border border-amber-200 overflow-hidden shadow-card">
          <div className="px-6 py-3.5 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black uppercase tracking-wider">
                Comeback Zone (16–20) → At Risk of Silver Tier
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-mono font-bold">5 Students</span>
          </div>

          <div className="divide-y divide-quest-border">
            {relegationZone.map((s) => {
              const isUser = s.isCurrentUser;
              return (
                <div
                  key={s.id}
                  className={`px-6 py-3.5 flex items-center justify-between text-xs transition-colors ${
                    isUser ? 'bg-amber-100/60 font-semibold' : 'hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 font-black text-amber-600 font-mono tabular-nums">#{s.rank}</span>
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover opacity-75" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-quest-navy">{s.name}</p>
                        {isUser && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-quest-muted font-medium">🔥 {s.streak} day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-amber-700 text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{s.change}</span>
                    <span className="font-mono text-quest-navy font-bold tabular-nums">{s.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
