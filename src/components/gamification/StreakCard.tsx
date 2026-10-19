import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Snowflake, Check, ShieldCheck } from 'lucide-react';

export const StreakCard: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-inner bg-streak-tint text-streak shrink-0 border border-[#FBDDA0] group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 fill-streak text-streak" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-stat tabular-nums text-ink">
                  {user.streakDays}
                </span>
                <span className="text-badge uppercase text-streak-ink tracking-wider font-mono font-bold">
                  DAY STREAK
                </span>
              </div>
              <p className="text-label text-ink-3">Daily learning habit active 🔥</p>
            </div>
          </div>

          {/* Freeze Shield Pill */}
          <div
            className="inline-flex h-[28px] items-center gap-1.5 rounded-badge border border-[#D9DDFF] bg-brand-tint px-3 text-badge text-brand-ink font-semibold"
            title="Active Freeze Shields protect your streak if you miss a day"
          >
            <Snowflake className="w-3.5 h-3.5 text-brand" />
            <span className="tabular-nums">{user.streakFreezeCount} Freezes</span>
          </div>
        </div>

        {/* 7-Day Visual Node Strip */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 my-4">
          {user.streakHistory.map((dayItem, index) => {
            const isDone = dayItem.completed;
            const isToday = dayItem.isToday;

            return (
              <div
                key={index}
                className={`qf-day ${isDone ? 'is-done' : ''} ${isToday ? 'is-today' : ''}`}
              >
                <span className="uppercase text-[11px] font-bold">{dayItem.day}</span>
                <div className="qf-day__dot">
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : dayItem.date.split(' ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-line flex items-center justify-between text-label text-ink-3">
        <span className="flex items-center gap-1.5 text-xs text-win-ink font-medium">
          <ShieldCheck className="w-4 h-4 text-win" />
          Protected against missed attendance
        </span>
        <span className="text-xs font-semibold text-ink">+30 XP Weekend Bonus active</span>
      </div>
    </div>
  );
};
