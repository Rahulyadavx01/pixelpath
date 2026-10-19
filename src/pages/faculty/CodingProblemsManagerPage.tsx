import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CodingProblem } from '../../types';
import { DEFAULT_STARTER_CODE } from '../../lib/codeRunner';
import {
  FileCode,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  HardDrive,
  Sparkles,
  Search,
  History,
  Tag
} from 'lucide-react';

export const CodingProblemsManagerPage: React.FC = () => {
  const { codingProblemsList, createCodingProblem, updateCodingProblem, deleteCodingProblem } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [xpReward, setXpReward] = useState(50);
  const [tags, setTags] = useState('Algorithms, C++17');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('1 <= nums.length <= 10^5\nAll integers in range [-10^9, 10^9]');
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(128);
  const [isPublished, setIsPublished] = useState(true);
  const [editorial, setEditorial] = useState('');
  const [testCases, setTestCases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([
    { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', isHidden: false },
    { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', isHidden: true },
  ]);

  const handleOpenCreate = () => {
    setEditingProblem(null);
    setTitle('');
    setDifficulty('Medium');
    setXpReward(50);
    setTags('Algorithms, C++17');
    setDescription('');
    setConstraints('1 <= nums.length <= 10^5\n-10^9 <= target <= 10^9');
    setTimeLimitMs(2000);
    setMemoryLimitMb(128);
    setIsPublished(true);
    setEditorial('');
    setTestCases([
      { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', isHidden: false },
      { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', isHidden: true },
    ]);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (prob: CodingProblem) => {
    setEditingProblem(prob);
    setTitle(prob.title);
    setDifficulty(prob.difficulty);
    setXpReward(prob.xpReward);
    setTags(prob.tags.join(', '));
    setDescription(prob.description);
    setConstraints(prob.constraints.join('\n'));
    setTimeLimitMs(prob.timeLimitMs || 2000);
    setMemoryLimitMb(prob.memoryLimitMb || 128);
    setIsPublished(prob.isPublished !== false);
    setEditorial(prob.solutionExplanation || '');
    setTestCases(
      prob.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: Boolean(tc.isHidden),
      }))
    );
    setIsEditorOpen(true);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: true }]);
  };

  const handleUpdateTestCase = (index: number, field: string, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Problem title and description are required.');
      return;
    }

    const payload: Partial<CodingProblem> = {
      title,
      difficulty,
      xpReward,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      description,
      constraints: constraints.split('\n').map((c) => c.trim()).filter(Boolean),
      timeLimitMs,
      memoryLimitMb,
      isPublished,
      solutionExplanation: editorial,
      testCases,
      starterCode: {
        cpp: DEFAULT_STARTER_CODE.cpp,
        python: DEFAULT_STARTER_CODE.python,
        javascript: DEFAULT_STARTER_CODE.javascript,
        java: DEFAULT_STARTER_CODE.java,
      },
    };

    if (editingProblem) {
      await updateCodingProblem(editingProblem.id, payload);
    } else {
      await createCodingProblem(payload);
    }

    setIsEditorOpen(false);
  };

  const filteredProblems = codingProblemsList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-quest-textPrimary tracking-tight">Coding Problems Manager</h1>
            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200">
              Faculty Only
            </span>
          </div>
          <p className="text-xs text-quest-textSecondary mt-0.5">
            Author and publish algorithmic challenges for the Code Arena with verified hidden test suites.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-2xl bg-quest-sky hover:brightness-105 text-white font-bold text-xs shadow-glassSubtle flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Coding Problem</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/80 border border-slate-200 text-xs font-medium text-quest-textPrimary outline-none focus:border-quest-sky"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-quest-textSecondary">
          <span>Total: <strong>{codingProblemsList.length}</strong></span>
          <span>•</span>
          <span>Published: <strong>{codingProblemsList.filter((p) => p.isPublished !== false).length}</strong></span>
        </div>
      </div>

      {/* Problems Table / Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredProblems.map((prob) => (
          <div
            key={prob.id}
            className="glass-regular rounded-3xl border border-white p-5 shadow-glassSubtle flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                    prob.difficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : prob.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {prob.difficulty}
                </span>

                <span
                  className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                    prob.isPublished !== false
                      ? 'bg-sky-100 text-quest-skyDark border border-sky-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {prob.isPublished !== false ? 'PUBLISHED' : 'DRAFT'}
                </span>

                <span className="text-[10px] font-mono text-slate-400 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                  v{prob.version || 1}
                </span>

                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  +{prob.xpReward} XP
                </span>
              </div>

              <h3 className="text-base font-black text-quest-textPrimary tracking-tight">
                {prob.title}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {prob.tags.map((t) => (
                  <span key={t} className="text-[10px] text-quest-textSecondary font-mono bg-white/70 px-2 py-0.5 rounded-md border border-slate-100">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-right text-xs font-mono text-quest-textSecondary hidden sm:block">
                <span>{prob.testCases.length} tests ({prob.testCases.filter((t) => t.isHidden).length} hidden)</span>
              </div>

              <button
                onClick={() => handleOpenEdit(prob)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-quest-textPrimary border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-quest-sky" />
                <span>Edit & Version</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete "${prob.title}" permanently?`)) {
                    deleteCodingProblem(prob.id);
                  }
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT PROBLEM MODAL */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-prominent rounded-3xl p-6 sm:p-8 border border-white shadow-glassProminent space-y-6 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-quest-sky" />
                  <h2 className="text-lg font-black text-quest-textPrimary">
                    {editingProblem ? `Edit Problem (v${(editingProblem.version || 1) + 1} Draft)` : 'Author New Problem'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveProblem} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">TITLE</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Subarray Maximum GCD"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs text-quest-textPrimary outline-none focus:border-quest-sky"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">DIFFICULTY</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs text-quest-textPrimary outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">XP REWARD</label>
                    <input
                      type="number"
                      value={xpReward}
                      onChange={(e) => setXpReward(parseInt(e.target.value, 10))}
                      min={10}
                      max={150}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-quest-textPrimary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">TIME LIMIT (MS)</label>
                    <input
                      type="number"
                      value={timeLimitMs}
                      onChange={(e) => setTimeLimitMs(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs text-quest-textPrimary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">STATUS</label>
                    <select
                      value={isPublished ? 'published' : 'draft'}
                      onChange={(e) => setIsPublished(e.target.value === 'published')}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs text-quest-textPrimary outline-none"
                    >
                      <option value="published">Published (Visible)</option>
                      <option value="draft">Draft (Faculty Only)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">TAGS (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Hash Map, Dynamic Programming, C++17"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-quest-textPrimary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">PROBLEM DESCRIPTION (MARKDOWN)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-quest-textPrimary outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">CONSTRAINTS (ONE PER LINE)</label>
                  <textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs text-quest-textPrimary outline-none"
                  />
                </div>

                {/* Test Cases Builder */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-quest-textPrimary font-mono uppercase">
                      TEST CASES & HIDDEN EVALUATION SUITES
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="px-3 py-1 rounded-lg bg-sky-50 text-quest-skyDark font-bold text-xs border border-sky-200 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Test Case
                    </button>
                  </div>

                  <div className="space-y-2">
                    {testCases.map((tc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                            placeholder="Input (e.g. nums = [2,7])"
                            className="w-full p-1.5 rounded-lg border border-slate-200 font-mono text-[11px] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={tc.expectedOutput}
                            onChange={(e) => handleUpdateTestCase(idx, 'expectedOutput', e.target.value)}
                            placeholder="Expected Output (e.g. [0, 1])"
                            className="w-full p-1.5 rounded-lg border border-slate-200 font-mono text-[11px] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-1">
                          <label className="flex items-center gap-1 text-[11px] font-mono cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => handleUpdateTestCase(idx, 'isHidden', e.target.checked)}
                              className="rounded border-slate-300"
                            />
                            <span>Hidden</span>
                          </label>
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editorial */}
                <div>
                  <label className="block text-xs font-bold text-quest-textPrimary mb-1 font-mono">SOLUTION EDITORIAL & EXPLANATION</label>
                  <textarea
                    value={editorial}
                    onChange={(e) => setEditorial(e.target.value)}
                    rows={3}
                    placeholder="Reference mathematical & algorithmic explanation..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-quest-textPrimary outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-quest-textSecondary font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-quest-sky text-white font-bold text-xs shadow-glassSubtle hover:brightness-105"
                  >
                    Save & Version Problem
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
