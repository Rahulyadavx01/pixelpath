import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { xpRules } from '../config/xpRules';
import {
  History,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Award,
  BookOpen,
  Code,
  Users,
  Flame,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const XpHistoryPage: React.FC = () => {
  const { user, xpTransactions } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [showVoidedOnly, setShowVoidedOnly] = useState<boolean>(false);

  // Filter transactions for current student
  const studentTransactions = useMemo(() => {
    return xpTransactions.filter((tx) => {
      const isOwner = tx.userId === user.id || tx.studentId === user.collegeId;
      if (!isOwner) return false;
      if (showVoidedOnly && !tx.isVoided) return false;
      if (filterType !== 'all' && tx.actionType !== filterType) return false;
      return true;
    });
  }, [xpTransactions, user.id, user.collegeId, filterType, showVoidedOnly]);

  // Compute Today's XP metrics in Asia/Kolkata timezone
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  }, []);

  const todayTransactions = useMemo(() => {
    return xpTransactions.filter((tx) => {
      const isOwner = tx.userId === user.id || tx.studentId === user.collegeId;
      if (!isOwner || tx.isVoided) return false;
      const txDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(tx.createdAt));
      return txDateStr === todayStr;
    });
  }, [xpTransactions, user.id, user.collegeId, todayStr]);

  const todayTotalXp = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  // Capped daily XP (excluding attendance and bi-weekly tests)
  const todayCappedXp = useMemo(() => {
    return todayTransactions
      .filter((t) => t.actionType !== 'attendance' && t.actionType !== 'biweekly_test')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  const todayCodingSolvesCount = useMemo(() => {
    return todayTransactions.filter((t) => t.actionType?.startsWith('coding_')).length;
  }, [todayTransactions]);

  const todayPeerHelpCount = useMemo(() => {
    return todayTransactions.filter((t) => t.actionType === 'peer_help').length;
  }, [todayTransactions]);

  const todayQuizCompleted = useMemo(() => {
    return todayTransactions.some((t) => t.actionType === 'daily_quiz');
  }, [todayTransactions]);

  const todayQuestCompleted = useMemo(() => {
    return todayTransactions.some((t) => t.actionType === 'daily_quest');
  }, [todayTransactions]);

  const todayClubCompleted = useMemo(() => {
    return todayTransactions.some((t) => t.actionType === 'club_activity');
  }, [todayTransactions]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'official_attendance_roster':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'lms_assignment_submission':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'faculty_gradebook_import':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'coding_sandbox':
        return <Code className="w-4 h-4 text-amber-600" />;
      case 'discussion_accepted_answer':
      case 'peer_acceptance':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'streak_engine':
        return <Flame className="w-4 h-4 text-orange-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-600" />;
    }
  };

  const uniqueActionTypes = useMemo(() => {
    const set = new Set<string>();
    xpTransactions.forEach((t) => {
      if (t.userId === user.id || t.studentId === user.collegeId) {
        set.add(t.actionType);
      }
    });
    return Array.from(set);
  }, [xpTransactions, user.id, user.collegeId]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-prominent border border-white p-6 sm:p-8 shadow-glassProminent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-quest-skyDark text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-quest-sky" />
                VERIFIED IMMUTABLE AUDIT LEDGER
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-quest-textPrimary tracking-tight">
              XP Ledger & Point Economy
            </h1>
            <p className="text-sm text-quest-textSecondary max-w-2xl font-sans">
              Every point is verified against official MSOT academic data, sandboxed test cases, or campus attendance.
              Game XP rewards dedication and consistency; official GPA remains untouched.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-regular px-5 py-3 rounded-2xl border border-white text-right">
              <span className="text-[11px] font-mono uppercase text-quest-textSecondary block">Total Verified XP</span>
              <span className="text-2xl sm:text-3xl font-black text-quest-textPrimary font-mono tabular-nums">
                {user.xp.toLocaleString()} <span className="text-amber-500 text-lg">XP</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Cap & Daily Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Daily Cap Card */}
        <div className="glass-card p-6 rounded-3xl border border-white shadow-glassSubtle flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono font-bold text-quest-skyDark uppercase tracking-wider">
                Daily Non-Academic Cap
              </span>
              <span className="text-xs font-mono font-bold text-quest-textSecondary">
                {todayCappedXp} / {xpRules.limits.globalDailyCap} XP
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-quest-textPrimary mb-1">Standard Daily Limit</h3>
            <p className="text-xs text-quest-textSecondary mb-4">
              Protects learning balance. Attendance & bi-weekly test marks bypass this cap.
            </p>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                className={`h-full rounded-full ${
                  todayCappedXp >= xpRules.limits.globalDailyCap
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-sky-400 to-quest-skyDark'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (todayCappedXp / xpRules.limits.globalDailyCap) * 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-quest-textSecondary font-mono">
            <span>+{todayTotalXp} XP Total Today</span>
            <span>{Math.max(0, xpRules.limits.globalDailyCap - todayCappedXp)} XP Remaining</span>
          </div>
        </div>

        {/* Sub-Cap Tracker: Coding & Peer Help */}
        <div className="glass-card p-6 rounded-3xl border border-white shadow-glassSubtle space-y-4">
          <span className="text-xs font-mono font-bold text-quest-skyDark uppercase tracking-wider block">
            Anti-Farming Limits Today
          </span>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-quest-textPrimary mb-1">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-500" /> Coding Solves
                </span>
                <span className="font-mono font-bold">
                  {todayCodingSolvesCount} / {xpRules.limits.codingDailySolvesMax}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (todayCodingSolvesCount / xpRules.limits.codingDailySolvesMax) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-quest-textPrimary mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> Peer Help Accepted
                </span>
                <span className="font-mono font-bold">
                  {todayPeerHelpCount} / {xpRules.limits.peerHelpDailyAcceptsMax}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, (todayPeerHelpCount / xpRules.limits.peerHelpDailyAcceptsMax) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activities Completed Status */}
        <div className="glass-card p-6 rounded-3xl border border-white shadow-glassSubtle space-y-3">
          <span className="text-xs font-mono font-bold text-quest-skyDark uppercase tracking-wider block">
            Daily Activities (1/Day Max)
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100">
              <span className="font-medium text-quest-textPrimary">Daily Quiz</span>
              {todayQuizCompleted ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                </span>
              ) : (
                <span className="text-slate-400 font-mono">Available</span>
              )}
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100">
              <span className="font-medium text-quest-textPrimary">Daily Problem Quest</span>
              {todayQuestCompleted ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                </span>
              ) : (
                <span className="text-slate-400 font-mono">Available</span>
              )}
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100">
              <span className="font-medium text-quest-textPrimary">Club Activity</span>
              {todayClubCompleted ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                </span>
              ) : (
                <span className="text-slate-400 font-mono">Unmarked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Reference Accordion / Panel */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white shadow-glassSubtle space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-quest-sky" />
          <h2 className="text-xl font-bold text-quest-textPrimary">Official MSOT Point Economy Rules</h2>
        </div>
        <p className="text-xs text-quest-textSecondary">
          Points are strictly earned through verified student activities. Tampering or script automation is automatically detected by anti-farming checks and flagged for faculty review.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200/80 text-quest-textSecondary font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">XP Reward</th>
                <th className="py-2.5 px-3">Daily Limit</th>
                <th className="py-2.5 px-3">Verification Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-quest-textPrimary font-medium">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Attend a class</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">+10 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Per class, official attendance only (no daily cap)</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Official Campus Roster</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Submit classwork/homework on time</td>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">+20 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Per assignment on-time</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">LMS Assignment Submission</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Daily quiz completed</td>
                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">15 + 5 / correct</td>
                <td className="py-2.5 px-3 text-slate-600">Once per day</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Daily Quiz Server Evaluation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Bi-weekly test score</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">floor(score% / 2), max 50</td>
                <td className="py-2.5 px-3 text-slate-600">Per test (no daily cap)</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Faculty Gradebook Import</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Solve coding problem (Easy / Med / Hard)</td>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-700">+10 / +20 / +40 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Max 10 solves per day</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Sandboxed Test Suite Evaluation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Club activity participation</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">+25 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Max 1 club activity per day</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Faculty / Club Lead Verification</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">7-day learning streak</td>
                <td className="py-2.5 px-3 font-mono font-bold text-orange-700">+50 XP bonus</td>
                <td className="py-2.5 px-3 text-slate-600">Once per active 7-day cycle</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Platform Activity Engine</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Help a peer (answer accepted)</td>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">+15 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Max 3 per day (asker accepted only)</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Peer Discussion Forum</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Daily Quest (Easy / Med / Hard)</td>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">+35 / +50 / +75 XP</td>
                <td className="py-2.5 px-3 text-slate-600">Once per day</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">Daily Quest Engine</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white shadow-glassSubtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-quest-sky" />
            <h2 className="text-xl font-bold text-quest-textPrimary">Immutable Transaction Ledger</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {studentTransactions.length} entries
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by action */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-mono font-medium bg-white/90 border border-slate-200 rounded-xl px-3 py-2 text-quest-textPrimary focus:outline-none focus:ring-2 focus:ring-quest-sky"
            >
              <option value="all">All Actions</option>
              {uniqueActionTypes.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>

            {/* Toggle Voided */}
            <label className="flex items-center gap-2 text-xs font-mono text-quest-textSecondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showVoidedOnly}
                onChange={(e) => setShowVoidedOnly(e.target.checked)}
                className="rounded border-slate-300 text-quest-sky focus:ring-quest-sky"
              />
              Show Voided Only
            </label>
          </div>
        </div>

        {studentTransactions.length === 0 ? (
          <div className="text-center py-12 text-quest-textSecondary">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-sm">No transactions found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-quest-textSecondary font-mono uppercase text-[11px]">
                  <th className="py-3 px-3">Date & Time (IST)</th>
                  <th className="py-3 px-3">Action Description</th>
                  <th className="py-3 px-3">Source & Reference</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-sky-50/40 transition-colors ${
                      tx.isVoided ? 'bg-rose-50/40 text-slate-400 line-through' : 'text-quest-textPrimary'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{tx.description}</div>
                      <div className="text-[11px] font-mono text-slate-500">{tx.actionType}</div>
                      {tx.isVoided && tx.voidReason && (
                        <div className="text-[11px] text-rose-600 font-normal no-underline not-italic mt-0.5">
                          Voided by faculty: "{tx.voidReason}"
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {getSourceIcon(tx.source)}
                        <span>{tx.source}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Ref: {tx.referenceId}</div>
                    </td>
                    <td className="py-3 px-3">
                      {tx.isVoided ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                          VOIDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          VERIFIED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap">
                      {tx.isVoided ? (
                        <span className="text-slate-400">+{tx.amount} XP</span>
                      ) : (
                        <span className="text-emerald-700">+{tx.amount} XP</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default XpHistoryPage;
