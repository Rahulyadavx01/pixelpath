import React, { useState } from 'react';
import { CustomQuiz } from '../../types';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';

interface QuizStudentPreviewModalProps {
  quiz: CustomQuiz;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizStudentPreviewModal: React.FC<QuizStudentPreviewModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<{ [qId: string]: number[] }>({});
  const [userNumerics, setUserNumerics] = useState<{ [qId: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentQ = quiz.questions[currentIndex];
  const total = quiz.questions.length;

  const handleSelectOption = (qId: string, optIdx: number, isMulti: boolean) => {
    if (isSubmitted) return;
    if (isMulti) {
      const prev = userSelections[qId] || [];
      const updated = prev.includes(optIdx)
        ? prev.filter((i) => i !== optIdx)
        : [...prev, optIdx];
      setUserSelections({ ...userSelections, [qId]: updated });
    } else {
      setUserSelections({ ...userSelections, [qId]: [optIdx] });
    }
  };

  const handleNumericChange = (qId: string, val: number) => {
    if (isSubmitted) return;
    setUserNumerics({ ...userNumerics, [qId]: val });
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserSelections({});
    setUserNumerics({});
    setIsSubmitted(false);
  };

  // Evaluation in sandbox
  const evaluateResults = () => {
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;

    quiz.questions.forEach((q) => {
      maxScore += q.marks;
      let correct = false;
      if (q.questionType === 'short_numeric') {
        const studentVal = userNumerics[q.id];
        if (studentVal !== undefined && q.numericAnswer !== undefined) {
          correct = Math.abs(studentVal - q.numericAnswer) <= (q.tolerance || 0);
        }
      } else {
        const sel = userSelections[q.id] || [];
        const ans = q.correctAnswers || [];
        correct = sel.length === ans.length && sel.every((v) => ans.includes(v));
      }

      if (correct) {
        score += q.marks;
        correctCount++;
      }
    });

    const xp = (correctCount * quiz.questionXp) + (total > 0 && correctCount === total ? quiz.completionBonusXp : 0);

    return { score, maxScore, correctCount, xp };
  };

  const stats = evaluateResults();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#F1E5E9] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header Sandbox Alert Banner */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sandbox Student Preview — No student records or database XP will be created.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quiz Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F1E5E9]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  {quiz.courseTag}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B]">
                  {quiz.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#24324B] mt-1">{quiz.title}</h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#64748B] bg-[#FFF9F5] px-3 py-1.5 rounded-xl border border-[#F1E5E9]">
              <Clock className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>{quiz.timeLimitMins} mins limit</span>
            </div>
          </div>

          {/* If Submitted: Review Screen */}
          {isSubmitted ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-gradient-sunset text-white text-center shadow-sunset">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                  Simulated Student Outcome
                </span>
                <h4 className="text-3xl font-black mt-1">
                  {stats.score} / {stats.maxScore} pts ({Math.round((stats.score / Math.max(stats.maxScore, 1)) * 100)}%)
                </h4>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-extrabold">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>+{stats.xp} XP Earned</span>
                </div>
              </div>

              {/* Question By Question Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Question Key & Rationale Audit
                </h4>
                {quiz.questions.map((q, idx) => {
                  let isCorrect = false;
                  if (q.questionType === 'short_numeric') {
                    const studentVal = userNumerics[q.id];
                    if (studentVal !== undefined && q.numericAnswer !== undefined) {
                      isCorrect = Math.abs(studentVal - q.numericAnswer) <= (q.tolerance || 0);
                    }
                  } else {
                    const sel = userSelections[q.id] || [];
                    const ans = q.correctAnswers || [];
                    isCorrect = sel.length === ans.length && sel.every((v) => ans.includes(v));
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-left ${
                        isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-[#24324B]">Q{idx + 1}. {q.questionText}</span>
                        <span className={isCorrect ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                          {isCorrect ? `+${q.marks} pts` : '0 pts'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] space-y-1">
                        {q.questionType === 'short_numeric' ? (
                          <p>
                            Submitted: <strong className="font-mono">{userNumerics[q.id] ?? 'None'}</strong> | Answer Key: <strong className="font-mono">{q.numericAnswer}</strong> (&plusmn;{q.tolerance})
                          </p>
                        ) : (
                          <p>
                            Answer Key: <strong className="font-mono">{q.correctAnswers.map((i) => q.options[i]).join(', ')}</strong>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="p-2.5 rounded-xl bg-white border border-[#F1E5E9] text-[#24324B] mt-2">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Question View */
            total > 0 && currentQ ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                  <span>Question {currentIndex + 1} of {total}</span>
                  <span>{currentQ.marks} points</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F1E5E9]">
                  <p className="text-sm font-black text-[#24324B] leading-snug">
                    {currentQ.questionText}
                  </p>
                  {currentQ.imageUrl && (
                    <img
                      src={currentQ.imageUrl}
                      alt="Question diagram"
                      className="mt-3 rounded-xl max-h-48 object-contain border border-[#E2E8F0]"
                    />
                  )}
                </div>

                {/* Question Type Options */}
                {currentQ.questionType === 'short_numeric' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#24324B] block">
                      Enter Numeric Answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={userNumerics[currentQ.id] ?? ''}
                      onChange={(e) => handleNumericChange(currentQ.id, parseFloat(e.target.value) || 0)}
                      placeholder="Type number..."
                      className="w-full px-4 py-3 rounded-2xl border border-[#CBD5E1] text-xs font-mono font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentQ.options.map((option, optIdx) => {
                      const isMulti = currentQ.questionType === 'multi_mcq';
                      const isSelected = (userSelections[currentQ.id] || []).includes(optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx, isMulti)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A] font-bold shadow-2xs'
                              : 'border-[#F1E5E9] bg-white text-[#24324B] hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="flex-1">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No questions added to this quiz yet. Add questions in the builder first.
              </div>
            )
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#F1E5E9]">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl border border-[#CBD5E1] text-xs font-bold text-[#24324B] hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart Preview</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={currentIndex === total - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-3.5 py-2 rounded-xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isSubmitted && total > 0 && (
              <button
                type="button"
                onClick={() => setIsSubmitted(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all"
              >
                Submit Preview Test
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
