import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Course, CurriculumModule, CurriculumLesson, LessonType } from '../../types';
import {
  detectCycle,
  wouldCreateCycle,
  getDependentModules,
} from '../../lib/curriculumEngine';
import {
  BookOpen,
  Plus,
  Copy,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  Upload,
  Download,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Users,
  Sparkles,
  X,
  FileCode,
  Play,
  AlertCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

export const CurriculumManagerPage: React.FC = () => {
  const {
    user,
    courses,
    codingProblemsList,
    studentModuleProgress,
    createCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    publishCourse,
    archiveCourse,
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    importCourseSyllabus,
    addToast,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-cs201');
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Course Form
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTerm, setCourseTerm] = useState('Fall 2026');

  // Module Form
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [modTitle, setModTitle] = useState('');
  const [modGroupLabel, setModGroupLabel] = useState('Module 1: Foundations');
  const [modDescription, setModDescription] = useState('');
  const [modXpReward, setModXpReward] = useState<number>(100);
  const [modPrereqIds, setModPrereqIds] = useState<string[]>([]);
  const [modKeyConcepts, setModKeyConcepts] = useState<string>('');
  const [modCycleWarning, setModCycleWarning] = useState<string>('');

  // Lesson Form
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('reading');
  const [lessonXpValue, setLessonXpValue] = useState<number>(20);
  const [lessonLinkedProblem, setLessonLinkedProblem] = useState<string>('');
  const [lessonIsOptional, setLessonIsOptional] = useState<boolean>(false);

  // Import JSON text
  const [importJsonText, setImportJsonText] = useState('');

  // Expanded Modules Accordion
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(
    new Set((activeCourse?.modules || []).map((m) => m.id))
  );

  const toggleExpand = (modId: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  // Affected Students Counter
  const getAffectedStudentCount = (moduleId: string) => {
    return studentModuleProgress.filter((p) => p.moduleId === moduleId).length;
  };

  // Course handlers
  const handleOpenNewCourse = () => {
    setCourseCode('');
    setCourseTitle('');
    setCourseTerm('Fall 2026');
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim()) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Course code and title are required.' });
      return;
    }

    const res = await createCourse({
      code: courseCode.trim().toUpperCase(),
      title: courseTitle.trim(),
      term: courseTerm.trim(),
      status: 'draft',
    });

    if (res.success && res.course) {
      setSelectedCourseId(res.course.id);
      setIsCourseModalOpen(false);
    }
  };

  const handleDuplicate = async () => {
    if (!activeCourse) return;
    const res = await duplicateCourse(activeCourse.id);
    if (res.success && res.newCourseId) {
      setSelectedCourseId(res.newCourseId);
    }
  };

  const handleTogglePublish = async () => {
    if (!activeCourse) return;
    if (activeCourse.status === 'published') {
      await updateCourse(activeCourse.id, { status: 'draft' });
      addToast({ type: 'info', title: 'Unpublished', message: 'Course is now in Draft mode.' });
    } else {
      const res = await publishCourse(activeCourse.id);
      if (!res.success && res.error) {
        addToast({ type: 'error', title: 'Cannot Publish', message: res.error });
      } else {
        addToast({ type: 'success', title: 'Published!', message: 'Course is now visible to all enrolled students.' });
      }
    }
  };

  // Module Modal handlers
  const handleOpenAddModule = () => {
    setEditingModuleId(null);
    setModTitle('');
    setModGroupLabel(`Module ${(activeCourse?.modules || []).length + 1}`);
    setModDescription('');
    setModXpReward(100);
    setModPrereqIds([]);
    setModKeyConcepts('');
    setModCycleWarning('');
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (m: CurriculumModule) => {
    setEditingModuleId(m.id);
    setModTitle(m.title);
    setModGroupLabel(m.groupLabel);
    setModDescription(m.description);
    setModXpReward(m.xpReward);
    setModPrereqIds(m.prerequisiteModuleIds || []);
    setModKeyConcepts((m.keyConcepts || []).join(', '));
    setModCycleWarning('');
    setIsModuleModalOpen(true);
  };

  const handleTogglePrerequisite = (candPrereqId: string) => {
    const isAlready = modPrereqIds.includes(candPrereqId);
    const updated = isAlready ? modPrereqIds.filter((id) => id !== candPrereqId) : [...modPrereqIds, candPrereqId];

    // Check if adding this creates a cycle
    const allMods = activeCourse?.modules || [];
    const simulated = allMods.map((m) => {
      if (m.id === (editingModuleId || 'new-mod')) {
        return { ...m, prerequisiteModuleIds: updated };
      }
      return m;
    });

    if (!editingModuleId) {
      simulated.push({
        id: 'new-mod',
        courseId: activeCourse.id,
        orderIndex: allMods.length + 1,
        groupLabel: '',
        title: modTitle,
        description: '',
        xpReward: modXpReward,
        status: 'published',
        prerequisiteModuleIds: updated,
        lessons: [],
      });
    }

    const cycleCheck = detectCycle(simulated);
    if (cycleCheck.hasCycle) {
      setModCycleWarning(`Circular dependency detected: ${cycleCheck.cyclePath?.join(' ➔ ')}. Prerequisite blocked.`);
      return;
    } else {
      setModCycleWarning('');
    }

    setModPrereqIds(updated);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim()) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Module title is required.' });
      return;
    }
    if (modXpReward < 0) {
      addToast({ type: 'error', title: 'Validation Error', message: 'XP Reward must be 0 or greater.' });
      return;
    }

    const concepts = modKeyConcepts
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingModuleId) {
      const res = await updateModule(activeCourse.id, editingModuleId, {
        title: modTitle.trim(),
        groupLabel: modGroupLabel.trim(),
        description: modDescription.trim(),
        xpReward: Number(modXpReward),
        prerequisiteModuleIds: modPrereqIds,
        keyConcepts: concepts,
      });
      if (!res.success && res.error) {
        setModCycleWarning(res.error);
        return;
      }
    } else {
      const res = await addModule(activeCourse.id, {
        title: modTitle.trim(),
        groupLabel: modGroupLabel.trim(),
        description: modDescription.trim(),
        xpReward: Number(modXpReward),
        prerequisiteModuleIds: modPrereqIds,
        keyConcepts: concepts,
      });
      if (!res.success && res.error) {
        setModCycleWarning(res.error);
        return;
      }
    }

    setIsModuleModalOpen(false);
  };

  const handleDeleteModule = async (mod: CurriculumModule) => {
    const dependents = getDependentModules(mod.id, activeCourse?.modules || []);
    if (dependents.length > 0) {
      const depList = dependents.map((d) => `• "${d.title}"`).join('\n');
      alert(`Cannot delete module "${mod.title}" because other modules require it as a prerequisite:\n\n${depList}\n\nPlease update their prerequisites before deleting this module.`);
      return;
    }

    const affected = getAffectedStudentCount(mod.id);
    const confirmMsg = affected > 0
      ? `Warning: ${affected} student(s) have recorded progress on "${mod.title}". Deleting it will permanently remove their milestone progress.\n\nAre you sure you want to delete this module?`
      : `Are you sure you want to delete module "${mod.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    await deleteModule(activeCourse.id, mod.id);
  };

  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    const mods = [...(activeCourse?.modules || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mods.length) return;

    const temp = mods[index];
    mods[index] = mods[targetIndex];
    mods[targetIndex] = temp;

    await reorderModules(activeCourse.id, mods.map((m) => m.id));
  };

  // Lesson Modal handlers
  const handleOpenAddLesson = (moduleId: string) => {
    setActiveModuleForLesson(moduleId);
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonSummary('');
    setLessonType('reading');
    setLessonXpValue(20);
    setLessonLinkedProblem('');
    setLessonIsOptional(false);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (moduleId: string, lesson: CurriculumLesson) => {
    setActiveModuleForLesson(moduleId);
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonSummary(lesson.summary || '');
    setLessonType(lesson.lessonType || 'reading');
    setLessonXpValue(lesson.xpValue);
    setLessonLinkedProblem(lesson.linkedProblemIds?.[0] || '');
    setLessonIsOptional(Boolean(lesson.isOptional));
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Lesson title is required.' });
      return;
    }
    if (!activeModuleForLesson) return;

    const linkedProbs = lessonLinkedProblem.trim() ? [lessonLinkedProblem.trim()] : [];

    if (editingLessonId) {
      await updateLesson(activeCourse.id, activeModuleForLesson, editingLessonId, {
        title: lessonTitle.trim(),
        summary: lessonSummary.trim(),
        lessonType,
        xpValue: Number(lessonXpValue),
        linkedProblemIds: linkedProbs,
        isOptional: lessonIsOptional,
      });
    } else {
      await addLesson(activeCourse.id, activeModuleForLesson, {
        title: lessonTitle.trim(),
        summary: lessonSummary.trim(),
        lessonType,
        xpValue: Number(lessonXpValue),
        linkedProblemIds: linkedProbs,
        isOptional: lessonIsOptional,
      });
    }

    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string, title: string) => {
    if (!window.confirm(`Delete lesson "${title}"?`)) return;
    await deleteLesson(activeCourse.id, moduleId, lessonId);
  };

  const handleMoveLesson = async (moduleId: string, lessonIndex: number, direction: 'up' | 'down') => {
    const mod = activeCourse?.modules?.find((m) => m.id === moduleId);
    if (!mod) return;
    const lessons = [...(mod.lessons || [])];
    const targetIdx = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;

    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[targetIdx];
    lessons[targetIdx] = temp;

    await reorderLessons(activeCourse.id, moduleId, lessons.map((l) => l.id));
  };

  // Export / Import Syllabus
  const handleExportJson = () => {
    if (!activeCourse) return;
    const blob = new Blob([JSON.stringify(activeCourse, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCourse.code}_syllabus_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.code || !parsed.title) {
        alert('Invalid JSON: Course code and title are required.');
        return;
      }
      const res = await importCourseSyllabus(parsed);
      if (res.success) {
        setIsImportModalOpen(false);
        setImportJsonText('');
      } else {
        alert(res.error || 'Failed to import course.');
      }
    } catch (err: any) {
      alert('JSON Parse Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-line gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-[22px] items-center rounded-badge border border-[#D9DDFF] bg-brand-tint px-2 text-[10px] font-bold text-brand-ink font-mono uppercase">
              FACULTY CURRICULUM ARCHITECT
            </span>
            <span className="text-xs text-ink-3">Live Syllabus & Automated Prerequisite Gating</span>
          </div>
          <h1 className="text-h1 text-ink mt-1">Course Curriculum Manager</h1>
          <p className="text-sub mt-0.5">
            Create, restructure, and publish modular course roadmaps. Prerequisite validation blocks circular loops in real time.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="qf-btn qf-btn--secondary !h-9 !px-3.5 !text-xs"
            title="Preview student curriculum view"
          >
            <Eye className="w-3.5 h-3.5 text-brand" />
            <span>Student Preview</span>
          </button>

          <button
            onClick={handleExportJson}
            className="qf-btn qf-btn--secondary !h-9 !px-3.5 !text-xs"
            title="Export course syllabus JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="qf-btn qf-btn--secondary !h-9 !px-3.5 !text-xs"
            title="Import course syllabus JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={handleOpenNewCourse}
            className="qf-btn qf-btn--primary !h-9 !px-3.5 !text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Course Switcher & Status Bar */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <span className="text-label text-ink-3 uppercase font-mono text-[11px] shrink-0">Select Course:</span>
          {courses.map((course) => {
            const isSelected = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-inner text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-surface-2 text-ink-2 hover:bg-line border border-line'
                }`}
              >
                <span>{course.code}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-badge font-mono uppercase ${
                    course.status === 'published'
                      ? 'bg-win-tint text-win-ink border border-[#BDEBD7]'
                      : course.status === 'archived'
                      ? 'bg-surface text-ink-3'
                      : 'bg-streak-tint text-streak-ink border border-[#FBDDA0]'
                  }`}
                >
                  {course.status}
                </span>
              </button>
            );
          })}
        </div>

        {activeCourse && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDuplicate}
              className="qf-btn qf-btn--secondary !h-8 !px-3 !text-xs"
              title="Duplicate full course and prerequisites"
            >
              <Copy className="w-3 h-3 text-ink-3" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-inner text-xs font-bold transition-all shadow-xs ${
                activeCourse.status === 'published'
                  ? 'bg-win text-white hover:bg-win/90'
                  : 'bg-streak-tint text-streak-ink border border-[#FBDDA0] hover:bg-streak-tint/80'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeCourse.status === 'published' ? 'Published' : 'Click to Publish'}</span>
            </button>

            {courses.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete course ${activeCourse.code}: ${activeCourse.title}?`)) {
                    deleteCourse(activeCourse.id);
                  }
                }}
                className="p-2 rounded-inner hover:bg-live-tint text-ink-3 hover:text-live-ink transition-colors"
                title="Delete this course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Course Details Header */}
      {activeCourse ? (
        <div className="rounded-card border border-line bg-surface p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-stat font-mono text-ink">{activeCourse.code}</span>
                <span className="text-xl font-bold text-ink-2">• {activeCourse.title}</span>
              </div>
              <p className="text-label text-ink-3 font-medium">
                Academic Term: <strong className="text-ink">{activeCourse.term}</strong> • {activeCourse.modules?.length || 0} Modules Configured • Total Syllabus XP:{' '}
                <strong className="text-streak-ink">
                  {(activeCourse.modules || []).reduce((sum, m) => sum + m.xpReward, 0)} XP
                </strong>
              </p>
            </div>

            <button
              onClick={handleOpenAddModule}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cta px-4 text-xs font-bold text-white shadow-cta hover:brightness-105 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module Milestone</span>
            </button>
          </div>

          {/* Module Count & Structure Alert */}
          {activeCourse.status === 'draft' && (
            <div className="p-3.5 rounded-inner bg-streak-tint border border-[#FBDDA0] text-streak-ink text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-streak" />
                <span>
                  This course is in <strong>Draft</strong>. Students cannot see these modules until you click "Click to Publish".
                </span>
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="space-y-4 pt-2">
            {(!activeCourse.modules || activeCourse.modules.length === 0) ? (
              <div className="text-center py-12 border border-dashed border-line rounded-inner bg-surface-2 p-6">
                <Layers className="w-10 h-10 text-ink-3 mx-auto mb-2 opacity-50" />
                <h4 className="text-base font-bold text-ink">No modules in this course yet</h4>
                <p className="text-xs text-ink-3 mt-1 max-w-sm mx-auto">
                  Click "Add Module Milestone" to define the first learning unit, XP rewards, and prerequisites.
                </p>
                <button
                  onClick={handleOpenAddModule}
                  className="mt-4 qf-btn qf-btn--primary !h-8 !px-3.5 !text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Module 1</span>
                </button>
              </div>
            ) : (
              activeCourse.modules.map((moduleItem, modIdx) => {
                const isExpanded = expandedModuleIds.has(moduleItem.id);
                const prereqTitles = (moduleItem.prerequisiteModuleIds || []).map((pId) => {
                  const m = activeCourse.modules?.find((mod) => mod.id === pId);
                  return m ? m.title : pId;
                });
                const affectedStudents = getAffectedStudentCount(moduleItem.id);

                return (
                  <div
                    key={moduleItem.id}
                    className="rounded-inner border border-line bg-surface shadow-xs hover:border-brand/40 transition-all overflow-hidden"
                  >
                    {/* Module Card Header */}
                    <div className="p-4 sm:p-5 bg-surface-2/60 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Order & Drag Indicator */}
                        <div className="flex flex-col items-center justify-center gap-0.5 bg-surface border border-line rounded-badge p-1 text-ink-3 shrink-0">
                          <button
                            onClick={() => handleMoveModule(modIdx, 'up')}
                            disabled={modIdx === 0}
                            className="p-1 hover:text-ink disabled:opacity-20"
                            title="Move Module Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold">{modIdx + 1}</span>
                          <button
                            onClick={() => handleMoveModule(modIdx, 'down')}
                            disabled={modIdx === (activeCourse.modules || []).length - 1}
                            className="p-1 hover:text-ink disabled:opacity-20"
                            title="Move Module Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Group */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold font-mono text-ink-3 uppercase tracking-wider">
                              {moduleItem.groupLabel}
                            </span>
                            <span className="inline-flex h-[20px] items-center rounded-badge border border-[#FBDDA0] bg-streak-tint px-2 text-[10px] font-bold text-streak-ink font-mono">
                              +{moduleItem.xpReward} XP Milestone
                            </span>
                            {affectedStudents > 0 && (
                              <span className="inline-flex h-[20px] items-center gap-1 rounded-badge border border-line bg-surface px-2 text-[10px] font-mono text-ink-3">
                                <Users className="w-3 h-3 text-brand" />
                                {affectedStudents} active student(s)
                              </span>
                            )}
                          </div>
                          <h3 className="text-title text-ink tracking-tight truncate">{moduleItem.title}</h3>
                          <p className="text-label text-ink-2 mt-0.5 line-clamp-1">{moduleItem.description}</p>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                        <button
                          onClick={() => handleOpenAddLesson(moduleItem.id)}
                          className="qf-btn qf-btn--secondary !h-8 !px-2.5 !text-xs"
                          title="Add lesson into this module"
                        >
                          <Plus className="w-3.5 h-3.5 text-brand" />
                          <span>Add Lesson</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModule(moduleItem)}
                          className="p-1.5 rounded-inner hover:bg-surface border border-line text-ink-3 hover:text-ink transition-colors"
                          title="Edit Module & Prerequisites"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteModule(moduleItem)}
                          className="p-1.5 rounded-inner hover:bg-live-tint text-ink-3 hover:text-live-ink transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleExpand(moduleItem.id)}
                          className="qf-btn qf-btn--secondary !h-8 !px-2.5 !text-xs ml-1"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                          <span className="text-[10px] font-mono font-bold text-ink-3">({moduleItem.lessons?.length || 0})</span>
                        </button>
                      </div>
                    </div>

                    {/* Prerequisites Pill Bar */}
                    <div className="px-5 py-2.5 bg-surface border-b border-line flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-ink-3 font-semibold text-[11px] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-ink-3" /> Prerequisites:
                        </span>
                        {prereqTitles.length === 0 ? (
                          <span className="text-win-ink text-[11px] font-semibold bg-win-tint px-2 py-0.5 rounded-badge border border-[#BDEBD7]">
                            None (Unlocked by default)
                          </span>
                        ) : (
                          prereqTitles.map((pTitle, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[11px] font-medium bg-surface-2 text-ink border border-line px-2 py-0.5 rounded-badge"
                            >
                              Requires: {pTitle}
                            </span>
                          ))
                        )}
                      </div>

                      {moduleItem.keyConcepts && moduleItem.keyConcepts.length > 0 && (
                        <div className="flex items-center gap-1 overflow-hidden">
                          {moduleItem.keyConcepts.slice(0, 3).map((concept, cIdx) => (
                            <span key={cIdx} className="text-[10px] font-mono text-ink-3 bg-surface-2 px-1.5 py-0.5 rounded">
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lessons Nested List */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-2 bg-surface">
                        <div className="flex items-center justify-between text-xs text-ink-3 font-semibold mb-2">
                          <span className="uppercase font-mono text-[10px]">
                            Lessons ({moduleItem.lessons?.length || 0})
                          </span>
                          <span className="text-[11px]">
                            {(moduleItem.lessons || []).reduce((acc, l) => acc + l.xpValue, 0)} XP in micro-lessons
                          </span>
                        </div>

                        {(!moduleItem.lessons || moduleItem.lessons.length === 0) ? (
                          <div className="text-center py-6 text-xs text-ink-3 italic bg-surface-2 rounded-inner border border-line">
                            No micro-lessons in this milestone yet. Click "Add Lesson" above to attach learning tasks.
                          </div>
                        ) : (
                          moduleItem.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="p-3 rounded-inner bg-surface-2/70 border border-line flex items-center justify-between gap-3 text-xs hover:bg-surface transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono text-[10px] font-bold text-ink-3 w-5 text-center">
                                  {lIdx + 1}.
                                </span>

                                <div className="w-7 h-7 rounded-inner bg-surface border border-line flex items-center justify-center text-brand shrink-0">
                                  {lesson.lessonType === 'coding' ? (
                                    <FileCode className="w-3.5 h-3.5" />
                                  ) : (
                                    <BookOpen className="w-3.5 h-3.5" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-ink truncate">{lesson.title}</p>
                                    <span className="text-[9px] font-mono uppercase bg-surface border border-line px-1.5 py-0.2 rounded text-ink-3">
                                      {lesson.lessonType}
                                    </span>
                                    {lesson.isOptional && (
                                      <span className="text-[9px] font-mono text-ink-3 bg-surface border border-line px-1.5 py-0.2 rounded">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  {lesson.summary && (
                                    <p className="text-[11px] text-ink-3 truncate mt-0.5">{lesson.summary}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-bold text-streak-ink text-xs">
                                  +{lesson.xpValue} XP
                                </span>

                                <button
                                  onClick={() => handleMoveLesson(moduleItem.id, lIdx, 'up')}
                                  disabled={lIdx === 0}
                                  className="p-1 hover:text-ink text-ink-3 disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveLesson(moduleItem.id, lIdx, 'down')}
                                  disabled={lIdx === (moduleItem.lessons || []).length - 1}
                                  className="p-1 hover:text-ink text-ink-3 disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() => handleOpenEditLesson(moduleItem.id, lesson)}
                                  className="p-1 hover:text-brand text-ink-3"
                                  title="Edit Lesson"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(moduleItem.id, lesson.id, lesson.title)}
                                  className="p-1 hover:text-live-ink text-ink-3"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-ink-3">No courses exist. Click "New Course" to create one.</div>
      )}

      {/* Modal 1: Create Course */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCourseModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-card bg-surface border border-line p-6 shadow-lift z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-title text-ink">Create New Academic Course</h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="text-ink-3 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                <div>
                  <label className="text-label text-ink-2 block mb-1">Course Code (e.g. CS201, CS301)</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="CS301"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink font-mono focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label text-ink-2 block mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Database Management Systems"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label text-ink-2 block mb-1">Term / Semester</label>
                  <input
                    type="text"
                    value={courseTerm}
                    onChange={(e) => setCourseTerm(e.target.value)}
                    placeholder="Fall 2026"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="qf-btn qf-btn--secondary !h-9 !px-4 !text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="qf-btn qf-btn--primary !h-9 !px-4 !text-xs">
                    Create Course (Draft)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Add/Edit Module Milestone */}
      <AnimatePresence>
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModuleModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-card bg-surface border border-line p-6 shadow-lift z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-title text-ink">
                  {editingModuleId ? 'Edit Module Milestone' : 'Add Module Milestone'}
                </h3>
                <button onClick={() => setIsModuleModalOpen(false)} className="text-ink-3 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modCycleWarning && (
                <div className="p-3 rounded-inner bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{modCycleWarning}</span>
                </div>
              )}

              <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-ink-2 block mb-1">Group Label</label>
                    <input
                      type="text"
                      value={modGroupLabel}
                      onChange={(e) => setModGroupLabel(e.target.value)}
                      placeholder="Module 1: Foundations"
                      className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-label text-ink-2 block mb-1">XP Milestone Reward (≥ 0)</label>
                    <input
                      type="number"
                      min={0}
                      value={modXpReward}
                      onChange={(e) => setModXpReward(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink font-mono font-bold focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-label text-ink-2 block mb-1">Module Title *</label>
                  <input
                    type="text"
                    required
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="e.g. Linear Memory & Dynamic Arrays"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label text-ink-2 block mb-1">Description & Learning Outcomes</label>
                  <textarea
                    rows={2}
                    value={modDescription}
                    onChange={(e) => setModDescription(e.target.value)}
                    placeholder="Summary of memory layouts, traversal, and complexity..."
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Prerequisites Multi-Select Selection */}
                <div>
                  <label className="text-label text-ink-2 block mb-1">
                    Prerequisite Modules (Multi-Select)
                  </label>
                  <p className="text-[11px] text-ink-3 mb-2">
                    Students must complete all selected modules before this node unlocks. Graph cycle detection blocks loops.
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-surface-2 rounded-inner border border-line">
                    {(activeCourse?.modules || []).filter((m) => m.id !== editingModuleId).length === 0 ? (
                      <span className="text-ink-3 text-[11px] italic">No other modules in course to depend on.</span>
                    ) : (
                      (activeCourse?.modules || [])
                        .filter((m) => m.id !== editingModuleId)
                        .map((candidate) => {
                          const isChecked = modPrereqIds.includes(candidate.id);
                          return (
                            <label
                              key={candidate.id}
                              className={`flex items-center justify-between p-2 rounded-inner border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-brand-tint border-[#D9DDFF] text-brand-ink font-bold'
                                  : 'bg-surface border-line text-ink hover:bg-surface-2'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePrerequisite(candidate.id)}
                                  className="rounded text-brand focus:ring-brand"
                                />
                                <span className="text-xs">{candidate.title}</span>
                              </div>
                              <span className="text-[10px] font-mono text-ink-3">({candidate.groupLabel})</span>
                            </label>
                          );
                        })
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-label text-ink-2 block mb-1">Key Concepts (Comma-separated)</label>
                  <input
                    type="text"
                    value={modKeyConcepts}
                    onChange={(e) => setModKeyConcepts(e.target.value)}
                    placeholder="Spatial Locality, Amortized O(1), Sliding Window"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(false)}
                    className="qf-btn qf-btn--secondary !h-9 !px-4 !text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="qf-btn qf-btn--primary !h-9 !px-4 !text-xs">
                    {editingModuleId ? 'Save Changes' : 'Add Module'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Add/Edit Lesson */}
      <AnimatePresence>
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLessonModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-card bg-surface border border-line p-6 shadow-lift z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-title text-ink">
                  {editingLessonId ? 'Edit Lesson' : 'Add Lesson to Module'}
                </h3>
                <button onClick={() => setIsLessonModalOpen(false)} className="text-ink-3 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
                <div>
                  <label className="text-label text-ink-2 block mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Contiguous Memory Allocation"
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-ink-2 block mb-1">Lesson Type</label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value as LessonType)}
                      className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                    >
                      <option value="reading">Reading & Conceptual</option>
                      <option value="coding">Code Arena Problem</option>
                      <option value="video">Lecture Video</option>
                      <option value="quiz">Micro-Quiz</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-label text-ink-2 block mb-1">XP Value</label>
                    <input
                      type="number"
                      min={0}
                      value={lessonXpValue}
                      onChange={(e) => setLessonXpValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink font-mono font-bold focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                {lessonType === 'coding' && (
                  <div>
                    <label className="text-label text-ink-2 block mb-1">Link Code Arena Problem</label>
                    <select
                      value={lessonLinkedProblem}
                      onChange={(e) => setLessonLinkedProblem(e.target.value)}
                      className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                    >
                      <option value="">-- None / Custom Problem --</option>
                      {codingProblemsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.difficulty}) - +{p.xpReward} XP
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-label text-ink-2 block mb-1">Lesson Summary</label>
                  <textarea
                    rows={2}
                    value={lessonSummary}
                    onChange={(e) => setLessonSummary(e.target.value)}
                    placeholder="Short summary of pointer arithmetic and cache hit rates..."
                    className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isOptionalLesson"
                    checked={lessonIsOptional}
                    onChange={(e) => setLessonIsOptional(e.target.checked)}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <label htmlFor="isOptionalLesson" className="text-label text-ink-2 cursor-pointer">
                    Optional Enrichment Lesson (Does not block module completion)
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="qf-btn qf-btn--secondary !h-9 !px-4 !text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="qf-btn qf-btn--primary !h-9 !px-4 !text-xs">
                    {editingLessonId ? 'Save Lesson' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Live Student Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-card bg-canvas bg-page-mesh border border-line p-6 shadow-lift z-10 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line bg-surface p-4 rounded-inner">
                <div>
                  <span className="text-[10px] font-bold uppercase font-mono text-brand">STUDENT EXPERIENCE PREVIEW</span>
                  <h3 className="text-title text-ink">{activeCourse.code}: {activeCourse.title}</h3>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="qf-btn qf-btn--secondary !h-8 !px-3 !text-xs">
                  Close Preview
                </button>
              </div>

              {/* Student Timeline Preview Rendering */}
              <div className="relative py-4 max-w-xl mx-auto space-y-6">
                <div className="absolute top-6 bottom-6 left-6 -translate-x-1/2 w-1 bg-gradient-to-b from-brand via-streak to-line rounded-full opacity-60" />

                {(activeCourse.modules || []).map((m, idx) => {
                  const reqs = (m.prerequisiteModuleIds || []).map((pId) => {
                    const found = activeCourse.modules?.find((mod) => mod.id === pId);
                    return found ? found.title : pId;
                  });

                  return (
                    <div key={m.id} className="relative pl-12">
                      <div className="absolute left-6 -translate-x-1/2 top-4 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {idx + 1}
                      </div>

                      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[10px] font-bold font-mono text-ink-3 uppercase">{m.groupLabel}</span>
                          <span className="text-streak-ink font-bold font-mono">+{m.xpReward} XP</span>
                        </div>
                        <h4 className="text-base font-bold text-ink">{m.title}</h4>
                        <p className="text-xs text-ink-2 mt-1">{m.description}</p>

                        {reqs.length > 0 && (
                          <div className="mt-2 text-[11px] text-ink-3 font-medium">
                            <span className="font-bold">Requires:</span> {reqs.join(', ')}
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-line text-[11px] text-ink-3 flex items-center justify-between">
                          <span>{m.lessons?.length || 0} Lessons</span>
                          <span className="text-brand font-semibold">Available in Portal</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Import Syllabus JSON Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-card bg-surface border border-line p-6 shadow-lift z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-title text-ink">Import Course Syllabus JSON</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-ink-3 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleImportJson} className="space-y-4 text-xs">
                <p className="text-ink-2 text-xs">
                  Paste the JSON representation of the course syllabus below. Circular prerequisite validation will be evaluated before importing.
                </p>

                <textarea
                  rows={10}
                  required
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`{\n  "code": "CS301",\n  "title": "Database Systems",\n  "term": "Fall 2026",\n  "status": "published",\n  "modules": []\n}`}
                  className="w-full px-3 py-2 rounded-inner bg-surface-2 border border-line text-ink font-mono text-xs focus:border-brand focus:outline-none"
                />

                <div className="pt-2 flex justify-end gap-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="qf-btn qf-btn--secondary !h-9 !px-4 !text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="qf-btn qf-btn--primary !h-9 !px-4 !text-xs">
                    Validate & Import Syllabus
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
