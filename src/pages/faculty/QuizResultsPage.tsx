import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Download,
  Search,
  RefreshCw,
  Users,
  Award,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Edit3,
  ShieldAlert
} from 'lucide-react';

export const QuizResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customQuizzes, getQuizAnalytics, rescoreCustomQuiz, addToast } = useApp();

  const quiz = customQuizzes.find((q) => q.id === id);
  const analytics = id ? getQuizAnalytics(id) : null;

  const [searchStudent, setSearchStudent] = useState('');
  const [isRescoring, setIsRescoring] = useState(false);

  if (!quiz || !analytics) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-xl font-black text-[#24324B]">Quiz Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-4">
          The requested quiz does not exist or has been removed.
        </p>
        <Link
          to="/faculty/quizzes"
          className="px-4 py-2 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset"
        >
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const filteredAttempts = analytics.studentAttempts.filter((att) =>
    att.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
    att.studentId.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleExportCsv = () => {
    if (analytics.studentAttempts.length === 0) {
      addToast({
        type: 'info',
        title: 'No Data to Export',
        message: 'No student attempts have been submitted for this quiz yet.',
      });
      return;
    }

    const headers = 'Student ID,Full Name,Score,Max Score,Percentage,XP Awarded,Completed At\n';
    const rows = analytics.studentAttempts
      .map((a) => {
        const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
        return `"${a.studentId}","${a.studentName}",${a.score},${a.maxScore},"${pct}%",${a.xpEarned},"${a.completedAt}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${quiz.courseTag}_${quiz.id}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Downloaded results file for ${quiz.title}.`,
    });
  };

  const handleRescoreAll = async () => {
    setIsRescoring(true);
    await rescoreCustomQuiz(quiz.id);
    setIsRescoring(false);
  };

  const formatMinutesSecs = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1E5E9]">
        <div className="flex items-center gap-3">
          <Link
            to="/faculty/quizzes"
            className="p-2.5 rounded-2xl border border-[#F1E5E9] bg-white text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB]">
                {quiz.courseTag}
              </span>
              <span className="text-xs text-[#64748B] font-mono">v{quiz.version}</span>
            </div>
            <h1 className="text-2xl font-black text-[#24324B] tracking-tight">
              Results & Diagnostics: {quiz.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={isRescoring}
            onClick={handleRescoreAll}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescoring ? 'animate-spin' : ''}`} />
            <span>Re-Score Attempts</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Export to CSV</span>
          </button>

          <Link
            to={`/faculty/quizzes/${quiz.id}/edit`}
            className="px-4 py-2.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Quiz</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Total Attempts</span>
            <p className="text-2xl font-black text-[#24324B]">{analytics.totalAttempts}</p>
            <span className="text-[10px] text-[#2563EB] font-bold">100% Valid Submissions</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Average Score</span>
            <p className="text-2xl font-black text-[#24324B]">{analytics.averageScore}%</p>
            <span className="text-[10px] text-emerald-600 font-bold">Cohort Mean</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center text-[#EC4899] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Average Duration</span>
            <p className="text-2xl font-black text-[#24324B]">{formatMinutesSecs(analytics.averageTimeSecs)}</p>
            <span className="text-[10px] text-[#EC4899] font-bold">Allowed: {quiz.timeLimitMins}m</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Completion Rate</span>
            <p className="text-2xl font-black text-[#24324B]">{analytics.completionRate}%</p>
            <span className="text-[10px] text-amber-700 font-bold">Of Started Sprints</span>
          </div>
        </div>
      </div>

      {/* Row: Score Distribution & Question Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution Histogram */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1E5E9]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#24324B]">
              Score Distribution
            </h3>
            <span className="text-[11px] font-bold text-[#64748B]">
              {analytics.totalAttempts} total attempts
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.scoreDistribution.map((dist) => {
              const pct = analytics.totalAttempts > 0
                ? Math.round((dist.count / analytics.totalAttempts) * 100)
                : 0;

              return (
                <div key={dist.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#24324B]">
                    <span>{dist.range}</span>
                    <span className="text-[#64748B] font-mono">
                      {dist.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-sunset transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question-By-Question Accuracy Analytics */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1E5E9]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#24324B]">
              Item Difficulty & Question Accuracy
            </h3>
            <span className="text-[11px] font-bold text-[#64748B]">
              {analytics.questionStats.length} items
            </span>
          </div>

          <div className="space-y-3.5">
            {analytics.questionStats.map((stat, idx) => (
              <div
                key={stat.questionId}
                className="p-3.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold text-[#24324B] leading-snug">
                    <span className="text-[#2563EB] font-black mr-1.5">Q{idx + 1}.</span>
                    {stat.questionText}
                  </p>
                  <span
                    className={`text-xs font-black font-mono px-2 py-0.5 rounded-md shrink-0 ${
                      stat.accuracyPercent >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : stat.accuracyPercent >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {stat.accuracyPercent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stat.accuracyPercent >= 80
                        ? 'bg-emerald-500'
                        : stat.accuracyPercent >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.accuracyPercent}%` }}
                  />
                </div>

                {stat.mostMissedChoice && (
                  <p className="text-[10px] text-amber-900 font-bold bg-amber-50/80 px-2.5 py-1 rounded-lg">
                    ⚠️ Common pitfall: {stat.mostMissedChoice}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Integrity Alerts for this quiz */}
      {analytics.integrityFlags && analytics.integrityFlags.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Integrity Watchdog Flags ({analytics.integrityFlags.length} Incidents)
            </h3>
          </div>
          <div className="space-y-2">
            {analytics.integrityFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-3 rounded-2xl bg-white border border-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <strong className="text-[#24324B]">{flag.studentName} ({flag.studentId})</strong> &bull;{' '}
                  <span className="text-rose-700 font-bold">{flag.type}</span>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{flag.details}</p>
                </div>
                <span className="text-[10px] font-bold text-[#64748B] shrink-0 font-mono">
                  {flag.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Submissions Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1E5E9]">
          <div>
            <h3 className="text-sm font-black text-[#24324B]">
              Student Submissions
            </h3>
            <p className="text-xs text-[#64748B]">
              Verified attempts graded by secure server-side RPC logic.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Search student or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F1E5E9] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3 font-mono">Mains ID</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3 text-center">XP Awarded</th>
                  <th className="py-3 px-3">Completed At</th>
                  <th className="py-3 px-3 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E5E9]">
                {filteredAttempts.map((att) => {
                  const pct = att.maxScore > 0 ? Math.round((att.score / att.maxScore) * 100) : 0;
                  const hasFlag = analytics.integrityFlags.some((f) => f.studentId === att.studentId);

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#24324B]">
                        {att.studentName}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-[#64748B]">
                        {att.studentId}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-[#24324B]">
                        {att.score} / {att.maxScore}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono ${
                            pct >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : pct >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-700">
                        +{att.xpEarned} XP
                      </td>
                      <td className="py-3.5 px-3 text-[#64748B] font-medium">
                        {att.completedAt}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {hasFlag ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No student attempts found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};
