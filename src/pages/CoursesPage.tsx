import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CurriculumModule, CurriculumLesson } from '../types';
import { computeModuleStatus } from '../lib/curriculumEngine';
import {
  CheckCircle2,
  Lock,
  Play,
  Zap,
  BookOpen,
  Sparkles,
  ArrowRight,
  X,
  Code2,
  ChevronRight,
  ShieldCheck,
  Check,
  Video,
  Award,
  Compass,
  AlertCircle
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const {
    courses,
    studentModuleProgress,
    completedLessonIds,
    completeCurriculumLesson,
    completeCurriculumModule,
    user
  } = useApp();

  // Filter only published courses for student view
  const publishedCourses = courses.filter((c) => c.status === 'published');

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    return publishedCourses[0]?.id || '';
  });

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isClaimingModule, setIsClaimingModule] = useState(false);

  // Fallback to first available published course if current activeCourseId is invalid
  const activeCourse =
    publishedCourses.find((c) => c.id === activeCourseId) || publishedCourses[0] || null;

  // Student progress mappings
  const userProgress = studentModuleProgress.filter((p) => p.studentId === user.id);
  const completedModuleIds = new Set(
    userProgress.filter((p) => p.status === 'completed').map((p) => p.moduleId)
  );
  const allCompletedLessonIds = new Set([
    ...completedLessonIds,
    ...userProgress.flatMap((p) => p.lessonsCompleted || []),
  ]);

  const rawModules = activeCourse?.modules ? [...activeCourse.modules].sort((a, b) => a.orderIndex - b.orderIndex) : [];

  // Dynamically calculate node statuses based on studentModuleProgress, completedLessonIds and prerequisite DAG
  const computedModules = rawModules.map((moduleItem) => {
    const statusResult = computeModuleStatus(
      moduleItem,
      rawModules,
      completedModuleIds,
      allCompletedLessonIds
    );

    const progressRecord = userProgress.find((p) => p.moduleId === moduleItem.id);

    return {
      ...moduleItem,
      computedStatus: statusResult.status,
      isPrerequisiteSatisfied: statusResult.isPrerequisiteSatisfied,
      completedLessonsCount: statusResult.completedLessonsCount,
      totalLessonsCount: statusResult.totalLessonsCount,
      progressRecord,
    };
  });

  // Determine current active milestone (the first non-completed module, or the last completed if all done)
  const activeMilestoneId =
    computedModules.find((m) => m.computedStatus === 'in_progress')?.id ||
    computedModules.find((m) => m.computedStatus === 'unlocked')?.id ||
    (computedModules.length > 0 && computedModules.every((m) => m.computedStatus === 'completed')
      ? computedModules[computedModules.length - 1]?.id
      : null);

  const selectedModule = computedModules.find((m) => m.id === selectedModuleId) || null;

  const handleLessonAction = async (lesson: CurriculumLesson, moduleItem: CurriculumModule) => {
    if (!activeCourse) return;
    await completeCurriculumLesson(activeCourse.id, moduleItem.id, lesson.id);
  };

  const handleClaimModuleMastery = async (moduleId: string) => {
    if (!activeCourse) return;
    setIsClaimingModule(true);
    try {
      await completeCurriculumModule(activeCourse.id, moduleId);
    } finally {
      setIsClaimingModule(false);
    }
  };

  // Helper to render friendly prerequisite names
  const getPrerequisiteTitles = (prereqIds: string[]): string[] => {
    return prereqIds.map((reqId) => {
      const match = rawModules.find((m) => m.id === reqId);
      return match ? match.title : reqId;
    });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'coding':
        return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'quiz':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1E5E9] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono">
              DATA-DRIVEN SYLLABUS
            </span>
            <span className="text-xs text-[#64748B]">Automated Prerequisite Gating</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#24324B] mt-1">Course Curriculum Map</h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Progress through connected knowledge modules. Advanced graph and DP nodes unlock strictly after prerequisite mastery.
          </p>
        </div>

        {/* Dynamic Course Switcher Chips */}
        {publishedCourses.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#F1E5E9] text-xs shadow-xs flex-wrap">
            {publishedCourses.map((course) => {
              const isActive = activeCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => {
                    setActiveCourseId(course.id);
                    setSelectedModuleId(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-sunset text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#24324B]'
                  }`}
                >
                  {course.title} ({course.code})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State: No Published Courses */}
      {publishedCourses.length === 0 ? (
        <div className="bg-white/80 border border-[#F1E5E9] rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm my-12">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#24324B]">No Published Courses</h3>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Faculty have not published any course curriculum yet. Please check back soon or consult your academic advisor.
          </p>
        </div>
      ) : !activeCourse || rawModules.length === 0 ? (
        <div className="bg-white/80 border border-[#F1E5E9] rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm my-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-[#D97706]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#24324B]">Curriculum in Development</h3>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            The department is currently crafting the syllabus and milestone modules for {activeCourse?.title || 'this course'}. Modules will appear here once published.
          </p>
        </div>
      ) : (
        /* Visual Learning Path Container */
        <div className="relative py-6 px-2 sm:px-4 max-w-4xl mx-auto">
          {/* Background Connecting Spine */}
          <div className="absolute top-12 bottom-12 left-6 md:left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-[#93C5FD] via-[#F472B6] to-[#E2E8F0] rounded-full opacity-60" />

          <div className="space-y-10 relative z-10">
            {computedModules.map((node, index) => {
              const isCompleted = node.computedStatus === 'completed';
              const isInProgress = node.computedStatus === 'in_progress';
              const isUnlocked = node.computedStatus === 'unlocked';
              const isLocked = node.computedStatus === 'locked';
              const isCurrent = node.id === activeMilestoneId && !isCompleted;
              const isLeft = index % 2 === 0;

              const prereqTitles = getPrerequisiteTitles(node.prerequisiteModuleIds || []);

              return (
                <div
                  key={node.id}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 pl-12 md:pl-0 ${
                    isLeft ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Node Milestone Card */}
                  <motion.div
                    whileHover={!isLocked ? { scale: 1.015 } : {}}
                    onClick={() => setSelectedModuleId(node.id)}
                    className={`w-full md:w-[46%] p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-card ${
                      isCurrent || isInProgress
                        ? 'bg-gradient-to-br from-[#FFF5F8] via-white to-[#FCE7F3] border-[#F9A8D4] hover:shadow-cardHover'
                        : isCompleted
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] hover:border-[#60A5FA]'
                        : isUnlocked
                        ? 'bg-white border-blue-200 hover:border-blue-400'
                        : 'bg-white/80 border-[#E2E8F0] opacity-75 hover:opacity-95'
                    }`}
                  >
                    {(isCurrent || isInProgress) && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-sunset text-[9px] font-black uppercase tracking-wider text-white rounded-bl-2xl shadow-xs">
                        ACTIVE MILESTONE
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold tracking-wider">
                        {node.groupLabel}
                      </span>
                      <span className="text-xs font-black text-[#D97706] font-mono bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                        +{node.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#24324B] tracking-tight">{node.title}</h3>
                    <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>

                    {/* Friendly Prerequisites indicator */}
                    {prereqTitles.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#64748B] flex-wrap">
                        <span className="font-bold">Requires:</span>
                        <span className="font-medium text-[11px] bg-slate-100 text-[#334155] px-2 py-0.5 rounded-md border border-slate-200">
                          {prereqTitles.join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 pt-3.5 border-t border-[#F1E5E9] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#64748B] font-medium">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          {node.completedLessonsCount} / {node.totalLessonsCount} Lessons Completed
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold">
                        {isCompleted ? (
                          <span className="text-[#2563EB] flex items-center gap-1 font-extrabold">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Completed
                          </span>
                        ) : isInProgress ? (
                          <span className="text-[#DB2777] flex items-center gap-1 font-extrabold">
                            <Play className="w-3.5 h-3.5 fill-[#EC4899] text-[#EC4899]" /> In Progress
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-blue-600 flex items-center gap-1 font-bold">
                            <Sparkles className="w-3.5 h-3.5" /> Ready to Start
                          </span>
                        ) : (
                          <span className="text-[#94A3B8] flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Prerequisite Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Center Timeline Node Marker */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-[#2563EB] text-white border-[#BFDBFE]'
                          : isCurrent || isInProgress
                          ? 'bg-gradient-sunset text-white border-[#F9A8D4] animate-pulse ring-4 ring-[#FCE7F3]'
                          : isUnlocked
                          ? 'bg-blue-50 text-[#2563EB] border-[#BFDBFE]'
                          : 'bg-white text-[#94A3B8] border-[#CBD5E1]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      ) : isCurrent || isInProgress ? (
                        <Sparkles className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Node Detail & Lesson Explorer Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModuleId(null)}
              className="fixed inset-0 bg-[#24324B]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-[#F1E5E9] p-7 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold">
                      {selectedModule.groupLabel}
                    </span>
                    <span className="text-xs font-black text-[#D97706] font-mono bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                      +{selectedModule.xpReward} XP
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#24324B] mt-1">{selectedModule.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedModuleId(null)}
                  className="text-[#64748B] hover:text-[#24324B] p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed font-normal">
                {selectedModule.description}
              </p>

              {/* Prerequisite Alert if Locked */}
              {selectedModule.computedStatus === 'locked' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">Milestone Prerequisite Gated</p>
                    <p className="text-amber-700 mt-0.5">
                      You must master all preceding modules before unlocking this content:
                    </p>
                    <p className="font-semibold text-amber-900 mt-1">
                      {getPrerequisiteTitles(selectedModule.prerequisiteModuleIds || []).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Concepts */}
              {selectedModule.keyConcepts && selectedModule.keyConcepts.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-2 font-mono">
                    KEY SYLLABUS CONCEPTS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModule.keyConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#24324B]"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block font-mono">
                    LESSONS ({selectedModule.completedLessonsCount} / {selectedModule.totalLessonsCount} Completed)
                  </span>
                  {selectedModule.computedStatus === 'completed' && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" /> MILESTONE MASTERED
                    </span>
                  )}
                </div>

                {selectedModule.lessons && selectedModule.lessons.length > 0 ? (
                  selectedModule.lessons.map((lesson) => {
                    const isDone = allCompletedLessonIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : selectedModule.computedStatus === 'locked'
                            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            : 'bg-[#FFF9F5] border-[#F1E5E9] text-[#24324B]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="mt-0.5 shrink-0">{getLessonIcon(lesson.lessonType || 'reading')}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold">{lesson.title}</p>
                              {lesson.isOptional && (
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                                  Optional
                                </span>
                              )}
                              <span className="text-[10px] text-amber-700 font-semibold font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                                +{lesson.xpValue} XP
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{lesson.summary}</p>
                            {lesson.linkedProblemIds && lesson.linkedProblemIds.length > 0 && (
                              <div className="mt-1 flex items-center gap-2">
                                <Link
                                  to="/arena"
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                >
                                  Practice in Code Arena <ArrowRight className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {isDone ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl shrink-0">
                            <Check className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : selectedModule.computedStatus !== 'locked' ? (
                          <button
                            onClick={() => handleLessonAction(lesson, selectedModule)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-sunset text-white font-bold text-[11px] shadow-xs hover:opacity-95 shrink-0 transition-transform active:scale-95"
                          >
                            Complete (+{lesson.xpValue} XP)
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#64748B] italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No micro-lessons defined for this milestone yet. You can complete the milestone directly once prerequisites are met.
                  </p>
                )}
              </div>

              {/* Milestone Completion / Claim XP Banner */}
              {selectedModule.computedStatus === 'completed' ? (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Milestone Mastered! Full XP Awarded (+{selectedModule.xpReward} XP)</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold uppercase">
                    Mastery Confirmed
                  </span>
                </div>
              ) : selectedModule.computedStatus !== 'locked' ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-pink-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-black text-[#24324B]">Milestone Mastery Reward</p>
                    <p className="text-[11px] text-[#64748B]">
                      Complete all lessons or claim mastery to unlock subsequent graph nodes.
                    </p>
                  </div>
                  <button
                    disabled={isClaimingModule}
                    onClick={() => handleClaimModuleMastery(selectedModule.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-sunset text-white font-black text-xs shadow-md hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isClaimingModule ? 'Claiming...' : `Claim Mastery (+${selectedModule.xpReward} XP)`}
                  </button>
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedModuleId(null)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#24324B] text-xs font-bold transition-colors"
                >
                  Close Roadmap Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
