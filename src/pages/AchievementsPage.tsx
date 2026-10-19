import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Achievement } from '../types';
import {
  Flame,
  Brain,
  Terminal,
  HandHeart,
  TrendingUp,
  Trophy,
  Target,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  X
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { achievements } = useApp();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return Flame;
      case 'Brain':
        return Brain;
      case 'Terminal':
        return Terminal;
      case 'HandHeart':
        return HandHeart;
      case 'TrendingUp':
        return TrendingUp;
      case 'Trophy':
        return Trophy;
      case 'Target':
        return Target;
      case 'ShieldCheck':
        return ShieldCheck;
      default:
        return Zap;
    }
  };

  const getBadgeColors = (item: Achievement) => {
    if (!item.unlocked) {
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-400',
        glow: '',
      };
    }
    // Pink for streak, Blue for coding, Peach for participation, Lavender for mastery, Gold for rare
    if (item.id.includes('streak') || item.icon === 'Flame') {
      return {
        bg: 'bg-pink-100 border-pink-200 text-pink-600',
        glow: 'from-pink-100/50 to-transparent',
      };
    }
    if (item.id.includes('code') || item.icon === 'Terminal') {
      return {
        bg: 'bg-blue-100 border-blue-200 text-blue-600',
        glow: 'from-blue-100/50 to-transparent',
      };
    }
    if (item.id.includes('tutor') || item.icon === 'HandHeart') {
      return {
        bg: 'bg-orange-100 border-orange-200 text-orange-600',
        glow: 'from-orange-100/50 to-transparent',
      };
    }
    if (item.rarity === 'Legendary' || item.rarity === 'Rare') {
      return {
        bg: 'bg-amber-100 border-amber-300 text-amber-700',
        glow: 'from-amber-100/50 to-transparent',
      };
    }
    return {
      bg: 'bg-purple-100 border-purple-200 text-purple-600',
      glow: 'from-purple-100/50 to-transparent',
    };
  };

  const filtered = achievements.filter((a) => {
    if (categoryFilter === 'unlocked') return a.unlocked;
    if (categoryFilter === 'locked') return !a.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-quest-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              VERIFIED MILESTONES
            </span>
            <span className="text-xs text-quest-muted">Verifiable Learning Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-navy mt-1">Badges & Achievements</h1>
          <p className="text-xs text-quest-muted mt-0.5 font-medium">
            Permanent recognition for academic milestones, peer mentorship, and consistency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-quest-border text-right shadow-sm">
            <span className="text-[10px] uppercase font-bold text-quest-muted">Unlocked Badges</span>
            <p className="text-base font-black text-quest-navy font-mono tabular-nums">
              {unlockedCount} / {achievements.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-quest-border text-xs w-fit shadow-sm">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            categoryFilter === 'all'
              ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sm'
              : 'text-quest-muted hover:text-quest-navy'
          }`}
        >
          All Badges ({achievements.length})
        </button>
        <button
          onClick={() => setCategoryFilter('unlocked')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            categoryFilter === 'unlocked'
              ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sm'
              : 'text-quest-muted hover:text-quest-navy'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => setCategoryFilter('locked')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            categoryFilter === 'locked'
              ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sm'
              : 'text-quest-muted hover:text-quest-navy'
          }`}
        >
          Locked ({achievements.length - unlockedCount})
        </button>
      </div>

      {/* Achievement Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const Icon = getIcon(item.icon);
          const isUnlocked = item.unlocked;
          const badgeTheme = getBadgeColors(item);

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedAchievement(item)}
              className={`rounded-3xl p-6 border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-card hover:shadow-sunset ${
                isUnlocked
                  ? 'bg-white border-quest-border hover:border-pink-300'
                  : 'bg-white/70 border-slate-200 opacity-65 hover:opacity-90'
              }`}
            >
              {/* Subtle radial glow */}
              {isUnlocked && (
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${badgeTheme.glow} rounded-full blur-2xl pointer-events-none`} />
              )}

              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform shadow-sm ${badgeTheme.bg}`}
                  >
                    {isUnlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                      item.rarity === 'Legendary'
                        ? 'text-amber-800 border-amber-300 bg-amber-100'
                        : item.rarity === 'Epic'
                        ? 'text-purple-700 border-purple-200 bg-purple-100'
                        : item.rarity === 'Rare'
                        ? 'text-sky-700 border-sky-200 bg-sky-100'
                        : 'text-slate-600 border-slate-200 bg-slate-100'
                    }`}
                  >
                    {item.rarity}
                  </span>
                </div>

                <h3 className={`text-base font-bold ${isUnlocked ? 'text-quest-navy' : 'text-slate-500'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-quest-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Details */}
              <div className="mt-5 pt-3.5 border-t border-quest-border flex items-center justify-between text-xs">
                {isUnlocked ? (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Unlocked {item.unlockedDate}
                  </span>
                ) : (
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-[10px] text-quest-muted mb-1 font-mono">
                      <span>Progress</span>
                      <span>{item.progress} / {item.maxProgress}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                        style={{ width: `${(item.progress / item.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <span className="text-xs font-black text-amber-600 font-mono shrink-0">
                  +{item.xpBonus} XP
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-7 shadow-2xl z-10 space-y-5 text-center"
            >
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-5 right-5 text-quest-muted hover:text-quest-navy"
              >
                <X className="w-5 h-5" />
              </button>

              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border shadow-sm ${
                  getBadgeColors(selectedAchievement).bg
                }`}
              >
                {React.createElement(getIcon(selectedAchievement.icon), { className: 'w-10 h-10' })}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-quest-navy font-mono">
                  {selectedAchievement.rarity} Milestone
                </span>
                <h3 className="text-xl font-black text-quest-navy mt-2">{selectedAchievement.title}</h3>
                <p className="text-xs text-quest-muted mt-2 leading-relaxed">
                  {selectedAchievement.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-quest-border flex items-center justify-between text-xs">
                <span className="text-quest-muted">Mastery Bonus</span>
                <span className="font-mono font-black text-amber-600">+{selectedAchievement.xpBonus} XP</span>
              </div>

              {selectedAchievement.unlocked ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  ✓ Verified by MSOT Academic System on {selectedAchievement.unlockedDate}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-quest-muted text-xs">
                  🔒 Locked ({selectedAchievement.progress}/{selectedAchievement.maxProgress} completed)
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
