import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { DailyQuest, DailyQuestAttempt } from '../types';
import { runTestCases, DEFAULT_STARTER_CODE } from '../lib/codeRunner';
import {
  Compass,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  Calendar,
  AlertTriangle,
  Award,
  Play,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const DailyQuestPage: React.FC = () => {
  const { user, dailyQuests, dailyQuestAttempts, submitDailyQuestAnswer, submitDailyQuestCoding } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'past'>('today');
  const [selectedPastAttempt, setSelectedPastAttempt] = useState<DailyQuestAttempt | null>(null);

  // Loading & error simulator for resilient UI
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Student answer state
  const [answerInput, setAnswerInput] = useState('');
  const [selectedMcq, setSelectedMcq] = useState<string>('');
  const [code, setCode] = useState(DEFAULT_STARTER_CODE.cpp);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'python' | 'javascript'>('cpp');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [expandedHints, setExpandedHints] = useState<number[]>([]);
  const [submissionFeedback, setSubmissionFeedback] = useState<any | null>(null);

  // Timer tracking
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Find today's active quest targeted to student's batch
  const userBatch = user.batch || '2024-2028';
  const todayQuest = dailyQuests.find(
    (q) => (q.status === 'live' || q.status === 'closed') && q.targetBatches.includes(userBatch)
  );

  // Check if student already attempted today's quest
  const currentAttempt = todayQuest
    ? dailyQuestAttempts.find((a) => a.questId === todayQuest.id && a.userId === user.id)
    : null;

  // Track quest attempt duration
  useEffect(() => {
    if (!currentAttempt && todayQuest) {
      const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentAttempt, todayQuest]);

  // Load starter code for coding quest if applicable
  useEffect(() => {
    if (todayQuest?.questType === 'coding' && todayQuest.starterCode) {
      setCode(todayQuest.starterCode[selectedLanguage] || DEFAULT_STARTER_CODE[selectedLanguage]);
    }
  }, [todayQuest, selectedLanguage]);

  const toggleHint = (idx: number) => {
    setExpandedHints((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Run visible sample test cases (for coding quest)
  const handleRunSampleTests = async () => {
    if (!todayQuest || !todayQuest.testCases) return;
    setIsRunningTests(true);
    const visibleTests = todayQuest.testCases.filter((t) => !t.isHidden);
    const summary = await runTestCases(
      code,
      selectedLanguage,
      visibleTests.map((t) => ({ input: t.input, expectedOutput: t.expectedOutput, isHidden: false })),
      'run'
    );
    setTestResults(summary.results);
    setIsRunningTests(false);
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!todayQuest) return;
    setIsSubmitting(true);

    try {
      if (todayQuest.questType === 'answer_based') {
        const finalAns = todayQuest.answerType === 'mcq' ? selectedMcq : answerInput;
        if (!finalAns.trim()) {
          alert('Please enter or select an answer before submitting.');
          setIsSubmitting(false);
          return;
        }

        const res = await submitDailyQuestAnswer(todayQuest.id, finalAns, secondsElapsed);
        setSubmissionFeedback(res);
      } else {
        // Coding quest submission
        const allTests = todayQuest.testCases || [];
        const summary = await runTestCases(
          code,
          selectedLanguage,
          allTests.map((t) => ({ input: t.input, expectedOutput: t.expectedOutput, isHidden: t.isHidden })),
          'submit'
        );

        const res = await submitDailyQuestCoding(
          todayQuest.id,
          code,
          selectedLanguage,
          summary.results,
          summary.allPassed,
          secondsElapsed
        );
        setSubmissionFeedback(res);
      }
    } catch (err: any) {
      alert(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Past quests the student attempted
  const pastAttempts = dailyQuestAttempts.filter((a) => a.userId === user.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-gradient-sunset p-0.5 shadow-glowSunset flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-quest-peach" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-quest-textPrimary tracking-tight">Daily Quest</h1>
              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                1 Problem / Day
              </span>
            </div>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Targeted daily problem-solving challenge set by faculty for batch <strong className="text-quest-textPrimary font-mono">{userBatch}</strong>.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl glass-subtle border border-white shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-quest-sky text-white shadow-sm'
                : 'text-quest-textSecondary hover:text-quest-textPrimary'
            }`}
          >
            Today's Quest
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'past'
                ? 'bg-quest-sky text-white shadow-sm'
                : 'text-quest-textSecondary hover:text-quest-textPrimary'
            }`}
          >
            <span>Past Quests</span>
            <span className="w-4 h-4 rounded-full bg-sky-100 text-quest-skyDark text-[10px] font-mono flex items-center justify-center">
              {pastAttempts.length}
            </span>
          </button>
        </div>
      </div>

      {/* TODAY'S QUEST TAB */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="glass-regular rounded-3xl p-8 border border-white space-y-4 animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 rounded-xl" />
              <div className="h-4 w-2/3 bg-slate-200 rounded-xl" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="glass-regular rounded-3xl p-8 border border-white text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-sm text-quest-textPrimary">Failed to Load Daily Quest</h3>
              <p className="text-xs text-quest-textSecondary">Unable to reach curriculum server.</p>
              <button
                onClick={() => setHasError(false)}
                className="px-4 py-2 rounded-xl bg-quest-sky text-white font-bold text-xs shadow-sm hover:brightness-105"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && !todayQuest && (
            <div className="glass-regular rounded-3xl p-12 border border-white text-center space-y-3 shadow-glassSubtle">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center text-quest-sky">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-quest-textPrimary">No Daily Quest Today</h3>
              <p className="text-xs text-quest-textSecondary max-w-md mx-auto">
                No active quest is scheduled for batch <span className="font-mono font-bold text-quest-textPrimary">{userBatch}</span> today. Check back tomorrow at 00:00 UTC.
              </p>
            </div>
          )}

          {/* Active Today Quest */}
          {!isLoading && !hasError && todayQuest && (
            <div className="space-y-6">
              {/* Quest Header Banner */}
              <div className="glass-prominent rounded-3xl border border-white p-6 shadow-glassRegular relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-full ${
                        todayQuest.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : todayQuest.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {todayQuest.difficulty}
                    </span>
                    <span className="text-[11px] font-bold text-quest-skyDark bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                      {todayQuest.topicTag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                      Type: {todayQuest.questType === 'coding' ? 'C++17 Algorithm' : 'Discrete Answer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{todayQuest.xpReward} XP</span>
                    </div>

                    {/* Status Badge */}
                    {currentAttempt ? (
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono ${
                          currentAttempt.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {currentAttempt.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {currentAttempt.isCorrect ? 'Solved' : 'Attempted'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-quest-sky animate-ping" />
                        Live Now
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-black text-quest-textPrimary tracking-tight mb-3">
                  {todayQuest.title}
                </h2>

                <div className="prose prose-sm text-quest-textSecondary leading-relaxed whitespace-pre-wrap font-sans bg-white/70 p-4 rounded-2xl border border-white/80">
                  {todayQuest.statement}
                </div>

                {/* Optional Hints Accordion */}
                {todayQuest.hints && todayQuest.hints.length > 0 && !currentAttempt && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-bold text-quest-textSecondary uppercase tracking-wider font-mono flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-quest-sky" />
                      Guided Hints (Optional)
                    </p>
                    <div className="space-y-1.5">
                      {todayQuest.hints.map((hint, idx) => {
                        const isExpanded = expandedHints.includes(idx);
                        return (
                          <div key={idx} className="rounded-2xl border border-slate-200/80 bg-white/60 overflow-hidden">
                            <button
                              onClick={() => toggleHint(idx)}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-quest-textPrimary flex items-center justify-between hover:bg-white transition-colors"
                            >
                              <span>Hint #{idx + 1}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            {isExpanded && (
                              <div className="px-3.5 pb-2.5 pt-1 text-xs text-quest-textSecondary border-t border-slate-100 bg-sky-50/40">
                                {hint}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* UNATTEMPTED: Interactive Solving Workspace */}
              {!currentAttempt && (
                <div className="glass-regular rounded-3xl border border-white p-6 shadow-glassSubtle space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-quest-textPrimary">Your Submission Workspace</h3>
                      <p className="text-[11px] text-quest-textSecondary">
                        Single evaluated attempt per student. Answer keys are concealed until graded.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-quest-textSecondary bg-slate-100 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-quest-skyDark" />
                      <span>{Math.floor(secondsElapsed / 60)}:{String(secondsElapsed % 60).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Mode: Answer-based */}
                  {todayQuest.questType === 'answer_based' && (
                    <div className="space-y-4">
                      {todayQuest.answerType === 'mcq' && todayQuest.mcqOptions ? (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-quest-textPrimary font-mono block">
                            CHOOSE THE CORRECT STATEMENT:
                          </label>
                          <div className="grid grid-cols-1 gap-2.5">
                            {todayQuest.mcqOptions.map((opt, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedMcq(opt)}
                                className={`p-3.5 rounded-2xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                                  selectedMcq === opt
                                    ? 'bg-sky-50 border-quest-sky text-quest-skyDark shadow-sm font-bold'
                                    : 'bg-white/80 border-slate-200 text-quest-textPrimary hover:bg-white'
                                }`}
                              >
                                <span>{opt}</span>
                                {selectedMcq === opt && <CheckCircle2 className="w-4 h-4 text-quest-sky shrink-0 ml-2" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-quest-textPrimary font-mono block">
                            ENTER YOUR NUMERIC OR SHORT ANSWER:
                          </label>
                          <input
                            type="text"
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder={todayQuest.answerType === 'numeric' ? 'e.g. 20' : 'Your concise answer...'}
                            className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 focus:border-quest-sky outline-none font-mono text-sm text-quest-textPrimary shadow-sm placeholder:text-slate-400"
                          />
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-6 rounded-2xl bg-quest-sky hover:brightness-105 active:scale-[0.99] text-white font-bold text-sm shadow-glassSubtle transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span>{isSubmitting ? 'Evaluating Server-Side...' : 'Submit Daily Answer'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode: Coding Quest (C++17) */}
                  {todayQuest.questType === 'coding' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-quest-textPrimary font-mono">LANGUAGE:</span>
                          <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                            {(['cpp', 'python', 'javascript'] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                  selectedLanguage === lang
                                    ? 'bg-quest-sky text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {lang === 'cpp' ? 'C++17 (g++)' : lang === 'python' ? 'Python 3' : 'JavaScript'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Sandbox: 2.0s CPU • 128MB RAM</span>
                      </div>

                      {/* Code Editor */}
                      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-900 text-slate-100">
                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>main.{selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'py' : 'js'}</span>
                          <span>ISO C++17 Standard</span>
                        </div>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          rows={14}
                          className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 outline-none resize-y leading-relaxed"
                          spellCheck={false}
                        />
                      </div>

                      {/* Visible Test Case Runner */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          onClick={handleRunSampleTests}
                          disabled={isRunningTests || isSubmitting}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-quest-textPrimary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 text-quest-sky" />
                          <span>{isRunningTests ? 'Running in Sandbox...' : 'Run Sample Tests'}</span>
                        </button>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || isRunningTests}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-quest-sky hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs shadow-glassSubtle transition-all flex items-center justify-center gap-2"
                        >
                          <span>{isSubmitting ? 'Evaluating on Hidden Suites...' : 'Submit Final Solution (+75 XP)'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sample Test Case Results Display */}
                      {testResults && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                          <p className="text-xs font-bold text-quest-textPrimary font-mono">SAMPLE TEST SUITE EVALUATION:</p>
                          <div className="space-y-1.5 font-mono text-xs">
                            {testResults.map((tr: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-xl flex items-center justify-between ${
                                  tr.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {tr.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                                  <span>Case #{tr.index}: Input: {tr.input}</span>
                                </span>
                                <span className="text-[11px] font-bold">
                                  {tr.passed ? `Passed (${tr.runtimeMs}ms)` : `Expected: ${tr.expectedOutput}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* POST-SUBMISSION / ATTEMPTED: Revealed Solution, Explanation & XP */}
              {currentAttempt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-prominent rounded-3xl border border-white p-6 shadow-glassRegular space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                          currentAttempt.isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {currentAttempt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-quest-textPrimary">
                          {currentAttempt.isCorrect ? 'Quest Solved Successfully!' : 'Attempt Recorded'}
                        </h3>
                        <p className="text-[11px] text-quest-textSecondary">
                          Submitted on {new Date(currentAttempt.submittedAt).toLocaleTimeString()} • Verified immutable record
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{currentAttempt.xpAwarded} XP Earned</span>
                    </div>
                  </div>

                  {/* Submission and Correct Answer Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Submission</span>
                      <p className="font-bold text-quest-textPrimary break-words">{currentAttempt.submissionText}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Verified Correct Solution</span>
                      <p className="font-bold text-emerald-800 break-words">
                        {currentAttempt.revealedSolution?.correctAnswer || todayQuest.correctAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Revealed Model Solution and Explanation */}
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-quest-skyDark font-mono">
                      <BookOpen className="w-4 h-4" />
                      <span>Faculty Pedagogical Explanation</span>
                    </div>
                    <p className="text-xs text-quest-textSecondary leading-relaxed">
                      {currentAttempt.revealedSolution?.explanation || todayQuest.solutionExplanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
                    <span>Attempt immutable: no re-submissions allowed</span>
                    <span>Streak Contribution +1 Day</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PAST QUESTS TAB */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200/60 pb-2">
            <h2 className="text-base font-bold text-quest-textPrimary">Your Past Daily Quest Archives</h2>
            <p className="text-xs text-quest-textSecondary">
              All previously submitted quests are available in read-only review mode with verified model solutions.
            </p>
          </div>

          {pastAttempts.length === 0 ? (
            <div className="glass-regular rounded-3xl p-12 border border-white text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-quest-textPrimary">No Past Quests Yet</h3>
              <p className="text-xs text-quest-textSecondary">
                Complete today's Daily Quest to build your personal problem archive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pastAttempts.map((att) => {
                const quest = dailyQuests.find((q) => q.id === att.questId);
                return (
                  <div
                    key={att.id}
                    className="glass-subtle hover:bg-white rounded-2xl border border-white p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full ${
                            att.isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {att.isCorrect ? 'Solved' : 'Attempted'}
                        </span>
                        <h3 className="text-sm font-bold text-quest-textPrimary">
                          {quest?.title || 'Daily Quest Problem'}
                        </h3>
                      </div>
                      <p className="text-xs text-quest-textSecondary font-mono">
                        Submitted: {new Date(att.submittedAt).toLocaleDateString()} • +{att.xpAwarded} XP
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPastAttempt(att)}
                      className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-quest-skyDark border border-sky-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Solution</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* READ-ONLY REVIEW MODAL */}
      <AnimatePresence>
        {selectedPastAttempt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPastAttempt(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-prominent rounded-3xl p-6 border border-white shadow-glassProminent space-y-4 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-quest-sky" />
                  <h3 className="font-extrabold text-base text-quest-textPrimary">
                    Read-Only Quest Review
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPastAttempt(null)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Your Submitted Code / Answer</span>
                  <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {selectedPastAttempt.submissionText}
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 font-mono">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Verified Model Answer</span>
                  <p className="font-bold text-emerald-900">
                    {selectedPastAttempt.revealedSolution?.correctAnswer || 'Correct Solution Verified'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Pedagogical Explanation</span>
                  <p className="text-quest-textSecondary leading-relaxed">
                    {selectedPastAttempt.revealedSolution?.explanation || 'Optimal mathematical decomposition confirms correctness.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Score: {selectedPastAttempt.score}/100</span>
                  <span>XP Awarded: +{selectedPastAttempt.xpAwarded} XP (No extra XP in review)</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
