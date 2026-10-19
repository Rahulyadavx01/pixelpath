import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CustomQuiz, QuizStatus } from '../../types';
import { QuizStudentPreviewModal } from '../../components/faculty/QuizStudentPreviewModal';
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  Award,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const QuizListPage: React.FC = () => {
  const navigate = useNavigate();
  const { customQuizzes, deleteCustomQuiz, duplicateCustomQuiz } = useApp();

  const [statusFilter, setStatusFilter] = useState<QuizStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewQuiz, setPreviewQuiz] = useState<CustomQuiz | null>(null);

  // Filter quizzes
  const filteredQuizzes = customQuizzes.filter((quiz) => {
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.courseTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalQuizzes = customQuizzes.length;
  const liveCount = customQuizzes.filter((q) => q.status === 'live').length;
  const totalAttempts = customQuizzes.reduce((sum, q) => sum + (q.attemptsCount || 0), 0);
  const avgQuestions = totalQuizzes > 0 ? Math.round(customQuizzes.reduce((s, q) => s + q.questions.length, 0) / totalQuizzes) : 0;

  const getStatusBadge = (status: QuizStatus) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Now
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            <Calendar className="w-3 h-3 text-blue-600" />
            Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
            Closed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-300">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1E5E9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-mono font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>FACULTY QUIZ CONTROLS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#24324B] tracking-tight">
            Curriculum Quizzes & Daily Sprints
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
            Author customizable curriculum quizzes, clamp XP incentives, and inspect cohorts.
          </p>
        </div>

        <Link
          to="/faculty/quizzes/new"
          className="px-5 py-3 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Total Quizzes</span>
            <p className="text-2xl font-black text-[#24324B]">{totalQuizzes}</p>
            <span className="text-[10px] text-[#2563EB] font-bold">In Curriculum</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Live Right Now</span>
            <p className="text-2xl font-black text-[#24324B]">{liveCount}</p>
            <span className="text-[10px] text-emerald-600 font-bold">Open for Attempts</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center text-[#EC4899] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Student Attempts</span>
            <p className="text-2xl font-black text-[#24324B]">{totalAttempts}</p>
            <span className="text-[10px] text-[#EC4899] font-bold">Recorded Submissions</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F1E5E9] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Avg Questions/Quiz</span>
            <p className="text-2xl font-black text-[#24324B]">{avgQuestions}</p>
            <span className="text-[10px] text-amber-700 font-bold">Items per sprint</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-[#F1E5E9] shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'live', 'scheduled', 'draft', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#24324B] text-white shadow-xs font-black'
                  : 'bg-[#FFF9F5] text-[#64748B] hover:text-[#24324B] border border-[#F1E5E9]'
              }`}
            >
              {tab === 'all' ? 'All Quizzes' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-xs font-medium text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Quiz List Cards */}
      {filteredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl border border-[#F1E5E9] shadow-xs hover:border-[#CBD5E1] transition-all p-5 sm:p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section: Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(quiz.status)}
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      {quiz.courseTag}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B]">
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      Target: {quiz.targetBatches.join(', ')}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#24324B]">
                    {quiz.title}
                  </h3>

                  {quiz.description && (
                    <p className="text-xs text-[#64748B] line-clamp-2 max-w-2xl font-normal">
                      {quiz.description}
                    </p>
                  )}

                  {/* Badges / Metrics Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#EC4899]" />
                      <span>{quiz.timeLimitMins} mins</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{quiz.questions.length} questions</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-amber-800 font-bold">
                        +{quiz.questionXp} XP/q &bull; +{quiz.completionBonusXp} Bonus
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#24324B]">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>{quiz.attemptsCount || 0} Attempts</span>
                    </span>
                  </div>
                </div>

                {/* Right Section: Action CTAs */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F1E5E9]">
                  {/* Results CTA */}
                  <Link
                    to={`/faculty/quizzes/${quiz.id}/results`}
                    className="px-3.5 py-2.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-xs font-extrabold hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                    <span>Results</span>
                  </Link>

                  {/* Preview CTA */}
                  <button
                    type="button"
                    onClick={() => setPreviewQuiz(quiz)}
                    className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Student Sandbox Preview"
                  >
                    <Eye className="w-4 h-4 text-[#64748B]" />
                    <span>Preview</span>
                  </button>

                  {/* Edit CTA */}
                  <Link
                    to={`/faculty/quizzes/${quiz.id}/edit`}
                    className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#24324B] text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-4 h-4 text-[#64748B]" />
                    <span>Edit</span>
                  </Link>

                  {/* Duplicate CTA */}
                  <button
                    type="button"
                    onClick={() => duplicateCustomQuiz(quiz.id)}
                    className="p-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#24324B] hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Duplicate Quiz"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Delete CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
                        deleteCustomQuiz(quiz.id);
                      }
                    }}
                    className="p-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#F1E5E9] shadow-xs p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#64748B]">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#24324B]">No Quizzes Found</h3>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            {searchQuery
              ? `No quizzes match your search "${searchQuery}".`
              : 'There are no quizzes matching the selected filter status.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-2xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:bg-slate-50"
              >
                Clear Search
              </button>
            )}
            <Link
              to="/faculty/quizzes/new"
              className="px-4 py-2 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset"
            >
              + Create First Quiz
            </Link>
          </div>
        </div>
      )}

      {/* Student Sandbox Preview Modal */}
      {previewQuiz && (
        <QuizStudentPreviewModal
          quiz={previewQuiz}
          isOpen={Boolean(previewQuiz)}
          onClose={() => setPreviewQuiz(null)}
        />
      )}
    </div>
  );
};
