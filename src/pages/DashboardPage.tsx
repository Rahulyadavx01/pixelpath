import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { XPCard } from '../components/gamification/XPCard';
import { StreakCard } from '../components/gamification/StreakCard';
import { AntiGamingCard } from '../components/gamification/AntiGamingCard';
import {
  Flame,
  Zap,
  BookOpen,
  Code2,
  Trophy,
  Shield,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bell,
  Clock,
  Play,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, announcements, markAnnouncementAsRead, battles, dailyQuests, dailyQuestAttempts, codingProblemsList } = useApp();

  const unreadAnnouncements = announcements.filter((a) => !a.isRead);
  const liveBattle = battles.find((b) => b.status === 'live') || battles[0];
  const spotlightProblem = codingProblemsList[0];

  // Daily Quest real status
  const userBatch = user.batch || '2024-2028';
  const todayQuest = dailyQuests.find(
    (q) => (q.status === 'live' || q.status === 'closed') && q.targetBatches.includes(userBatch)
  );
  const todayAttempt = todayQuest
    ? dailyQuestAttempts.find((a) => a.questId === todayQuest.id && a.userId === user.id)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Announcements Banner if unread exist */}
      {unreadAnnouncements.length > 0 && (
        <div className="p-4 rounded-card border border-amber-300 bg-surface shadow-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-inner bg-streak-tint flex items-center justify-center text-streak-ink shrink-0 border border-[#FBDDA0]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-[22px] items-center rounded-badge border border-[#FBDDA0] bg-streak-tint px-2 text-[10px] font-extrabold uppercase font-mono text-streak-ink">
                  FACULTY ANNOUNCEMENT
                </span>
                <span className="text-sm font-bold text-ink">{unreadAnnouncements[0].title}</span>
              </div>
              <p className="text-label text-ink-2 mt-0.5 line-clamp-1">{unreadAnnouncements[0].content}</p>
            </div>
          </div>
          <button
            onClick={() => markAnnouncementAsRead(unreadAnnouncements[0].id)}
            className="qf-btn qf-btn--secondary !h-9 !px-3 !text-xs shrink-0"
          >
            Mark Read
          </button>
        </div>
      )}

      {/* Hero Cluster: Personalized Greeting & Signature XP Card */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-h1 text-ink tracking-tight">
              Good morning, {user.name.split(' ')[0]} ☀️
            </h1>
            <p className="text-sub mt-1">
              Every small step takes you closer to your next level.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex h-[26px] items-center rounded-badge border border-[#D9DDFF] bg-brand-tint px-2.5 text-badge text-brand-ink font-semibold">
              Cohort: {userBatch} • Rank #{user.classRank}
            </span>
          </div>
        </div>

        <XPCard />
      </div>

      {/* Daily Quest Shortcut Card (Shows real live status & links to /daily-quest) */}
      {todayQuest && (
        <div className="rounded-card border border-line bg-surface p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="grid h-12 w-12 place-items-center rounded-inner bg-streak-tint text-streak shrink-0 border border-[#FBDDA0]">
              <Compass className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex h-[22px] items-center rounded-badge border border-line bg-surface-2 px-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">
                  DAILY QUEST
                </span>
                <span className="inline-flex h-[22px] items-center rounded-badge border border-[#FBDDA0] bg-streak-tint px-2 text-badge text-streak-ink font-semibold">
                  +{todayQuest.xpReward} XP
                </span>
                {todayAttempt ? (
                  <span
                    className={`inline-flex h-[22px] items-center gap-1 rounded-badge px-2 text-badge font-semibold ${
                      todayAttempt.isCorrect
                        ? 'border border-[#BDEBD7] bg-win-tint text-win-ink'
                        : 'border border-[#FBDDA0] bg-streak-tint text-streak-ink'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {todayAttempt.isCorrect ? 'Solved' : 'Attempted'}
                  </span>
                ) : (
                  <span className="inline-flex h-[22px] items-center rounded-badge border border-[#D9DDFF] bg-brand-tint px-2 text-badge text-brand-ink">
                    Not started
                  </span>
                )}
              </div>
              <h3 className="text-title text-ink truncate">{todayQuest.title}</h3>
              <p className="text-label text-ink-2 truncate">{todayQuest.topicTag} • {todayQuest.difficulty}</p>
            </div>
          </div>

          <Link
            to="/daily-quest"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cta px-5 text-[15px] font-bold text-white shadow-cta transition hover:-translate-y-px hover:shadow-cta-hover active:translate-y-0 active:bg-brand-press focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30 shrink-0"
          >
            <span>{todayAttempt ? 'Review Daily Quest' : 'Launch Daily Quest'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Row of 4 Distinct Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total XP */}
        <div className="rounded-card border border-line bg-surface p-6 shadow-card hover:border-brand/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label text-ink-3">Total XP</span>
            <span className="grid h-10 w-10 place-items-center rounded-inner bg-brand-tint text-brand">
              <Zap className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-stat tabular-nums text-ink">{user.xp.toLocaleString()}</p>
          <p className="text-label text-win-ink mt-1 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Top 15% this semester
          </p>
        </div>

        {/* Card 2: Streak Days */}
        <div className="rounded-card border border-line bg-surface p-6 shadow-card hover:border-streak/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label text-ink-3">Streak Days</span>
            <span className="grid h-10 w-10 place-items-center rounded-inner bg-streak-tint text-streak">
              <Flame className="w-5 h-5 fill-streak" />
            </span>
          </div>
          <p className="mt-3 text-stat tabular-nums text-ink">{user.streakDays}</p>
          <p className="text-label text-streak-ink mt-1 font-medium">
            {user.streakFreezeCount} Freezes Remaining
          </p>
        </div>

        {/* Card 3: League Tier */}
        <div className="rounded-card border border-line bg-surface p-6 shadow-card hover:border-brand/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label text-ink-3">League Tier</span>
            <span className="grid h-10 w-10 place-items-center rounded-inner bg-brand-tint text-brand">
              <Trophy className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-stat text-ink">{user.league}</p>
          <p className="text-label text-brand-ink mt-1 font-medium">
            Top 5 promote Sunday
          </p>
        </div>

        {/* Card 4: Code Problems Solved */}
        <div className="rounded-card border border-line bg-surface p-6 shadow-card hover:border-brand/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label text-ink-3">Solved in Arena</span>
            <span className="grid h-10 w-10 place-items-center rounded-inner bg-brand-tint text-brand">
              <Code2 className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-stat tabular-nums text-ink">{user.codingProblemsSolved}</p>
          <p className="text-label text-brand-ink mt-1 font-medium">
            C++17 Sandboxed Solutions
          </p>
        </div>
      </div>

      {/* Streak Details Component */}
      <StreakCard />

      {/* Two Column Feature Row: Code Arena Spotlight & Live Team Battle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Arena Challenge Spotlight */}
        <div className="rounded-card border border-line bg-surface p-6 sm:p-7 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-[22px] items-center rounded-badge border border-[#D9DDFF] bg-brand-tint px-2.5 text-badge text-brand-ink font-semibold">
                  CODE ARENA SPOTLIGHT
                </span>
                <span className="text-xs font-mono text-win-ink font-bold">
                  +{spotlightProblem?.xpReward || 50} XP
                </span>
              </div>
              <span className="text-badge font-mono font-bold text-ink-3">
                {spotlightProblem?.difficulty}
              </span>
            </div>

            <h3 className="text-title text-ink tracking-tight mb-2">
              {spotlightProblem?.title}
            </h3>

            <p className="text-label text-ink-2 line-clamp-3 leading-relaxed">
              {spotlightProblem?.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <span className="text-label text-ink-3">
              Languages: C++17, Python, JS, Java
            </span>
            <Link
              to="/coding"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-inner bg-brand text-white px-4 text-xs font-bold shadow-xs hover:bg-brand-hover transition-colors"
            >
              <span>Solve in C++</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Live Team Battle Spotlight */}
        <div className="rounded-card border border-line bg-surface p-6 sm:p-7 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-[22px] items-center rounded-badge border border-[#FFC9D3] bg-live-tint px-2.5 text-badge text-live-ink font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-live-ink animate-ping mr-1" />
                  LIVE TEAM BATTLE
                </span>
                <span className="text-xs font-mono text-streak-ink font-bold">
                  {liveBattle?.xpPool} XP Pool
                </span>
              </div>
              <span className="text-badge text-ink-3">
                Team Size: {liveBattle?.maxTeamSize} Members
              </span>
            </div>

            <h3 className="text-title text-ink tracking-tight mb-2">
              {liveBattle?.title}
            </h3>

            <p className="text-label text-ink-2 line-clamp-2 leading-relaxed">
              {liveBattle?.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <span className="text-label text-ink-3">
              {liveBattle?.teams?.length || 2} Squads Active
            </span>
            <Link
              to="/battles"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-inner bg-surface-2 text-ink border border-line px-4 text-xs font-bold hover:bg-surface transition-colors"
            >
              <span>Enter Arena</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Anti-Gaming Verification Banner */}
      <AntiGamingCard />
    </div>
  );
};
