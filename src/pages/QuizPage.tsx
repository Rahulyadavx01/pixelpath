import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  CustomQuiz,
  CustomQuizQuestion,
  CustomQuizAttempt
} from '../types';
import { xpRules } from '../config/xpRules';
import {
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Eye,
  Lock,
  AlertCircle,
  HelpCircle,
  Hash,
  CheckSquare,
  Check,
  RotateCcw,
  Calendar,
  Layers,
  Award,
  Flame,
  ChevronLeft
} from 'lucide-react';

export const QuizPage: React.FC = () => {
  const {
    user,
    customQuizzes,
    customAttempts,
    submitCustomQuizAttempt,
    addToast,
    triggerCelebration
  } = useApp();

  // Navigation / view state: 'catalog' | 'active_quiz' | 'review'
  const [viewMode, setViewMode] = useState<'catalog' | 'active_quiz' | 'review'>('catalog');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  // Loading & error state simulation
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Active quiz answering state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number[] }>({});
  const [numericAnswers, setNumericAnswers] = useState<{ [qId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [activeAttempt, setActiveAttempt] = useState<CustomQuizAttempt | null>(null);

  // Reconcile dynamic quiz status based on server/current time
  const currentTime = useMemo(() => new Date().getTime(), []);

  const studentBatch = user.batch || '2024-2028';

  // Quizzes targeted to student's batch with computed status
  const batchQuizzes = useMemo(() => {
    return customQuizzes
      .filter((q) => {
        if (!q.targetBatches || q.targetBatches.length === 0) return true;
        return q.targetBatches.includes(studentBatch);
      })
      .map((q) => {
        const openTime = new Date(q.openAt).getTime();
        const closeTime = new Date(q.closeAt).getTime();
        let computedStatus: CustomQuiz['status'] = q.status;
        if (q.status !== 'draft') {
          if (currentTime < openTime) {
            computedStatus = 'scheduled';
          } else if (currentTime >= openTime && currentTime <= closeTime) {
            computedStatus = 'live';
          } else {
            computedStatus = 'closed';
          }
        }
        return { ...q, status: computedStatus };
      });
  }, [customQuizzes, studentBatch, currentTime]);

  // Student's completed attempts
  const studentAttempts = useMemo(() => {
    return customAttempts.filter(
      (a) => a.userId === user.id || a.studentId === user.collegeId
    );
  }, [customAttempts, user.id, user.collegeId]);

  // Map of completed quiz ids
  const completedQuizIds = useMemo(() => {
    return new Set(studentAttempts.map((a) => a.quizId));
  }, [studentAttempts]);

  // Quizzes categorized
  const liveQuizzes = useMemo(
    () => batchQuizzes.filter((q) => q.status === 'live' && !completedQuizIds.has(q.id)),
    [batchQuizzes, completedQuizIds]
  );

  const upcomingQuizzes = useMemo(
    () => batchQuizzes.filter((q) => q.status === 'scheduled'),
    [batchQuizzes]
  );

  const closedQuizzes = useMemo(
    () => batchQuizzes.filter((q) => q.status === 'closed' && !completedQuizIds.has(q.id)),
    [batchQuizzes, completedQuizIds]
  );

  const completedQuizzesList = useMemo(() => {
    return studentAttempts.map((att) => {
      const quizRef = customQuizzes.find((q) => q.id === att.quizId);
      return { attempt: att, quiz: quizRef };
    });
  }, [studentAttempts, customQuizzes]);

  // Currently focused quiz (either taking or reviewing)
  const currentQuiz = useMemo(() => {
    return customQuizzes.find((q) => q.id === selectedQuizId) || null;
  }, [customQuizzes, selectedQuizId]);

  // Launch a quiz sprint
  const handleStartQuiz = (quiz: CustomQuiz) => {
    if (completedQuizIds.has(quiz.id)) {
      handleReviewQuiz(quiz.id);
      return;
    }
    setSelectedQuizId(quiz.id);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setNumericAnswers({});
    setActiveAttempt(null);
    setSecondsRemaining(quiz.timeLimitMins * 60);
    setViewMode('active_quiz');
  };

  // Launch review mode for a completed quiz
  const handleReviewQuiz = (quizId: string) => {
    const existing = studentAttempts.find((a) => a.quizId === quizId);
    if (existing) {
      setSelectedQuizId(quizId);
      setActiveAttempt(existing);
      setCurrentIndex(0);
      setViewMode('review');
    }
  };

  // Timer countdown for active quiz
  useEffect(() => {
    if (viewMode !== 'active_quiz' || !currentQuiz || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, currentQuiz, secondsRemaining]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSelectOption = (qId: string, optIdx: number, isMulti: boolean) => {
    if (viewMode === 'review') return;
    if (isMulti) {
      const prev = selectedAnswers[qId] || [];
      const updated = prev.includes(optIdx)
        ? prev.filter((i) => i !== optIdx)
        : [...prev, optIdx];
      setSelectedAnswers({ ...selectedAnswers, [qId]: updated });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [qId]: [optIdx] });
    }
  };

  const handleNumericChange = (qId: string, val: number) => {
    if (viewMode === 'review') return;
    setNumericAnswers({ ...numericAnswers, [qId]: val });
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || isSubmitting || viewMode === 'review') return;
    setIsSubmitting(true);

    const questions = currentQuiz.questions;
    const formattedPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOptions: selectedAnswers[q.id] || [],
      numericAnswer: numericAnswers[q.id],
    }));

    const result = await submitCustomQuizAttempt(currentQuiz.id, formattedPayload);
    setIsSubmitting(false);

    if (result.success) {
      triggerCelebration();
      const freshAttempt: CustomQuizAttempt = {
        id: `att-${Date.now()}`,
        quizId: currentQuiz.id,
        userId: user.id,
        studentName: user.name,
        studentId: user.collegeId,
        score: result.score,
        maxScore: result.maxScore,
        xpEarned: result.xpEarned,
        startedAt: new Date(Date.now() - (currentQuiz.timeLimitMins * 60 - secondsRemaining) * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        isEvaluated: true,
        attemptVersion: currentQuiz.version,
        answers: result.answers || [],
      };
      setActiveAttempt(freshAttempt);
      setViewMode('review');
    } else {
      addToast({
        type: 'error',
        title: 'Submission Error',
        message: result.error || 'Failed to submit quiz attempt.',
      });
    }
  };

  // Helper for answer visibility in review mode
  const canShowAnswers =
    currentQuiz?.answerVisibility === 'immediately' ||
    (currentQuiz?.answerVisibility === 'after_close' &&
      new Date() >= new Date(currentQuiz?.closeAt || ''));

  // Helper for formatting attempt date in Asia/Kolkata safely (returns '-' if missing/invalid)
  const formatAttemptDate = (dateStr?: string | null): string => {
    if (!dateStr || !dateStr.trim()) return '-';
    const clean = dateStr.trim();
    if (/^today\s+at\s+/i.test(clean)) {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric'
      }).format(new Date());
    }
    const asNum = Number(clean);
    const parsedDate = !isNaN(asNum) && clean.length >= 10 && !clean.includes('-')
      ? new Date(asNum)
      : new Date(clean);
    if (isNaN(parsedDate.getTime())) return '-';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric'
    }).format(parsedDate);
  };

  // -------------------------------------------------------------
  // RENDER: Loading Skeleton State
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto py-8">
        <div className="h-20 bg-white/10 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-white/10 rounded-3xl" />
          <div className="h-48 bg-white/10 rounded-3xl" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Error State with Retry
  // -------------------------------------------------------------
  if (hasError) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-quest-textPrimary">Unable to Load Sprints</h2>
        <p className="text-xs text-quest-textSecondary mt-2">
          A network or synchronization error occurred while querying the cohort curriculum.
        </p>
        <button
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500);
          }}
          className="mt-6 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Active Quiz Flow (Mode: 'active_quiz')
  // -------------------------------------------------------------
  if (viewMode === 'active_quiz' && currentQuiz) {
    const questions = currentQuiz.questions;
    const currentQ = questions[currentIndex] || questions[0];
    const totalQuestions = questions.length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
        {/* Top Control Bar */}
        <div className="glass-regular p-4 rounded-3xl flex items-center justify-between gap-4">
          <button
            onClick={() => setViewMode('catalog')}
            className="flex items-center gap-1.5 text-xs text-quest-textSecondary hover:text-quest-textPrimary transition-colors px-3 py-1.5 rounded-xl hover:bg-white/60"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quit to Hub</span>
          </button>

          <div className="flex items-center gap-2 text-center">
            <span className="text-xs font-mono font-bold text-sky-800 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
              {currentQuiz.courseTag}
            </span>
            <span className="text-xs text-quest-textPrimary font-bold hidden sm:inline">
              {currentQuiz.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                secondsRemaining < 60
                  ? 'bg-rose-500/20 text-rose-800 border-rose-500/40 animate-pulse'
                  : 'bg-white/60 text-quest-textPrimary border-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-800 border border-amber-500/25 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>+{currentQuiz.questionXp} XP/Q</span>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-1.5 px-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-10 bg-gradient-to-r from-cyan-400 to-purple-400 shadow-sm'
                  : i < currentIndex
                  ? 'w-6 bg-cyan-500/70'
                  : 'w-6 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="glass-prominent p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between text-xs text-quest-textSecondary">
            <span className="font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="font-mono text-amber-800 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
              {currentQ.marks} {currentQ.marks === 1 ? 'Point' : 'Points'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-quest-textPrimary leading-relaxed">
            {currentQ.questionText}
          </h2>

          {currentQ.imageUrl && (
            <img
              src={currentQ.imageUrl}
              alt="Question diagram"
              className="rounded-2xl max-h-56 object-contain border border-slate-200"
            />
          )}

          {/* Options / Numeric inputs */}
          {currentQ.questionType === 'short_numeric' ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-quest-textPrimary block">
                Enter Numeric Solution:
              </label>
              <input
                type="number"
                step="any"
                value={numericAnswers[currentQ.id] ?? ''}
                onChange={(e) => handleNumericChange(currentQ.id, parseFloat(e.target.value) || 0)}
                placeholder="e.g. 15 or 3.14"
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200 text-quest-textPrimary font-mono font-bold text-sm focus:outline-none focus:border-quest-sky"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isMulti = currentQ.questionType === 'multi_mcq';
                const isSelected = (selectedAnswers[currentQ.id] || []).includes(optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optIdx, isMulti)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-quest-sky text-quest-textPrimary shadow-sm ring-1 ring-quest-sky/40 font-bold'
                        : 'bg-white/60 border-slate-200/80 text-quest-textPrimary hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold flex items-center justify-center shrink-0 text-sky-800">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-quest-skyDark shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Question Nav & Submit */}
          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-quest-textPrimary transition-colors"
            >
              Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Evaluating Solution...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Daily Sprint</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Read-Only Review Mode (Mode: 'review')
  // -------------------------------------------------------------
  if (viewMode === 'review' && currentQuiz && activeAttempt) {
    const questions = currentQuiz.questions;
    const currentQ = questions[currentIndex] || questions[0];
    const totalQuestions = questions.length;
    const currentReviewAnswer = activeAttempt.answers.find((a) => a.questionId === currentQ.id);

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
        {/* Review Header Banner */}
        <div className="glass-regular p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-quest-sky">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-sky-800 border border-cyan-500/30 font-mono">
                READ-ONLY REVIEW
              </span>
              <span className="text-xs text-quest-textSecondary font-medium">{currentQuiz.title}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm font-extrabold text-quest-textPrimary">Score:</span>
              <span className="text-sm font-mono px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 font-black">
                {activeAttempt.score} / {activeAttempt.maxScore} pts ({Math.round((activeAttempt.score / Math.max(activeAttempt.maxScore, 1)) * 100)}%)
              </span>
              <span className="text-xs font-mono text-amber-800 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold">
                +{activeAttempt.xpEarned} XP Awarded
              </span>
            </div>
            <p className="text-[11px] text-quest-textSecondary mt-1">
              {canShowAnswers
                ? 'Answer keys and official pedagogical explanations are unlocked below.'
                : 'Answer keys will unlock automatically after the sprint closes.'}
            </p>
          </div>

          <button
            onClick={() => setViewMode('catalog')}
            className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary transition-colors shrink-0 shadow-xs"
          >
            Back to Sprint Hub
          </button>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const ans = activeAttempt.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.isCorrect;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center shrink-0 border ${
                  currentIndex === idx
                    ? 'bg-quest-sky text-white border-quest-sky shadow-sm'
                    : isCorrect
                    ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-800 border-rose-500/30 hover:bg-rose-500/25'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Review Question Card */}
        <div className="glass-prominent p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between text-xs text-quest-textSecondary">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-quest-textSecondary">Awarded:</span>
              <span className={`font-bold ${currentReviewAnswer?.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currentReviewAnswer?.marksAwarded ?? 0} / {currentQ.marks} pts
              </span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-quest-textPrimary leading-relaxed">
            {currentQ.questionText}
          </h2>

          {/* Options Review */}
          {currentQ.questionType === 'short_numeric' ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/60 border border-slate-200">
                <span className="text-xs text-quest-textSecondary block mb-1">Your Submitted Value:</span>
                <span className="text-sm font-mono font-bold text-quest-textPrimary">
                  {currentReviewAnswer?.numericAnswer ?? 'No response submitted'}
                </span>
              </div>
              {canShowAnswers && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <span className="text-xs text-emerald-800 block mb-1 font-semibold">Official Solution:</span>
                  <span className="text-sm font-mono font-bold text-emerald-800">
                    {currentQ.numericAnswer} (&plusmn;{currentQ.tolerance || 0})
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = (currentReviewAnswer?.selectedOptions || []).includes(optIdx);
                const isCorrectKey = currentQ.correctAnswers?.includes(optIdx);

                let optionClass = 'bg-white/60 border-slate-200 text-quest-textPrimary';
                if (canShowAnswers) {
                  if (isCorrectKey) {
                    optionClass = 'bg-emerald-500/15 border-emerald-500/35 text-emerald-900 font-bold';
                  } else if (isSelected && !isCorrectKey) {
                    optionClass = 'bg-rose-500/15 border-rose-500/35 text-rose-900 line-through';
                  }
                } else if (isSelected) {
                  optionClass = 'bg-sky-50 border-quest-sky text-quest-textPrimary font-bold';
                }

                return (
                  <div
                    key={optIdx}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${optionClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white/80 border border-slate-200 text-xs font-bold flex items-center justify-center shrink-0 text-sky-800">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {canShowAnswers && isCorrectKey && (
                      <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct Key</span>
                      </span>
                    )}
                    {canShowAnswers && isSelected && !isCorrectKey && (
                      <span className="text-xs text-rose-800 font-bold flex items-center gap-1 shrink-0">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Your Pick</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation Box */}
          {canShowAnswers && currentQ.explanation && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                <HelpCircle className="w-4 h-4 text-sky-700" />
                <span>Pedagogical Solution Breakdown</span>
              </div>
              <p className="text-xs text-quest-textSecondary leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Default Hub / Catalog (Mode: 'catalog')
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-sky-800 border border-cyan-500/30 font-mono">
              CURRICULUM SPRINTS
            </span>
            <span className="text-xs text-quest-textSecondary font-medium">Cohort Batch: {studentBatch}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-textPrimary mt-1">Daily Quiz Arena</h1>
          <p className="text-xs text-quest-textSecondary mt-0.5 font-medium">
            Daily faculty-curated question sprints targeted to your cohort. Timed evaluations yield capped academic game XP.
          </p>
        </div>

        {/* Daily Cap & Stats Chip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl glass-subtle border border-white/60 text-xs font-mono font-bold text-quest-textPrimary flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Daily Quiz Cap: {xpRules.dailyCaps.quiz} XP</span>
          </div>
        </div>
      </div>

      {/* Segmented Tabs: Available vs Completed */}
      <div className="flex items-center gap-3 border-b border-white/60 pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-quest-textSecondary hover:text-quest-textPrimary hover:bg-white/40'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Active & Upcoming Sprints</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
            {liveQuizzes.length + upcomingQuizzes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-quest-textSecondary hover:text-quest-textPrimary hover:bg-white/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Sprints</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
            {completedQuizzesList.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Available Sprints */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {liveQuizzes.length === 0 && upcomingQuizzes.length === 0 && closedQuizzes.length === 0 ? (
            <div className="max-w-md mx-auto py-16 px-4 text-center glass-subtle rounded-3xl border border-white/60">
              <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white flex items-center justify-center mx-auto mb-4 text-quest-skyDark">
                <BookOpen className="w-7 h-7 text-quest-skyDark" />
              </div>
              <h2 className="text-xl font-bold text-quest-textPrimary">No Quiz Scheduled Today</h2>
              <p className="text-xs text-quest-textSecondary mt-2 leading-relaxed">
                Check back soon! Your faculty instructor will publish the next sprint for cohort {studentBatch}.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200 text-xs font-bold text-quest-textPrimary transition-colors shadow-xs"
                >
                  Return to Dashboard
                </Link>
                <Link
                  to="/coding"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
                >
                  Practice Code Arena
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Quizzes */}
              {liveQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-prominent p-6 rounded-3xl border border-cyan-500/30 shadow-card flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 font-mono">
                          • LIVE SPRINT
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded">
                        +{(quiz.questions.length * quiz.questionXp) + quiz.completionBonusXp} XP Max
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-quest-textPrimary">{quiz.title}</h3>
                    <p className="text-xs text-quest-textSecondary leading-relaxed">
                      {quiz.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-quest-textSecondary">
                      <span className="px-2 py-0.5 rounded bg-white/60 border border-slate-200/60 text-sky-800 font-bold">
                        {quiz.courseTag}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/60 border border-slate-200/60 text-quest-textSecondary font-semibold">
                        {quiz.questions.length} Questions
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/60 border border-slate-200/60 text-quest-textSecondary font-semibold">
                        {quiz.timeLimitMins} Mins Limit
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 font-bold">
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Start Daily Sprint</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Upcoming Quizzes */}
              {upcomingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-subtle p-6 rounded-3xl border border-white/60 flex flex-col justify-between space-y-4 opacity-90"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-800 border border-blue-500/30 font-mono">
                        UPCOMING SPRINT
                      </span>
                      <span className="text-xs font-mono text-quest-textSecondary">
                        Opens {formatAttemptDate(quiz.openAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-quest-textPrimary">{quiz.title}</h3>
                    <p className="text-xs text-quest-textSecondary leading-relaxed">
                      {quiz.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono text-quest-textSecondary">
                      <span className="px-2 py-0.5 rounded bg-white/60 border border-slate-200/60 text-sky-800 font-bold">
                        {quiz.courseTag}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/60 border border-slate-200/60 text-quest-textSecondary">
                        {quiz.timeLimitMins} Mins
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 px-4 rounded-2xl bg-white/40 border border-slate-200/60 text-center text-xs font-mono text-quest-textSecondary flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-quest-textSecondary" />
                    <span>Locked until scheduled testing window</span>
                  </div>
                </div>
              ))}

              {/* Closed Quizzes */}
              {closedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-subtle p-6 rounded-3xl border border-white/60 flex flex-col justify-between space-y-4 opacity-75"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-800 border border-slate-500/30 font-mono">
                      WINDOW CLOSED
                    </span>
                    <h3 className="text-base font-bold text-quest-textPrimary">{quiz.title}</h3>
                    <p className="text-xs text-quest-textSecondary">
                      Testing sprint closed. Faculty evaluation completed.
                    </p>
                  </div>
                  <div className="py-2 rounded-xl text-center text-xs font-mono text-quest-textSecondary">
                    No attempt recorded
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Sprints with Review */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedQuizzesList.length === 0 ? (
            <div className="py-12 text-center glass-subtle rounded-3xl border border-white/60">
              <p className="text-xs text-quest-textSecondary">
                You have not completed any Daily Quizzes yet. Start an active sprint from the catalog!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedQuizzesList.map(({ attempt, quiz }) => {
                const percent = Math.round((attempt.score / Math.max(attempt.maxScore, 1)) * 100);
                return (
                  <div
                    key={attempt.id}
                    className="glass-regular p-5 rounded-3xl border border-white/80 shadow-card flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 font-mono">
                          COMPLETED
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-800 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded">
                          +{attempt.xpEarned} XP
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-quest-textPrimary">
                        {quiz?.title || 'Completed Curriculum Sprint'}
                      </h3>

                      <div className="flex items-center gap-4 mt-3 text-xs text-quest-textSecondary font-mono">
                        <div>
                          <span className="text-quest-textSecondary block text-[10px]">Score</span>
                          <span className="font-bold text-emerald-700">
                            {attempt.score} / {attempt.maxScore} ({percent}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-quest-textSecondary block text-[10px]">Attempt Date</span>
                          <span className="text-quest-textPrimary font-semibold">
                            {formatAttemptDate(attempt.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReviewQuiz(attempt.quizId)}
                      className="w-full py-2.5 rounded-xl bg-white/60 hover:bg-white border border-slate-200/60 text-xs font-bold text-quest-skyDark hover:text-quest-skyDark transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-4 h-4 text-quest-skyDark" />
                      <span>Review Evaluated Answers</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
