import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { CodingProblem } from '../types';
import { runTestCases, ExecutionSummary, SupportedLanguage, DEFAULT_STARTER_CODE } from '../lib/codeRunner';
import {
  Code2,
  Play,
  Send,
  Lightbulb,
  MessagesSquare,
  CheckCircle2,
  XCircle,
  Flame,
  Terminal,
  RotateCcw,
  X,
  FileCode,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Lock,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const CodingPage: React.FC = () => {
  const { codingProblemsList, recordProblemSolved, solvedProblemIds, triggerCelebration } = useApp();

  // Published problems only for students
  const availableProblems = codingProblemsList.filter((p) => p.isPublished !== false);

  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(availableProblems[0] || codingProblemsList[0]);
  
  // C++17 IS FIRST-CLASS DEFAULT
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('cpp');
  const [code, setCode] = useState(selectedProblem?.starterCode?.['cpp'] || DEFAULT_STARTER_CODE.cpp);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  const [isRunning, setIsRunning] = useState(false);
  const [execSummary, setExecSummary] = useState<ExecutionSummary | null>(null);
  const [activeTabCase, setActiveTabCase] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [showCompilerOutput, setShowCompilerOutput] = useState(true);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const isCurrentProblemSolved = solvedProblemIds.includes(selectedProblem?.id);

  // When problem changes, load default code
  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode?.[selectedLanguage] || DEFAULT_STARTER_CODE[selectedLanguage]);
    setExecSummary(null);
    setActiveTabCase(0);
    setSubmitFeedback(null);
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    setCode(selectedProblem?.starterCode?.[lang] || DEFAULT_STARTER_CODE[lang]);
    setExecSummary(null);
    setActiveTabCase(0);
  };

  // Run visible sample test cases only (No XP awarded)
  // Run visible sample test cases only (No XP awarded)
  const handleRunTests = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setSubmitFeedback(null);
    const visibleTests = selectedProblem.testCases.filter((tc) => !tc.isHidden);
    const summary = await runTestCases(
      code,
      selectedLanguage,
      visibleTests,
      'run',
      selectedProblem.id
    );
    setExecSummary(summary);
    setIsRunning(false);

    if (summary.error) {
      setSubmitFeedback(summary.error);
    } else if (summary.compileError) {
      setSubmitFeedback(`Compilation failed: ${summary.compileError.message}`);
    } else if (!summary.allPassed) {
      setSubmitFeedback('Some sample test cases diverged. Check diagnostic below.');
    }
  };

  // Run full evaluation suite including hidden test cases
  const handleSubmitSolution = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setSubmitFeedback(null);

    const summary = await runTestCases(
      code,
      selectedLanguage,
      selectedProblem.testCases,
      'submit',
      selectedProblem.id
    );

    setExecSummary(summary);
    setIsRunning(false);

    if (summary.error) {
      setSubmitFeedback(summary.error);
    } else if (summary.allPassed) {
      const awarded = recordProblemSolved(selectedProblem.id, selectedProblem.xpReward);
      if (awarded) {
        triggerCelebration();
        setSubmitFeedback(`Accepted! All test cases (including hidden validation) verified. +${selectedProblem.xpReward} XP awarded.`);
      } else {
        setSubmitFeedback('Accepted! Solution verified. (XP was already claimed previously for this problem)');
      }
    } else {
      if (summary.compileError) {
        setSubmitFeedback(`Compilation failed: ${summary.compileError.message}`);
      } else {
        setSubmitFeedback('Evaluation failed: Some test cases diverged. Check compiler diagnostic below.');
      }
    }
  };

  const filteredProblems = availableProblems.filter(
    (p) => selectedDifficulty === 'All' || p.difficulty === selectedDifficulty
  );

  const currentResult = execSummary?.results?.[activeTabCase] || execSummary?.results?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-gradient-sky p-0.5 shadow-glowSky flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Code2 className="w-6 h-6 text-quest-skyDark" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-quest-textPrimary tracking-tight">Code Arena</h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-100 text-quest-skyDark border border-sky-200">
                Sandboxed C++17 Compiler
              </span>
            </div>
            <p className="text-xs text-quest-textSecondary mt-0.5">
              Solve curated algorithmic challenges with real sandboxed g++ execution and strict memory/time bounds.
            </p>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex p-1 rounded-2xl glass-subtle border border-white self-start sm:self-auto">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDifficulty === diff
                  ? 'bg-quest-sky text-white shadow-sm'
                  : 'text-quest-textSecondary hover:text-quest-textPrimary'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Selector & Statement (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Problem Selector Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredProblems.map((prob) => {
              const isSelected = selectedProblem?.id === prob.id;
              const isSolved = solvedProblemIds.includes(prob.id);
              return (
                <button
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-quest-sky text-white border-quest-sky shadow-glassSubtle'
                      : 'glass-subtle hover:bg-white text-quest-textPrimary border-white'
                  }`}
                >
                  {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{prob.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      prob.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prob.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Problem Statement Card */}
          {selectedProblem && (
            <div className="glass-regular rounded-3xl p-6 border border-white shadow-glassRegular space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        selectedProblem.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : selectedProblem.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                      +{selectedProblem.xpReward} XP
                    </span>
                    {isCurrentProblemSolved && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Solved
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-quest-textPrimary tracking-tight">
                    {selectedProblem.title}
                  </h2>
                </div>

                <button
                  onClick={() => setShowHint(true)}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                  title="View Problem Editorial / Hint"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
              </div>

              {/* Description Body */}
              <div className="text-xs text-quest-textSecondary leading-relaxed whitespace-pre-wrap font-sans bg-white/70 p-4 rounded-2xl border border-white">
                {selectedProblem.description}
              </div>

              {/* Examples */}
              {selectedProblem.examples && selectedProblem.examples.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-quest-textSecondary font-mono block">
                    SAMPLE TEST CASES
                  </span>
                  <div className="space-y-2">
                    {selectedProblem.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-xs font-mono space-y-1">
                        <div className="text-slate-500">
                          <strong>Input:</strong> <span className="text-quest-textPrimary">{ex.input}</span>
                        </div>
                        <div className="text-slate-500">
                          <strong>Output:</strong> <span className="text-emerald-700 font-bold">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-slate-100">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-quest-textSecondary font-mono block">
                    RUNTIME CONSTRAINTS
                  </span>
                  <ul className="list-disc list-inside text-xs font-mono text-quest-textSecondary space-y-1 pl-1">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                    <li>Time limit: 2000 ms • Memory: 128 MB</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Editor Header Bar */}
          <div className="glass-regular rounded-3xl p-3 border border-white shadow-glassSubtle flex flex-wrap items-center justify-between gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-quest-textPrimary font-mono">LANG:</span>
              <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                {(['cpp', 'python', 'javascript', 'java'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedLanguage === lang
                        ? 'bg-quest-sky text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++17 (g++)' : lang === 'python' ? 'Python 3' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Theme Switcher & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                title="Toggle Editor Light/Dark Theme"
              >
                {editorTheme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setCode(selectedProblem?.starterCode?.[selectedLanguage] || DEFAULT_STARTER_CODE[selectedLanguage])}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                title="Reset Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-glassRegular bg-slate-900">
            <Editor
              height="380px"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : selectedLanguage === 'java' ? 'java' : 'javascript'}
              theme={editorTheme}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Execution Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-quest-textSecondary font-mono">
              <span className="text-emerald-600">● Sandboxed Worker Active</span> (2s CPU • 128MB RAM)
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-quest-textPrimary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-quest-sky" />
                <span>{isRunning ? 'Running in Sandbox...' : 'Run Sample Tests'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-quest-sky hover:brightness-105 active:scale-[0.98] text-white font-bold text-xs shadow-glassSubtle transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Evaluating in Sandbox...' : 'Submit Final (+XP)'}</span>
              </button>
            </div>
          </div>

          {/* Submission Feedback Banner */}
          {submitFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                submitFeedback.includes('Accepted')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {submitFeedback.includes('Accepted') ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{submitFeedback}</span>
            </motion.div>
          )}

          {/* Structured Execution Results & Compiler Panel */}
          {execSummary && (
            <div className="glass-regular rounded-3xl p-5 border border-white shadow-glassSubtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-full ${
                      execSummary.allPassed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : execSummary.status === 'COMPILE_ERROR'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {execSummary.status}
                  </span>
                  <span className="text-xs font-bold text-quest-textPrimary font-mono">
                    {execSummary.passedCases} / {execSummary.totalCases} Tests Passed
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-quest-textSecondary">
                  <span>Runtime: <strong className="text-quest-textPrimary">{execSummary.totalRuntimeMs} ms</strong></span>
                  <span>•</span>
                  <span>Memory: <strong className="text-quest-textPrimary">{execSummary.memoryUsageMb} MB</strong></span>
                </div>
              </div>

              {/* Compilation Error Diagnostic Panel */}
              {execSummary.compileError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Compiler Error {execSummary.compileError.line && `at Line ${execSummary.compileError.line}`}
                    </span>
                    <button
                      onClick={() => setShowCompilerOutput(!showCompilerOutput)}
                      className="text-[10px] font-mono font-bold text-rose-600 hover:underline"
                    >
                      {showCompilerOutput ? 'Hide Stderr' : 'View Full Compiler Stderr'}
                    </button>
                  </div>

                  <p className="text-xs text-rose-800 font-medium">
                    {execSummary.compileError.message}
                  </p>

                  {showCompilerOutput && execSummary.compilerOutput && (
                    <pre className="p-3 rounded-xl bg-slate-950 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                      {execSummary.compilerOutput}
                    </pre>
                  )}
                </div>
              )}

              {/* Test Case Tab Bar */}
              {execSummary.results.length > 0 && !execSummary.compileError && (
                <div className="space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {execSummary.results.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTabCase(i)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 border transition-all ${
                          activeTabCase === i
                            ? 'bg-quest-sky text-white border-quest-sky'
                            : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {r.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span>Case #{r.index}</span>
                        {r.isHidden && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                    ))}
                  </div>

                  {/* Test Case Detail */}
                  {currentResult && (
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-xs space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Input</span>
                        <div className="p-2 rounded-xl bg-slate-50 text-quest-textPrimary">{currentResult.input}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Expected Output</span>
                          <div className="p-2 rounded-xl bg-slate-50 text-emerald-700 font-bold">{currentResult.expectedOutput}</div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Actual Output</span>
                          <div
                            className={`p-2 rounded-xl font-bold ${
                              currentResult.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {currentResult.actualOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editorial Hint Modal */}
      <AnimatePresence>
        {showHint && selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHint(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-prominent rounded-3xl p-6 border border-white shadow-glassProminent space-y-4 z-10"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm text-quest-textPrimary">Problem Editorial</h3>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="text-xs text-quest-textSecondary leading-relaxed space-y-2">
                <p>{selectedProblem.solutionExplanation || 'No detailed editorial published yet.'}</p>
                <div className="p-3 rounded-2xl bg-sky-50 text-quest-skyDark font-mono text-[11px]">
                  Optimal Time Complexity: O(N) • Auxiliary Space: O(N)
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
