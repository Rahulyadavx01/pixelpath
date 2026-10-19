import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Flame,
  Shield,
  Users,
  Award,
  BookOpen,
  Code2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#24324B] selection:bg-pink-100 selection:text-pink-900">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-[#F1E5E9] bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-12 flex items-center justify-between max-w-7xl mx-auto sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-sunset p-0.5 shadow-sm">
            <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#EC4899] fill-[#EC4899]" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-black text-lg sm:text-xl tracking-tight text-[#24324B]">QUESTIFY</span>
            <span className="ml-2 text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-[#FCE7F3] text-[#DB2777] border border-[#F9A8D4] whitespace-nowrap">
              MSOT PROPOSAL
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] text-[#24324B] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Student Login</span>
          </Link>
          <Link
            to="/faculty"
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] text-[#24324B] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Faculty Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Soft pastel atmosphere glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#F9A8D4]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#93C5FD]/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-[#FDBA9A]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F9A8D4] text-[#DB2777] text-xs font-bold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Gamified Learning Challenge: Student Proposal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black text-[#24324B] tracking-tight leading-[1.08]"
          >
            Make Learning <br />
            <span className="text-gradient">Impossible to Ignore.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Turn classes, quizzes, coding practice and collaboration into a rewarding learning journey. Backed by verified action credits and collaborative cohort leagues.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-sunset text-white text-sm font-black shadow-sunset hover:opacity-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Student Login</span>
            </Link>
            <Link
              to="/faculty"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-[#F1E5E9] hover:border-[#F9A8D4] text-[#24324B] text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-card cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
              <span>Faculty Login</span>
            </Link>
          </motion.div>
        </div>

        {/* Floating Product Dashboard Preview HUD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto relative"
        >
          <div className="relative rounded-3xl bg-white/95 border border-[#F1E5E9] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header pill strip */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#F1E5E9] gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-sunset flex items-center justify-center text-white font-black text-sm shadow-xs">
                  L12
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#94A3B8] uppercase tracking-wider">LEVEL 12</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] font-bold">
                      🔥 7 DAY STREAK
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#24324B] tabular-nums">1,840 XP</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/quiz"
                  className="px-4 py-2 rounded-2xl bg-[#FCE7F3] hover:bg-[#FBCFE8] border border-[#F9A8D4] text-[#DB2777] text-xs font-bold transition-colors"
                >
                  Enter Daily Quiz (+60 XP)
                </Link>
              </div>
            </div>

            {/* Split layout: Daily Practice & Leaderboard preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Daily Learning Velocity */}
              <div className="p-5 rounded-3xl bg-[#FFF9F5] border border-[#F1E5E9] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#24324B]">
                    Daily Practice Velocity
                  </span>
                  <span className="text-[11px] text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                    Active Practice
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2 text-[#24324B]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Daily Quiz Sprint</span>
                    </div>
                    <span className="font-mono font-black text-[#D97706]">+60 XP</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#F1E5E9] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2 text-[#24324B]">
                      <Code2 className="w-4 h-4 text-[#60A5FA]" />
                      <span className="font-medium">Coding Arena Problem</span>
                    </div>
                    <span className="font-mono font-black text-[#D97706]">+40 XP</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#F1E5E9] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2 text-[#24324B]">
                      <BookOpen className="w-4 h-4 text-[#F472B6]" />
                      <span className="font-medium">Algorithms Lesson Mastery</span>
                    </div>
                    <span className="font-mono font-black text-[#D97706]">+20 XP</span>
                  </div>
                </div>
              </div>

              {/* Leaderboard snapshot */}
              <div className="p-5 rounded-3xl bg-[#FFF9F5] border border-[#F1E5E9] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#24324B]">
                    Cohort Leaderboard
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono font-bold">Gold League</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-2xl bg-white border border-[#F1E5E9] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-[#D97706]">#4</span>
                      <span className="font-bold text-[#24324B]">Aanya Sharma</span>
                    </div>
                    <span className="text-[#64748B] font-mono font-bold">2,840 XP</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white border border-[#F1E5E9] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-[#64748B]">#5</span>
                      <span className="font-bold text-[#24324B]">Rahul Varma</span>
                    </div>
                    <span className="text-[#64748B] font-mono font-bold">2,710 XP</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white border border-[#F9A8D4] flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-[#DB2777]">#6</span>
                      <span className="font-extrabold text-[#24324B]">Alex Morgan (You)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#D97706] font-mono font-black">1,840 XP</span>
                      <span className="text-[10px] text-emerald-600 font-bold">↑4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Preview CTA Bar */}
            <div className="mt-6 pt-4 border-t border-[#F1E5E9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live cohort simulation with verified anti-gaming integrity
              </span>
              <Link
                to="/dashboard"
                className="text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1 group"
              >
                <span>Interactive Student Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Six Feature Cards Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#F1E5E9]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#DB2777] mb-2 font-mono">
            HABIT BUILDING SYSTEM
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-[#24324B] tracking-tight">
            Everything you need to build a learning habit
          </h3>
          <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
            Engineered using proven behavioral loops, micro-commitments, and collaborative sprint incentives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Daily Quests */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#F9A8D4] transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center text-[#EC4899] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Zap className="w-6 h-6 fill-[#EC4899]" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">Daily Quests</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Bite-sized missions every morning. From a 3-minute quiz to assisting a peer in the study lounge.
            </p>
            <Link to="/quests" className="mt-4 flex items-center text-xs font-bold text-[#DB2777] hover:underline">
              <span>View Quests</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* 2. XP & Levels */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#FDE68A] transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">XP & Levels</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Every XP point corresponds directly to verified learning milestones. Ascend from Level 1 to Level 50+.
            </p>
            <Link to="/dashboard" className="mt-4 flex items-center text-xs font-bold text-[#D97706] hover:underline">
              <span>Explore Progression</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* 3. Learning Streaks */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#FED7AA] transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Flame className="w-6 h-6 fill-[#EA580C]" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">Learning Streaks</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Compound daily consistency. Backed by streak freeze shields so one bad day never wipes your hard work.
            </p>
            <Link to="/dashboard" className="mt-4 flex items-center text-xs font-bold text-[#EA580C] hover:underline">
              <span>Streak Protection</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* 4. Leagues */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#BFDBFE] transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">Weekly Leagues</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Cohorts of 20 students. Bronze through Master tier. Top 5 earn promotion every Sunday night.
            </p>
            <Link to="/leagues" className="mt-4 flex items-center text-xs font-bold text-[#2563EB] hover:underline">
              <span>Inspect Cohorts</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* 5. Team Battles */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-[#DDD6FE] transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">Team Battles</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Weekend coding sprints: Team Nova vs Phoenix. Pool team XP together to unlock department study perks.
            </p>
            <Link to="/battles" className="mt-4 flex items-center text-xs font-bold text-[#7C3AED] hover:underline">
              <span>Join Sprint</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* 6. Achievements */}
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] hover:border-emerald-200 transition-all group shadow-card hover:shadow-cardHover">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-extrabold text-[#24324B]">Achievements</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Rare collectible badges with pastel aesthetic honors. Commemorates comebacks and mastery milestones.
            </p>
            <Link to="/achievements" className="mt-4 flex items-center text-xs font-bold text-emerald-600 hover:underline">
              <span>Badge Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pedagogical Principles Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#F1E5E9]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2 font-mono">
            ACADEMIC INTEGRITY
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-[#24324B] tracking-tight">
            Designed for real learning
          </h3>
          <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
            Built strictly according to MSOT Gamified Learning Challenge requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] shadow-card">
            <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center text-[#DB2777] mb-4 font-black font-mono shadow-xs">
              01
            </div>
            <h4 className="text-base font-extrabold text-[#24324B] uppercase tracking-wider">LEARNING FIRST</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Every XP point maps to a real learning action: lab completion, conceptual quiz mastery, and peer code assistance. No XP for idle clicking or attendance farming.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] shadow-card">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mb-4 font-black font-mono shadow-xs">
              02
            </div>
            <h4 className="text-base font-extrabold text-[#24324B] uppercase tracking-wider">FAIR & INCLUSIVE</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Students who are behind can win through personal improvement leagues and comeback multiplier mechanics. Anonymous mode guarantees zero public shaming.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#F1E5E9] shadow-card">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-4 font-black font-mono shadow-xs">
              03
            </div>
            <h4 className="text-base font-extrabold text-[#24324B] uppercase tracking-wider">SEPARATE FROM GRADES</h4>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Game XP never modifies official academic marks or GPA. Rewards are purely campus life, mentorship, and tech gear vouchers approved by department policy.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F1E5E9] py-12 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#EC4899] fill-[#EC4899]" />
          <span className="font-extrabold text-[#24324B]">QUESTIFY</span>
          <span>— MSOT Gamified Learning Student Proposal</span>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <Link to="/login" className="text-[#64748B] hover:text-[#EC4899] transition-colors">Student Login</Link>
          <Link to="/faculty" className="text-[#64748B] hover:text-[#EC4899] transition-colors">Faculty Login</Link>
        </div>
      </footer>
    </div>
  );
};
