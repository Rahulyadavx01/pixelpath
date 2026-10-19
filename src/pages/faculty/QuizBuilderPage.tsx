import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CustomQuiz,
  CustomQuizQuestion,
  QuizStatus,
  AnswerVisibility
} from '../../types';
import { QuestionBuilder } from '../../components/faculty/QuestionBuilder';
import { CsvQuestionImporter } from '../../components/faculty/CsvQuestionImporter';
import { QuizStudentPreviewModal } from '../../components/faculty/QuizStudentPreviewModal';
import { xpRules } from '../../config/xpRules';
import {
  ArrowLeft,
  Save,
  Plus,
  FileSpreadsheet,
  Eye,
  ShieldAlert,
  Sparkles,
  Zap,
  Clock,
  Calendar,
  Lock,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

const BATCH_OPTIONS = ['2024-2028', '2023-2027', '2025-2029', '2022-2026'];

export const QuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    customQuizzes,
    createCustomQuiz,
    updateCustomQuiz,
    rescoreCustomQuiz,
    addToast
  } = useApp();

  const isEditing = Boolean(id);
  const existingQuiz = isEditing ? customQuizzes.find((q) => q.id === id) : null;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseTag, setCourseTag] = useState('CS-201');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [targetBatches, setTargetBatches] = useState<string[]>(['2024-2028']);
  const [openAt, setOpenAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [closeAt, setCloseAt] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
  const [timezone, setTimezone] = useState('UTC');
  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [perQuestionTimeLimitSecs, setPerQuestionTimeLimitSecs] = useState<number | undefined>(undefined);
  const [questionsToServe, setQuestionsToServe] = useState<number | undefined>(undefined);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [answerVisibility, setAnswerVisibility] = useState<AnswerVisibility>('immediately');
  const [questionXp, setQuestionXp] = useState(15);
  const [completionBonusXp, setCompletionBonusXp] = useState(25);
  const [status, setStatus] = useState<QuizStatus>('draft');
  const [questions, setQuestions] = useState<CustomQuizQuestion[]>([]);

  // Modals & UI helpers
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRescoring, setIsRescoring] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

  const attemptsCount = existingQuiz?.attemptsCount || 0;
  const isLocked = attemptsCount > 0;

  // Initialize form if editing
  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
      setDescription(existingQuiz.description);
      setCourseTag(existingQuiz.courseTag);
      setDifficulty(existingQuiz.difficulty);
      setTargetBatches(existingQuiz.targetBatches);
      setOpenAt(new Date(existingQuiz.openAt).toISOString().slice(0, 16));
      setCloseAt(new Date(existingQuiz.closeAt).toISOString().slice(0, 16));
      setTimezone(existingQuiz.timezone);
      setTimeLimitMins(existingQuiz.timeLimitMins);
      setPerQuestionTimeLimitSecs(existingQuiz.perQuestionTimeLimitSecs);
      setQuestionsToServe(existingQuiz.questionsToServe);
      setShuffleQuestions(existingQuiz.shuffleQuestions);
      setShuffleOptions(existingQuiz.shuffleOptions);
      setAnswerVisibility(existingQuiz.answerVisibility);
      setQuestionXp(existingQuiz.questionXp);
      setCompletionBonusXp(existingQuiz.completionBonusXp);
      setStatus(existingQuiz.status);
      setQuestions(existingQuiz.questions);
    } else {
      // Default initial question
      setQuestions([
        {
          id: `q-init-${Date.now()}`,
          questionType: 'single_mcq',
          questionText: 'What is the tightest worst-case time complexity of searching for an element in an AVL tree with N nodes?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correctAnswers: [1],
          explanation: 'Because AVL trees maintain balance factors in {-1, 0, 1}, height is bounded by 1.44 log2(N), guaranteeing O(log N) lookup.',
          marks: 2,
          orderIndex: 0,
        },
      ]);
    }
  }, [existingQuiz]);

  const toggleBatch = (batch: string) => {
    if (targetBatches.includes(batch)) {
      if (targetBatches.length > 1) {
        setTargetBatches(targetBatches.filter((b) => b !== batch));
      }
    } else {
      setTargetBatches([...targetBatches, batch]);
    }
  };

  const handleAddQuestion = () => {
    const newQ: CustomQuizQuestion = {
      id: `q-${Date.now()}-${questions.length}`,
      questionType: 'single_mcq',
      questionText: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswers: [0],
      explanation: '',
      marks: 1,
      orderIndex: questions.length,
    };
    setQuestions([...questions, newQ]);
  };

  const handleQuestionChange = (index: number, updated: CustomQuizQuestion) => {
    const list = [...questions];
    list[index] = updated;
    setQuestions(list);
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const clone: CustomQuizQuestion = {
      ...target,
      id: `q-dup-${Date.now()}-${index}`,
      orderIndex: index + 1,
    };
    const list = [...questions];
    list.splice(index + 1, 0, clone);
    setQuestions(list);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...questions];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    setQuestions(list);
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const list = [...questions];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    setQuestions(list);
  };

  const handleImportCsv = (importedQuestions: CustomQuizQuestion[]) => {
    setQuestions((prev) => [...prev, ...importedQuestions]);
    addToast({
      type: 'success',
      title: 'Import Successful',
      message: `Appended ${importedQuestions.length} questions from CSV.`,
    });
  };

  const handleRescore = async () => {
    if (!id) return;
    setIsRescoring(true);
    await rescoreCustomQuiz(id);
    setIsRescoring(false);
  };

  const handleSaveQuiz = async (desiredStatus?: QuizStatus) => {
    if (!title.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a title for the quiz.',
      });
      return;
    }

    if (questions.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'A quiz must contain at least one question.',
      });
      return;
    }

    // Verify all questions have non-empty prompt
    const emptyPrompt = questions.find((q) => !q.questionText.trim());
    if (emptyPrompt) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'All questions must contain a question prompt.',
      });
      return;
    }

    const payload: Partial<CustomQuiz> = {
      title: title.trim(),
      description: description.trim(),
      courseTag: courseTag.trim() || 'CS-201',
      difficulty,
      targetBatches,
      openAt: new Date(openAt).toISOString(),
      closeAt: new Date(closeAt).toISOString(),
      timezone,
      timeLimitMins: Math.max(1, timeLimitMins),
      perQuestionTimeLimitSecs: perQuestionTimeLimitSecs ? Math.max(10, perQuestionTimeLimitSecs) : undefined,
      questionsToServe: questionsToServe ? Math.min(questionsToServe, questions.length) : undefined,
      shuffleQuestions,
      shuffleOptions,
      answerVisibility,
      questionXp: Math.min(Math.max(questionXp, xpRules.quiz.minPerQuestion), xpRules.quiz.maxPerQuestion),
      completionBonusXp: Math.min(Math.max(completionBonusXp, 0), xpRules.quiz.maxCompletionBonus),
      status: desiredStatus || status,
      questions,
    };

    if (isEditing && id) {
      await updateCustomQuiz(id, payload);
    } else {
      await createCustomQuiz(payload);
    }

    navigate('/faculty/quizzes');
  };

  // Preview Object
  const previewPayload: CustomQuiz = {
    id: id || 'preview-quiz',
    title: title || 'Untitled Quiz Preview',
    description,
    courseTag,
    difficulty,
    targetBatches,
    openAt,
    closeAt,
    timezone,
    timeLimitMins,
    shuffleQuestions,
    shuffleOptions,
    answerVisibility,
    questionXp,
    completionBonusXp,
    status,
    version: existingQuiz?.version || 1,
    createdBy: 'current',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in">
      {/* Top Header */}
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
              <span className="text-xs font-mono font-bold text-[#64748B]">
                {isEditing ? `QUIZ ID: ${id}` : 'NEW QUIZ CREATION'}
              </span>
              {isEditing && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono">
                  v{existingQuiz?.version || 1}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#24324B] tracking-tight">
              {isEditing ? `Edit: ${existingQuiz?.title || 'Quiz'}` : 'Author Daily Quiz Sprint'}
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#64748B]" />
            <span>Sandbox Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuiz('draft')}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveQuiz('live')}
            className="px-5 py-2.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save & Publish' : 'Publish Live Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Post-Attempt Edit Locking Warning Banner */}
      {isLocked && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black">
                Active Student Attempts Recorded ({attemptsCount} Submissions)
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Modifying answer keys will automatically bump the quiz version. An audited re-score is available to update previously recorded student grades and XP balances.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isRescoring}
            onClick={handleRescore}
            className="px-4 py-2 rounded-2xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescoring ? 'animate-spin' : ''}`} />
            <span>{isRescoring ? 'Re-scoring...' : 'Run Audited Re-Score'}</span>
          </button>
        </div>
      )}

      {/* Tab Controls: [ Questions Builder ] [ Schedule, Rules & XP ] */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FFF9F5] border border-[#F1E5E9] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-white text-[#24324B] shadow-2xs font-black border border-[#F1E5E9]'
              : 'text-[#64748B] hover:text-[#24324B]'
          }`}
        >
          <span>Questions ({questions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-white text-[#24324B] shadow-2xs font-black border border-[#F1E5E9]'
              : 'text-[#64748B] hover:text-[#24324B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Timing, XP Caps & Delivery</span>
        </button>
      </div>

      {/* TAB 1: Questions Management */}
      {activeTab === 'questions' && (
        <div className="space-y-5">
          {/* Top Quick Actions Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-[#F1E5E9] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#24324B]">
                Question Stack
              </span>
              <span className="text-[11px] text-[#64748B]">
                ({questions.reduce((sum, q) => sum + q.marks, 0)} total points possible)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(true)}
                className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs font-bold text-[#24324B] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Bulk Import CSV</span>
              </button>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2 rounded-xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Render List of Questions */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuestionBuilder
                key={q.id || idx}
                question={q}
                index={idx}
                totalQuestions={questions.length}
                isLocked={isLocked}
                onChange={(updated) => handleQuestionChange(idx, updated)}
                onDuplicate={() => handleDuplicateQuestion(idx)}
                onDelete={() => handleDeleteQuestion(idx)}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
              />
            ))}
          </div>

          {/* Bottom Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 rounded-3xl border-2 border-dashed border-[#CBD5E1] text-[#64748B] hover:text-[#24324B] hover:border-[#2563EB] hover:bg-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#2563EB]" />
            <span>Add Another Question</span>
          </button>
        </div>
      )}

      {/* TAB 2: Timing, XP Rules & Delivery Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Card 1: Core Details */}
          <div className="p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#24324B] pb-2 border-b border-[#F1E5E9]">
              General Metadata & Batch Targeting
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS201: Daily Algorithm & Data Structure Sprint"
                  className="w-full px-4 py-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Course Tag
                </label>
                <input
                  type="text"
                  value={courseTag}
                  onChange={(e) => setCourseTag(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-201"
                  className="w-full px-4 py-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-mono font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                Description / Context for Students
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief pedagogical summary of topics tested in this sprint..."
                className="w-full p-3.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        difficulty === diff
                          ? 'bg-[#24324B] text-white shadow-xs font-black'
                          : 'bg-[#FFF9F5] border border-[#F1E5E9] text-[#64748B]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Target Student Cohorts (Batches)
                </label>
                <div className="flex flex-wrap gap-2">
                  {BATCH_OPTIONS.map((batch) => {
                    const selected = targetBatches.includes(batch);
                    return (
                      <button
                        key={batch}
                        type="button"
                        onClick={() => toggleBatch(batch)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          selected
                            ? 'bg-[#EFF6FF] border border-[#2563EB] text-[#1E3A8A] shadow-2xs'
                            : 'bg-[#FFF9F5] border border-[#F1E5E9] text-[#64748B]'
                        }`}
                      >
                        {batch}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Scheduling & Time Limits */}
          <div className="p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#24324B] pb-2 border-b border-[#F1E5E9]">
              Schedule Window & Time Limits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Opening Time (Active From)
                </label>
                <input
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Closing Time (Cutoff)
                </label>
                <input
                  type="datetime-local"
                  value={closeAt}
                  onChange={(e) => setCloseAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Total Quiz Time Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimitMins}
                    onChange={(e) => setTimeLimitMins(Math.max(1, parseInt(e.target.value) || 15))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#94A3B8]">
                    minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Per-Question Limit (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Leave empty for untimed questions"
                  value={perQuestionTimeLimitSecs ?? ''}
                  onChange={(e) => setPerQuestionTimeLimitSecs(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Example: 90 seconds forces auto-advance if unanswered.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Question Pool Count (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Serve all questions by default"
                  value={questionsToServe ?? ''}
                  onChange={(e) => setQuestionsToServe(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Randomly serves N questions from the pool to each student.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Anti-Collusion & Delivery */}
          <div className="p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#24324B] pb-2 border-b border-[#F1E5E9]">
              Anti-Collusion & Review Visibility
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#2563EB] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#24324B] block">Shuffle Question Order</span>
                    <span className="text-[10px] text-[#64748B] block">Randomizes sequence to curb peer copying</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#2563EB] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#24324B] block">Shuffle MCQ Option Choices</span>
                    <span className="text-[10px] text-[#64748B] block">Randomizes choice letters for each student</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Answer Key & Explanation Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'immediately', label: 'Immediately After Submission', desc: 'Students instantly see explanations and correct keys' },
                    { val: 'after_close', label: 'After Quiz Closes', desc: 'Protects keys while testing window remains open' },
                    { val: 'never', label: 'Never (Strict Evaluation Only)', desc: 'Only numerical score is released' },
                  ].map((vis) => (
                    <label
                      key={vis.val}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                        answerVisibility === vis.val
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A]'
                          : 'border-[#F1E5E9] bg-[#FFF9F5] text-[#64748B]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answerVisibility"
                        value={vis.val}
                        checked={answerVisibility === vis.val}
                        onChange={() => setAnswerVisibility(vis.val as AnswerVisibility)}
                        className="mt-0.5 text-[#2563EB]"
                      />
                      <div>
                        <span className="text-xs font-bold block">{vis.label}</span>
                        <span className="text-[10px] opacity-80 block">{vis.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Clamped XP Incentive Economy */}
          <div className="p-6 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1E5E9]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-black text-[#24324B]">
                  Clamped XP Incentive Calibration
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                Academic Impact: NONE (MSOT Rule)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  XP Per Correct Question (Cap: {xpRules.quiz.maxPerQuestion} XP)
                </label>
                <input
                  type="number"
                  min={xpRules.quiz.minPerQuestion}
                  max={xpRules.quiz.maxPerQuestion}
                  value={questionXp}
                  onChange={(e) => setQuestionXp(parseInt(e.target.value) || 15)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Hard ceiling prevents hyper-inflation in leaderboard standings.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24324B] mb-1.5">
                  Perfect Score Completion Bonus (Cap: {xpRules.quiz.maxCompletionBonus} XP)
                </label>
                <input
                  type="number"
                  min={0}
                  max={xpRules.quiz.maxCompletionBonus}
                  value={completionBonusXp}
                  onChange={(e) => setCompletionBonusXp(parseInt(e.target.value) || 25)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-bold text-[#24324B] focus:outline-none focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Awarded only if 100% of questions are answered accurately.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Importer Modal */}
      <CsvQuestionImporter
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportCsv}
      />

      {/* Student Sandbox Preview Modal */}
      {isPreviewOpen && (
        <QuizStudentPreviewModal
          quiz={previewPayload}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
