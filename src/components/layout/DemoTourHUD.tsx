import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';

export const DemoTourHUD: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tourSteps = [
    { title: 'Landing Page', path: '/', desc: 'Startup hero preview & core learning principles' },
    { title: 'Student Dashboard', path: '/dashboard', desc: 'Active velocity, daily quiz & league HUD' },
    { title: 'Daily Quiz', path: '/quiz', desc: '5-question sprint with review mode & academic explanations' },
    { title: 'Course Map', path: '/courses', desc: 'Interactive prerequisite unlock tree & progress sync' },
    { title: 'Coding Arena', path: '/coding', desc: 'Sandboxed code evaluator with visible vs hidden test cases' },
    { title: 'Leaderboard', path: '/leaderboard', desc: 'Growth-first rankings & cohort velocity' },
    { title: 'Weekly Leagues', path: '/leagues', desc: 'Dynamic Gold Cohort promotion & Sunday reset countdown' },
    { title: 'Team Battles', path: '/battles', desc: 'Squad formation with code, schedules & live sprint' },
    { title: 'Community Hub', path: '/community', desc: 'Requester-only peer help accept (+25 XP) & discussions' },
    { title: 'Faculty Console', path: '/faculty', desc: 'Roster management, password resets & anti-gaming audit' },
  ];

  const currentStepIndex = tourSteps.findIndex((s) => s.path === location.pathname);
  const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = tourSteps[safeIndex];
  const nextStep = tourSteps[(safeIndex + 1) % tourSteps.length];

  const handleNext = () => {
    navigate(nextStep.path);
  };

  const handleJump = (path: string) => {
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-6 z-40 max-w-sm w-full select-none">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#F9A8D4] text-[#DB2777] hover:text-[#BE185D] shadow-lg backdrop-blur-md text-xs font-bold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Demo Guide ({safeIndex + 1}/{tourSteps.length})</span>
          <Maximize2 className="w-3 h-3 text-[#94A3B8]" />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/95 border border-[#F1E5E9] p-4 shadow-2xl backdrop-blur-xl space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F1E5E9]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#DB2777]">
                Hackathon Demo Tour
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                Step {safeIndex + 1}/{tourSteps.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#24324B] hover:bg-[#FFF5F8]"
                title="Minimize tour"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-[#24324B] hover:bg-[#FFF5F8]"
                title="Dismiss tour"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Step Description */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#24324B]">{currentStep.title}</h4>
              <span className="text-[10px] text-[#D97706] font-mono font-bold bg-[#FEF3C7] px-1.5 py-0.5 rounded-md">
                {currentStep.path}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              {currentStep.desc}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1">
            {tourSteps.map((step, idx) => (
              <button
                key={step.path}
                onClick={() => handleJump(step.path)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === safeIndex
                    ? 'w-5 bg-gradient-sunset shadow-xs'
                    : 'w-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1]'
                }`}
                title={step.title}
              />
            ))}
          </div>

          {/* Next Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#64748B]">
              Next: <strong className="text-[#24324B]">{nextStep.title}</strong>
            </span>
            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-sunset text-white text-[11px] font-bold shadow-sunset/30 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
