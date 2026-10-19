import React from 'react';
import {
  CustomQuizQuestion,
  QuestionType
} from '../../types';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  AlertCircle,
  HelpCircle,
  Hash,
  CheckSquare,
  CheckCircle,
  ToggleLeft,
  Image as ImageIcon
} from 'lucide-react';

interface QuestionBuilderProps {
  question: CustomQuizQuestion;
  index: number;
  totalQuestions: number;
  isLocked?: boolean;
  onChange: (updated: CustomQuizQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    type: 'single_mcq',
    label: 'Single Choice MCQ',
    icon: <CheckCircle className="w-3.5 h-3.5 text-[#2563EB]" />,
    desc: 'One correct answer among options',
  },
  {
    type: 'multi_mcq',
    label: 'Multiple Choice MCQ',
    icon: <CheckSquare className="w-3.5 h-3.5 text-[#7C3AED]" />,
    desc: 'One or more correct answers',
  },
  {
    type: 'true_false',
    label: 'True / False',
    icon: <ToggleLeft className="w-3.5 h-3.5 text-[#059669]" />,
    desc: 'Binary statement validation',
  },
  {
    type: 'short_numeric',
    label: 'Short Numeric',
    icon: <Hash className="w-3.5 h-3.5 text-[#D97706]" />,
    desc: 'Exact or bounded numeric answer',
  },
];

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  index,
  totalQuestions,
  isLocked = false,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const handleTypeChange = (newType: QuestionType) => {
    let updatedOptions = [...question.options];
    let updatedCorrect = [...question.correctAnswers];
    let numericAnswer = question.numericAnswer;
    let tolerance = question.tolerance;

    if (newType === 'true_false') {
      updatedOptions = ['True', 'False'];
      updatedCorrect = [0]; // default True
    } else if (newType === 'short_numeric') {
      updatedOptions = [];
      updatedCorrect = [];
      numericAnswer = numericAnswer ?? 0;
      tolerance = tolerance ?? 0;
    } else if (question.questionType === 'short_numeric' || question.questionType === 'true_false') {
      // Switching to MCQ
      updatedOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
      updatedCorrect = [0];
    }

    onChange({
      ...question,
      questionType: newType,
      options: updatedOptions,
      correctAnswers: updatedCorrect,
      numericAnswer,
      tolerance,
    });
  };

  const handleOptionTextChange = (optIndex: number, text: string) => {
    const updated = [...question.options];
    updated[optIndex] = text;
    onChange({ ...question, options: updated });
  };

  const handleAddOption = () => {
    const newOptions = [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`];
    onChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, idx) => idx !== optIndex);
    // Adjust correct answers
    const newCorrect = question.correctAnswers
      .filter((idx) => idx !== optIndex)
      .map((idx) => (idx > optIndex ? idx - 1 : idx));
    onChange({
      ...question,
      options: newOptions,
      correctAnswers: newCorrect.length > 0 ? newCorrect : [0],
    });
  };

  const handleToggleCorrectOption = (optIndex: number) => {
    if (question.questionType === 'single_mcq' || question.questionType === 'true_false') {
      onChange({ ...question, correctAnswers: [optIndex] });
    } else if (question.questionType === 'multi_mcq') {
      const exists = question.correctAnswers.includes(optIndex);
      let updated: number[];
      if (exists) {
        if (question.correctAnswers.length === 1) return; // Keep at least one
        updated = question.correctAnswers.filter((idx) => idx !== optIndex);
      } else {
        updated = [...question.correctAnswers, optIndex].sort((a, b) => a - b);
      }
      onChange({ ...question, correctAnswers: updated });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F1E5E9] shadow-xs p-5 sm:p-7 relative transition-all hover:border-[#CBD5E1]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F1E5E9]">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-gradient-sunset text-white text-xs font-black flex items-center justify-center shadow-xs">
            {index + 1}
          </span>
          <span className="text-xs font-extrabold text-[#24324B]">
            Question #{index + 1}
          </span>
          {isLocked && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Locked (Attempts Recorded)
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Move Up"
            className="p-1.5 rounded-xl border border-[#F1E5E9] text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={onMoveDown}
            title="Move Down"
            className="p-1.5 rounded-xl border border-[#F1E5E9] text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate Question"
            className="p-1.5 rounded-xl border border-[#F1E5E9] text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={totalQuestions <= 1}
            onClick={onDelete}
            title="Delete Question"
            className="p-1.5 rounded-xl border border-[#F1E5E9] text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 1: Question Type Selector Pills & Marks */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-9">
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Question Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUESTION_TYPES.map((t) => {
              const active = question.questionType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleTypeChange(t.type)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    active
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A] font-bold shadow-2xs'
                      : 'border-[#F1E5E9] bg-[#FFF9F5] text-[#64748B] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {t.icon}
                    <span className="text-xs">{t.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Marks / Points
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={10}
              value={question.marks}
              onChange={(e) => onChange({ ...question, marks: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#94A3B8]">
              pts
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Question Prompt */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          Question Prompt <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={2}
          value={question.questionText}
          onChange={(e) => onChange({ ...question, questionText: e.target.value })}
          placeholder="State the problem clearly (e.g., In an AVL tree, what is the maximum height difference between subtrees?)"
          className="w-full p-3.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs text-[#24324B] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#2563EB] transition-colors resize-y"
        />
      </div>

      {/* Row 3: Optional Image Diagram URL */}
      <div className="mb-5">
        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          Diagram / Formula Image URL (Optional)
        </label>
        <div className="relative">
          <ImageIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="url"
            value={question.imageUrl || ''}
            onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/photo-... or diagram URL"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Row 4: Question Type Specific Options & Answer Keys */}
      <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-[#F1E5E9]">
        {/* MCQ or True/False Mode */}
        {(question.questionType === 'single_mcq' ||
          question.questionType === 'multi_mcq' ||
          question.questionType === 'true_false') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-[#24324B]">
                {question.questionType === 'multi_mcq'
                  ? 'Answer Options (Select ALL correct answers)'
                  : 'Answer Options (Select the ONE correct answer)'}
              </span>
              {question.questionType !== 'true_false' && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#24324B] hover:border-[#2563EB] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {question.options.map((option, optIdx) => {
                const isCorrect = question.correctAnswers.includes(optIdx);
                const isTrueFalse = question.questionType === 'true_false';

                return (
                  <div
                    key={optIdx}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50/50 shadow-2xs'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    {/* Correct Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleCorrectOption(optIdx)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border border-slate-300 text-transparent hover:border-emerald-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* Option Label Letter */}
                    <span className="w-5 text-center text-xs font-mono font-bold text-[#64748B]">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>

                    {/* Option Input */}
                    <input
                      type="text"
                      disabled={isTrueFalse}
                      value={option}
                      onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                      placeholder={`Option text ${String.fromCharCode(65 + optIdx)}`}
                      className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isTrueFalse
                          ? 'bg-transparent border-transparent text-[#24324B] font-bold cursor-default'
                          : 'border-slate-200 bg-white text-[#24324B] focus:border-[#2563EB]'
                      }`}
                    />

                    {/* Correct Badge */}
                    {isCorrect && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                        Correct Answer Key
                      </span>
                    )}

                    {/* Remove Option Button */}
                    {!isTrueFalse && question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Short Numeric Mode */}
        {question.questionType === 'short_numeric' && (
          <div className="space-y-3">
            <span className="text-xs font-black text-[#24324B] block">
              Numeric Evaluation Parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Expected Numeric Answer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={question.numericAnswer ?? ''}
                  onChange={(e) => onChange({ ...question, numericAnswer: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 15 or 3.14"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Acceptable Tolerance Delta (&plusmn;)
                </label>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={question.tolerance ?? 0}
                  onChange={(e) => onChange({ ...question, tolerance: Math.max(0, parseFloat(e.target.value) || 0) })}
                  placeholder="0 for exact match, or delta e.g. 0.05"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Accepted range: [{(question.numericAnswer ?? 0) - (question.tolerance ?? 0)}, {(question.numericAnswer ?? 0) + (question.tolerance ?? 0)}]
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 5: Detailed Explanation */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Explanation / Rationale (Shown in Review Mode)
          </label>
        </div>
        <textarea
          rows={2}
          value={question.explanation}
          onChange={(e) => onChange({ ...question, explanation: e.target.value })}
          placeholder="Explain why the answer key is correct and unpack common student misconceptions..."
          className="w-full p-3.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs text-[#24324B] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#2563EB] transition-colors resize-y"
        />
      </div>
    </div>
  );
};
