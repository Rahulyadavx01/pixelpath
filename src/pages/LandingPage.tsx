import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Code2,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#24324B] selection:bg-pink-100 selection:text-pink-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-[#F1E5E9] bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-12 flex items-center justify-between max-w-7xl w-full mx-auto sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-sunset p-0.5 shadow-sm">
            <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#EC4899] fill-[#EC4899]" />
            </div>
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-[#24324B]">
            PIXELPATH
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] text-[#24324B] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Student Login</span>
          </Link>
          <Link
            to="/faculty/login"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] text-[#24324B] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
            <span>Faculty Login</span>
          </Link>
        </div>
      </nav>

      {/* Main Portal Gateway Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-12 max-w-5xl mx-auto w-full relative">
        {/* Soft pastel atmosphere glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F9A8D4]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#93C5FD]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-[#FDBA9A]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F9A8D4] text-[#DB2777] text-xs font-bold mb-4 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Institutional Learning Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#24324B] tracking-tight leading-tight"
          >
            Welcome to <span className="text-gradient">PIXELPATH</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-3 text-sm sm:text-base text-[#64748B] font-medium"
          >
            Select your portal below to access your learning dashboard or faculty console.
          </motion.p>
        </div>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative z-10">
          {/* 1. Student Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#F9A8D4] p-8 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-sunset opacity-10 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-20" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-sunset p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-[#2563EB]" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-mono">
                  STUDENT PORTAL
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#24324B] tracking-tight">
                Student Portal
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2.5 leading-relaxed font-medium">
                Log in to practice in the Code Arena, complete course curriculum modules, participate in cohort leagues, and build your daily learning streak.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <Code2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Real-time Multi-Language Code Arena</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <BookOpen className="w-4 h-4 text-[#EC4899] shrink-0" />
                  <span>Data-driven Course Curriculum Maps</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <Award className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>XP Milestones, Streaks & Leaderboards</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F1E5E9]">
              <Link
                to="/login"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-sunset text-white text-sm font-black shadow-sunset hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-[11px] text-[#94A3B8] mt-2.5 font-mono">
                Sign in using Student ID: <span className="font-semibold text-[#64748B]">Mains-XXXXX</span>
              </p>
            </div>
          </motion.div>

          {/* 2. Faculty Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#DDD6FE] p-8 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 opacity-20 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-40" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <GraduationCap className="w-7 h-7 text-[#7C3AED]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] font-mono">
                  FACULTY CONSOLE
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#24324B] tracking-tight">
                Faculty Portal
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2.5 leading-relaxed font-medium">
                Author and publish syllabus curriculum progression maps, create timed quizzes, manage coding problems, and monitor student academic velocity.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <BookOpen className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Curriculum DAG Editor & Module Publisher</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Quiz Authoring & Pool Randomizer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#24324B] font-semibold">
                  <Code2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Coding Problem & Test Suite Manager</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F1E5E9]">
              <Link
                to="/faculty/login"
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-[#F5F3FF] border-2 border-[#DDD6FE] hover:border-[#7C3AED] text-[#7C3AED] text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                <span>Enter Faculty Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-[11px] text-[#94A3B8] mt-2.5 font-mono">
                Institutional login for educators & staff
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-[#F1E5E9] py-8 px-4 sm:px-6 lg:px-12 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#EC4899] fill-[#EC4899]" />
          <span className="font-extrabold text-[#24324B]">PIXELPATH</span>
          <span>— Gamified Learning & Competitive Portal</span>
        </div>
        <div className="flex items-center gap-5 font-semibold text-xs">
          <Link to="/login" className="text-[#64748B] hover:text-[#EC4899] transition-colors">
            Student Portal
          </Link>
          <Link to="/faculty/login" className="text-[#64748B] hover:text-[#7C3AED] transition-colors">
            Faculty Portal
          </Link>
        </div>
      </footer>
    </div>
  );
};
