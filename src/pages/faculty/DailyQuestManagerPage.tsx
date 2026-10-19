import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { DailyQuest, DailyQuestType, DailyQuestAnswerType } from '../../types';
import { xpRules } from '../../config/xpRules';
import { DEFAULT_STARTER_CODE } from '../../lib/codeRunner';
import {
  HelpCircle,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  FileCode,
  Edit3,
  Trash2,
  BarChart3,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const DailyQuestManagerPage: React.FC = () => {
  const { dailyQuests, dailyQuestAttempts, createDailyQuest, updateDailyQuest, deleteDailyQuest } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'analytics'>('list');
  const [selectedQuestForAnalytics, setSelectedQuestForAnalytics] = useState<DailyQuest | null>(
    dailyQuests[0] || null
  );

  // Form State
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [questType, setQuestType] = useState<DailyQuestType>('answer_based');
  const [answerType, setAnswerType] = useState<DailyQuestAnswerType>('numeric');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topicTag, setTopicTag] = useState('Algorithms');
  const [targetBatch, setTargetBatch] = useState('2024-2028');
  const [liveDate, setLiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('23:59');
  const [xpReward, setXpReward] = useState(50);
  const [hints, setHints] = useState<string[]>(['']);
  const [modelSolution, setModelSolution] = useState('');
  const [solutionExplanation, setSolutionExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [testCases, setTestCases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([
    { input: 'nums = [1, 2, 3]', expectedOutput: '3', isHidden: false },
    { input: 'nums = [10, 20]', expectedOutput: '20', isHidden: true },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddHint = () => setHints([...hints, '']);
  const handleUpdateHint = (idx: number, val: string) => {
    const updated = [...hints];
    updated[idx] = val;
    setHints(updated);
  };
  const handleRemoveHint = (idx: number) => setHints(hints.filter((_, i) => i !== idx));

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim()) {
      alert('Title and problem statement are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const openAt = new Date(`${liveDate}T${openTime}:00Z`).toISOString();
      const closeAt = new Date(`${liveDate}T${closeTime}:00Z`).toISOString();

      await createDailyQuest(
        {
          title,
          statement,
          questType,
          answerType: questType === 'answer_based' ? answerType : undefined,
          mcqOptions: questType === 'answer_based' && answerType === 'mcq' ? mcqOptions : undefined,
          difficulty,
          topicTag,
          targetBatches: [targetBatch],
          liveDate,
          openAt,
          closeAt,
          xpReward: Math.min(Math.max(xpReward, xpRules.dailyQuest.minXp), xpRules.dailyQuest.maxXp),
          hints: hints.filter((h) => h.trim().length > 0),
          status: 'scheduled',
          starterCode: questType === 'coding' ? { cpp: DEFAULT_STARTER_CODE.cpp, python: DEFAULT_STARTER_CODE.python } : undefined,
          testCases: questType === 'coding' ? testCases.map((t, i) => ({ id: `tc-${Date.now()}-${i}`, ...t, orderIndex: i + 1 })) : undefined,
        },
        {
          modelSolution,
          explanation: solutionExplanation,
          correctAnswer,
        }
      );

      // Reset & return to list
      setTitle('');
      setStatement('');
      setModelSolution('');
      setSolutionExplanation('');
      setCorrectAnswer('');
      setActiveTab('list');
    } catch (err: any) {
      alert(err.message || 'Failed to create Daily Quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Export for student submissions
  const handleExportCsv = (quest: DailyQuest) => {
    const attempts = dailyQuestAttempts.filter((a) => a.questId === quest.id);
    const headers = ['Student ID', 'Student Name', 'Submission', 'Is Correct', 'Score', 'XP Awarded', 'Time (Seconds)', 'Submitted At'];
    const rows = attempts.map((a) => [
      `"${a.studentId}"`,
      `"${a.studentName}"`,
      `"${(a.submissionText || '').replace(/"/g, '""')}"`,
      a.isCorrect ? 'YES' : 'NO',
      a.score,
      a.xpAwarded,
      a.timeTakenSeconds,
      `"${a.submittedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `daily_quest_${quest.id}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-quest-textPrimary tracking-tight">Daily Quest Manager</h1>
            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200">
              Faculty Suite
            </span>
          </div>
          <p className="text-xs text-quest-textSecondary mt-0.5">
            Create, schedule, and evaluate single problem-solving quests per batch.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 rounded-2xl glass-subtle border border-white shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list' ? 'bg-quest-sky text-white shadow-sm' : 'text-quest-textSecondary hover:text-quest-textPrimary'
            }`}
          >
            All Quests ({dailyQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create' ? 'bg-quest-sky text-white shadow-sm' : 'text-quest-textSecondary hover:text-quest-textPrimary'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule New Quest</span>
          </button>
        </div>
      </div>

      {/* ALL QUESTS LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {dailyQuests.map((quest) => {
              const attempts = dailyQuestAttempts.filter((a) => a.questId === quest.id);
              const solves = attempts.filter((a) => a.isCorrect).length;
              const solveRate = attempts.length > 0 ? Math.round((solves / attempts.length) * 100) : 0;

              return (
                <div
                  key={quest.id}
                  className="glass-regular rounded-3xl border border-white p-5 shadow-glassSubtle flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                          quest.status === 'live'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                            : quest.status === 'scheduled'
                            ? 'bg-sky-100 text-quest-skyDark border border-sky-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {quest.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                        Batch: {quest.targetBatches.join(', ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                        Date: {quest.liveDate}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        +{quest.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-base font-black text-quest-textPrimary tracking-tight truncate">
                      {quest.title}
                    </h3>

                    <p className="text-xs text-quest-textSecondary line-clamp-2 leading-relaxed">
                      {quest.statement}
                    </p>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-quest-textPrimary font-mono">{attempts.length} attempts</p>
                      <p className="text-[10px] text-quest-textSecondary font-mono">{solveRate}% solve rate</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedQuestForAnalytics(quest);
                        setActiveTab('analytics');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-quest-skyDark border border-sky-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Results & Analytics</span>
                    </button>

                    <button
                      onClick={() => handleExportCsv(quest)}
                      title="Download CSV submissions"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteDailyQuest(quest.id)}
                      title="Delete quest"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / SCHEDULE QUEST FORM */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateQuest} className="glass-regular rounded-3xl border border-white p-6 sm:p-8 shadow-glassRegular space-y-6">
          <div className="border-b border-slate-200/60 pb-3">
            <h2 className="text-base font-bold text-quest-textPrimary">Schedule a New Daily Quest</h2>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Set one problem for the day. XP will be governed by xpRules config limits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">QUEST TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Optimal Path Monotonicity"
                required
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary outline-none focus:border-quest-sky"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">TOPIC TAG</label>
              <input
                type="text"
                value={topicTag}
                onChange={(e) => setTopicTag(e.target.value)}
                placeholder="e.g. Graph Theory, Dynamic Programming"
                required
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-quest-textPrimary outline-none focus:border-quest-sky"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">PROBLEM STATEMENT</label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={5}
              placeholder="Detailed mathematical or computational problem statement..."
              required
              className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs text-quest-textPrimary outline-none focus:border-quest-sky leading-relaxed"
            />
          </div>

          {/* Quest Type Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">QUEST TYPE</label>
              <select
                value={questType}
                onChange={(e) => setQuestType(e.target.value as DailyQuestType)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary outline-none"
              >
                <option value="answer_based">Answer-based (Numeric / Text / MCQ)</option>
                <option value="coding">Coding (C++17 with test suite)</option>
              </select>
            </div>

            {questType === 'answer_based' && (
              <div>
                <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">ANSWER FORMAT</label>
                <select
                  value={answerType}
                  onChange={(e) => setAnswerType(e.target.value as DailyQuestAnswerType)}
                  className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary outline-none"
                >
                  <option value="numeric">Numeric Value</option>
                  <option value="short_text">Short Text String</option>
                  <option value="mcq">Multiple Choice Options</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">DIFFICULTY</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary outline-none"
              >
                <option value="Easy">Easy (35 XP)</option>
                <option value="Medium">Medium (50 XP)</option>
                <option value="Hard">Hard (75 XP)</option>
              </select>
            </div>
          </div>

          {/* Schedule Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">TARGET BATCH</label>
              <input
                type="text"
                value={targetBatch}
                onChange={(e) => setTargetBatch(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono font-bold text-quest-textPrimary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">LIVE DATE</label>
              <input
                type="date"
                value={liveDate}
                onChange={(e) => setLiveDate(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-quest-textPrimary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">OPEN TIME (UTC)</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-quest-textPrimary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-quest-textPrimary mb-1.5 font-mono">CLOSE TIME (UTC)</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-quest-textPrimary outline-none"
              />
            </div>
          </div>

          {/* Solution & Answer Key (Concealed until graded) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <h3 className="text-xs font-bold text-amber-900 font-mono uppercase">
              CONFIDENTIAL MODEL SOLUTION & GRADING SPECIFICATION
            </h3>

            {questType === 'answer_based' && (
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1 font-mono">CORRECT ANSWER KEY</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="e.g. 20"
                  required
                  className="w-full p-2.5 rounded-xl bg-white border border-amber-200 text-xs font-mono font-bold text-quest-textPrimary outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 font-mono">MODEL SOLUTION SUMMARY</label>
              <input
                type="text"
                value={modelSolution}
                onChange={(e) => setModelSolution(e.target.value)}
                placeholder="Compact mathematical representation of the solution..."
                required
                className="w-full p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-quest-textPrimary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 font-mono">PEDAGOGICAL EXPLANATION</label>
              <textarea
                value={solutionExplanation}
                onChange={(e) => setSolutionExplanation(e.target.value)}
                rows={3}
                placeholder="Detailed rationale revealed to students after they submit..."
                required
                className="w-full p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-quest-textPrimary outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-quest-textSecondary font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-quest-sky text-white font-bold text-xs shadow-glassSubtle hover:brightness-105"
            >
              {isSubmitting ? 'Scheduling...' : 'Save & Schedule Quest'}
            </button>
          </div>
        </form>
      )}

      {/* ANALYTICS & RESULTS VIEW */}
      {activeTab === 'analytics' && selectedQuestForAnalytics && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <button
                onClick={() => setActiveTab('list')}
                className="text-xs font-bold text-quest-skyDark hover:underline mb-1 inline-block"
              >
                ← Back to All Quests
              </button>
              <h2 className="text-lg font-black text-quest-textPrimary">
                Analytics for: {selectedQuestForAnalytics.title}
              </h2>
            </div>
            <button
              onClick={() => handleExportCsv(selectedQuestForAnalytics)}
              className="px-4 py-2 rounded-xl bg-quest-sky text-white font-bold text-xs shadow-sm flex items-center gap-2 hover:brightness-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Key Metrics */}
          {(() => {
            const attempts = dailyQuestAttempts.filter((a) => a.questId === selectedQuestForAnalytics.id);
            const solves = attempts.filter((a) => a.isCorrect).length;
            const solveRate = attempts.length > 0 ? Math.round((solves / attempts.length) * 100) : 0;
            const avgTime = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + (a.timeTakenSeconds || 0), 0) / attempts.length) : 0;

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-3xl glass-regular border border-white space-y-1">
                    <span className="text-[10px] font-bold text-quest-textSecondary font-mono uppercase">Total Submissions</span>
                    <p className="text-2xl font-black text-quest-textPrimary font-mono">{attempts.length}</p>
                  </div>
                  <div className="p-4 rounded-3xl glass-regular border border-white space-y-1">
                    <span className="text-[10px] font-bold text-quest-textSecondary font-mono uppercase">Solve Rate</span>
                    <p className="text-2xl font-black text-emerald-600 font-mono">{solveRate}%</p>
                  </div>
                  <div className="p-4 rounded-3xl glass-regular border border-white space-y-1">
                    <span className="text-[10px] font-bold text-quest-textSecondary font-mono uppercase">Average Time</span>
                    <p className="text-2xl font-black text-quest-skyDark font-mono">{avgTime}s</p>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="glass-regular rounded-3xl border border-white p-5 shadow-glassSubtle space-y-3">
                  <h3 className="text-sm font-black text-quest-textPrimary font-mono uppercase">
                    Student Submissions Log
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] font-bold font-mono text-slate-400 uppercase">
                          <th className="pb-2">Student</th>
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Submission</th>
                          <th className="pb-2">Result</th>
                          <th className="pb-2">XP</th>
                          <th className="pb-2">Time</th>
                          <th className="pb-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {attempts.map((att) => (
                          <tr key={att.id} className="hover:bg-white/60 transition-colors">
                            <td className="py-2.5 font-bold text-quest-textPrimary font-sans">{att.studentName}</td>
                            <td className="py-2.5 text-slate-500">{att.studentId}</td>
                            <td className="py-2.5 text-quest-textPrimary max-w-[200px] truncate">{att.submissionText}</td>
                            <td className="py-2.5">
                              {att.isCorrect ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Solved</span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Incorrect</span>
                              )}
                            </td>
                            <td className="py-2.5 font-bold text-amber-700">+{att.xpAwarded}</td>
                            <td className="py-2.5 text-slate-500">{att.timeTakenSeconds}s</td>
                            <td className="py-2.5 text-slate-400 text-[11px] font-sans">
                              {new Date(att.submittedAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
