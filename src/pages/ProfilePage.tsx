import React from 'react';
import { useApp } from '../context/AppContext';
import { XpHistoryCard } from '../components/gamification/XpHistoryCard';
import {
  Flame,
  BookOpen,
  Code2,
  Award,
  Shield,
  CheckCircle2,
  Snowflake
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ProfilePage: React.FC = () => {
  const { user, achievements } = useApp();

  const weeklyData = [
    { day: 'Mon', xp: 140 },
    { day: 'Tue', xp: 210 },
    { day: 'Wed', xp: 180 },
    { day: 'Thu', xp: 320 },
    { day: 'Fri', xp: 260 },
    { day: 'Sat', xp: 380 },
    { day: 'Sun', xp: 350 },
  ];

  // 16 weeks of realistic learning activity heatmap grid (16 cols x 7 rows = 112 cells)
  const heatmapWeeks = Array.from({ length: 16 }, (_, wIndex) =>
    Array.from({ length: 7 }, (_, dIndex) => {
      const active = (wIndex * 7 + dIndex) % 3 !== 0 || wIndex > 13;
      const count = active ? ((wIndex + dIndex) % 4) + 1 : 0;
      return {
        level: count,
        date: `Week ${wIndex + 1}, Day ${dIndex + 1}`,
      };
    })
  );

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-gradient-to-r from-pink-400 to-purple-400 shadow-sm';
      case 3:
        return 'bg-purple-300';
      case 2:
        return 'bg-purple-200';
      case 1:
        return 'bg-pink-100';
      case 0:
      default:
        return 'bg-slate-100 border border-slate-200/60';
    }
  };

  const unlockedBadges = achievements.filter((a) => a.unlocked);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Student Passport Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-50 via-purple-50/70 to-blue-50 border border-quest-border p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-white shadow-card"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white text-[10px] font-black shadow-sm font-mono">
                LVL {user.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-quest-navy">{user.name}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-quest-border text-quest-navy font-bold shadow-sm">
                  {user.collegeId}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 font-mono">
                  {user.role}
                </span>
              </div>

              <p className="text-xs text-quest-muted mt-1">
                {user.major} • {user.semester}
              </p>

              <div className="flex items-center gap-2.5 mt-3.5 flex-wrap text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 font-bold shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="tabular-nums">{user.streakDays} Day Streak</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 font-bold shadow-sm">
                  <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                  <span className="tabular-nums">{user.streakFreezeCount} Freezes Held</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 font-bold shadow-sm">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{user.league} League • Rank #{user.classRank}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right border-t md:border-t-0 pt-4 md:pt-0 border-quest-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-quest-muted">Lifetime Academic XP</span>
            <p className="text-3xl sm:text-4xl font-black text-quest-navy font-mono mt-0.5 tabular-nums">
              {user.xp.toLocaleString()}{' '}
              <span className="text-base text-amber-600 font-bold">XP</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Top 15% Semester Velocity
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">Courses Completed</span>
          <p className="text-2xl font-black text-quest-navy mt-1 tabular-nums">{user.coursesCompleted}</p>
          <span className="text-[10px] text-quest-muted">2 modules in progress</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">Coding Problems</span>
          <p className="text-2xl font-black text-quest-navy mt-1 tabular-nums">{user.codingProblemsSolved}</p>
          <span className="text-[10px] text-quest-muted">Verified AST submissions</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">Quiz Accuracy</span>
          <p className="text-2xl font-black text-quest-navy mt-1 tabular-nums">{user.quizAccuracy}%</p>
          <span className="text-[10px] text-emerald-700 font-medium">Above cohort average (78%)</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
          <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">Unlocked Badges</span>
          <p className="text-2xl font-black text-quest-navy mt-1 tabular-nums">{unlockedBadges.length}</p>
          <span className="text-[10px] text-purple-700 font-medium">6 Verified Honors</span>
        </div>
      </div>

      {/* GitHub-style Learning Activity Heatmap */}
      <div className="rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-quest-border gap-2">
          <div>
            <h3 className="text-sm font-bold text-quest-navy">Daily Learning Activity Heatmap</h3>
            <p className="text-xs text-quest-muted">112 Days of Continuous Practice & Lab Submissions</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-quest-muted">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
            <div className="w-3 h-3 rounded-sm bg-pink-100" />
            <div className="w-3 h-3 rounded-sm bg-purple-200" />
            <div className="w-3 h-3 rounded-sm bg-purple-300" />
            <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-pink-400 to-purple-400 shadow-sm" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1.5">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((cell, dIdx) => (
                  <div
                    key={dIdx}
                    title={`${cell.date}: Level ${cell.level} Velocity`}
                    className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${getHeatmapColor(
                      cell.level
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts & XP History Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Activity Velocity Chart */}
        <div className="rounded-3xl bg-white border border-quest-border p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-quest-border mb-3">
            <div>
              <h3 className="text-sm font-bold text-quest-navy">Weekly XP Velocity</h3>
              <p className="text-xs text-quest-muted">Verified actions over last 7 days</p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-600 tabular-nums">
              Total: 1,840 XP
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1E5E9" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #F1E5E9',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#24324B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="xp" fill="#F472B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP History Ledger */}
        <XpHistoryCard />
      </div>
    </div>
  );
};
