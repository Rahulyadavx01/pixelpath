import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Sparkles, Flame, History, ArrowRight } from 'lucide-react';

export const XPCard: React.FC = () => {
  const { user, xpTransactions } = useApp();

  const percentage = Math.min(
    100,
    Math.round(((user.totalXpNeededForLevel - user.xpToNextLevel) / user.totalXpNeededForLevel) * 100)
  );

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const todayXp = xpTransactions
    .filter((tx) => {
      if (tx.userId !== user.id || tx.isVoided) return false;
      const txDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(tx.createdAt));
      return txDateStr === todayStr;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <section className="relative overflow-hidden rounded-[20px] bg-hero bg-hero-card p-6 sm:p-8 text-white shadow-lift transition-all duration-300">
      {/* Badges / Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Badge */}
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-badge border border-white/15 bg-white/10 px-2.5 text-badge text-[#E6EAFF]">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span>Level {user.level}</span>
          </span>

          {/* Streak Badge */}
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-badge border border-white/15 bg-white/10 px-2.5 text-badge text-amber-300">
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{user.streakDays}-day streak</span>
          </span>

          {/* Semester Rank Badge */}
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-badge border border-white/15 bg-white/10 px-2.5 text-badge text-[#E6EAFF]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Top 15% this semester</span>
          </span>

          {/* Today XP Badge */}
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-badge border border-white/15 bg-white/10 px-2.5 text-badge text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span>+{todayXp} XP today</span>
          </span>
        </div>

        {/* XP Ledger Link */}
        <Link
          to="/xp-history"
          className="inline-flex h-[26px] items-center gap-1.5 rounded-badge border border-white/15 bg-white/10 px-2.5 text-badge text-[#E6EAFF] hover:bg-white/20 transition-colors"
        >
          <History className="w-3 h-3" />
          <span>XP Ledger</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Large XP Display */}
      <p className="mt-4 text-stat-xl tabular-nums">
        {user.xp.toLocaleString()} <span className="text-2xl font-bold text-orange-300">XP</span>
      </p>

      {/* Level Progress */}
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-label text-hero-ink2">
          <span>Level {user.level + 1} progress</span>
          <span>
            {user.xp.toLocaleString()} / {user.totalXpNeededForLevel.toLocaleString()} XP ({percentage}%)
          </span>
        </div>

        {/* Glowing XP Progress Bar */}
        <div className="h-3.5 overflow-hidden rounded-full bg-white/10 relative">
          <motion.div
            className="h-full rounded-full bg-xp-bar shadow-xp"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-hero-ink2 mt-2 font-mono">
          <span>Base: Level {user.level}</span>
          <span>{user.xpToNextLevel.toLocaleString()} XP to next level</span>
        </div>
      </div>
    </section>
  );
};
