import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RosterStudent, XpTransaction } from '../types';
import { xpRules } from '../config/xpRules';
import { Link, useLocation } from 'react-router-dom';
import { validateStudentId, STUDENT_ID_ERROR_MESSAGE } from '../lib/studentIdValidator';
import {
  Users,
  CheckCircle2,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Upload,
  Sparkles,
  Ban,
  Check,
  X,
  Sliders,
  Search,
  KeyRound,
  FileSpreadsheet,
  Bell,
  Trash2,
  Send,
  Eye,
  History,
  AlertCircle,
  BookOpen,
  Calendar,
  Award,
  FileText,
  GraduationCap,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export type FacultyTabType = 'overview' | 'roster' | 'points-economy' | 'announcements' | 'anti-gaming';

export const FacultyPage: React.FC<{ initialTab?: FacultyTabType }> = ({ initialTab }) => {
  const {
    facultyData,
    roster,
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    dismissIncident,
    confirmIncident,
    reverseIncidentXp,
    adminResetPassword,
    xpTransactions,
    attendanceRecords,
    assignments,
    assignmentSubmissions,
    testResults,
    clubSessions,
    clubAttendance,
    importAttendance,
    createAssignment,
    submitAssignment,
    importTestResults,
    createClubSession,
    markClubAttendance,
    voidXp,
    addRosterStudent,
    importRosterCsv,
  } = useApp();

  const location = useLocation();
  const resolveTab = (): FacultyTabType => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/students')) return 'roster';
    if (location.pathname.includes('/economy') || location.pathname.includes('/points')) return 'points-economy';
    if (location.pathname.includes('/integrity') || location.pathname.includes('/audit')) return 'anti-gaming';
    if (location.pathname.includes('/announcements')) return 'announcements';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<FacultyTabType>(resolveTab);

  React.useEffect(() => {
    setActiveTab(resolveTab());
  }, [location.pathname, initialTab]);

  // Roster Filter & Search state
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'all' | 'activated' | 'pending'>('all');
  const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetStudent, setResetTargetStudent] = useState<RosterStudent | null>(null);
  const [tempPassword, setTempPassword] = useState('MSOT-2026-Reset!');
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvText, setCsvText] = useState('Mains-24819, Aryan Mehta, aryan.mehta@msot.edu, Computer Science & Engineering, 2024-2028\nMains-24820, Ananya Roy, ananya.roy@msot.edu, Computer Science & Engineering, 2024-2028');
  const [csvErrorList, setCsvErrorList] = useState<{ row: number; reason: string }[]>([]);
  const [importTab, setImportTab] = useState<'csv' | 'single'>('csv');
  const [singleId, setSingleId] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleDept, setSingleDept] = useState('Computer Science & Engineering');
  const [singleBatch, setSingleBatch] = useState('2024-2028');
  const [singleError, setSingleError] = useState('');
  const [isIngestingRoster, setIsIngestingRoster] = useState(false);

  // Announcement state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'normal' | 'urgent'>('normal');
  const [newAnnCourseTag, setNewAnnCourseTag] = useState('All CSE Cohorts');

  // Reverse XP modal state
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseTargetFlagId, setReverseTargetFlagId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState('Automated script or impossible completion velocity detected.');

  // Config modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dailyQuizCap, setDailyQuizCap] = useState(60);
  const [plagiarismThreshold, setPlagiarismThreshold] = useState(85);

  // Points Economy Sub-Tab and Form State
  const [economySubTab, setEconomySubTab] = useState<'attendance' | 'assignments' | 'tests' | 'clubs' | 'rules' | 'ledger'>('attendance');

  // Attendance import form state
  const [attSessionId, setAttSessionId] = useState(`sess-${new Date().toISOString().split('T')[0]}-01`);
  const [attCourseCode, setAttCourseCode] = useState('CS204');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attRawCsv, setAttRawCsv] = useState('24CS01,present\n24CS02,present\n24CS03,absent\n24CS04,present');
  const [attImportResult, setAttImportResult] = useState<{ importedCount: number; errors: { row: number; reason: string }[] } | null>(null);
  const [isImportingAtt, setIsImportingAtt] = useState(false);

  // Assignment creation state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgCourseCode, setAsgCourseCode] = useState('CS204');
  const [asgDueAt, setAsgDueAt] = useState(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16));
  const [asgBatches, setAsgBatches] = useState('2024-2028');
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // Test marks import state
  const [testId, setTestId] = useState(`test-${new Date().toISOString().split('T')[0]}-01`);
  const [testName, setTestName] = useState('Bi-weekly Algorithms Evaluation #3');
  const [testRawCsv, setTestRawCsv] = useState('24CS01,88\n24CS02,94\n24CS03,72\n24CS04,60');
  const [testImportResult, setTestImportResult] = useState<{ importedCount: number; errors: { row: number; reason: string }[] } | null>(null);
  const [isImportingTest, setIsImportingTest] = useState(false);

  // Club session state
  const [clubName, setClubName] = useState('Google Developer Student Club (GDSC)');
  const [clubSessionTitle, setClubSessionTitle] = useState('Competitive Programming Workshop');
  const [clubDate, setClubDate] = useState(new Date().toISOString().split('T')[0]);
  const [clubStudentIds, setClubStudentIds] = useState('24CS01, 24CS02, 24CS04');
  const [isCreatingClub, setIsCreatingClub] = useState(false);

  // Void XP modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTargetTx, setVoidTargetTx] = useState<XpTransaction | null>(null);
  const [voidReasonText, setVoidReasonText] = useState('');
  const [voidIsSubmitting, setVoidIsSubmitting] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState('');

  // Handle Attendance Import
  const handleImportAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImportingAtt(true);
    setAttImportResult(null);
    try {
      const lines = attRawCsv.split('\n').map((l) => l.trim()).filter(Boolean);
      const records = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        const sid = parts[0] || '';
        const rawStatus = (parts[1] || 'present').toLowerCase();
        const status = rawStatus === 'absent' ? 'absent' : rawStatus === 'excused' ? 'excused' : 'present';
        return {
          classSessionId: attSessionId.trim(),
          studentId: sid,
          courseCode: attCourseCode.trim(),
          sessionDate: attDate,
          status: status as 'present' | 'absent' | 'excused',
        };
      });
      const res = await importAttendance(records);
      setAttImportResult(res);
    } finally {
      setIsImportingAtt(false);
    }
  };

  // Handle Assignment Creation
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;
    setIsCreatingAsg(true);
    try {
      const batches = asgBatches.split(',').map((b) => b.trim()).filter(Boolean);
      await createAssignment(asgTitle.trim(), asgCourseCode.trim(), asgDueAt, batches);
      setAsgTitle('');
    } finally {
      setIsCreatingAsg(false);
    }
  };

  // Handle Test Marks Import
  const handleImportTestMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImportingTest(true);
    setTestImportResult(null);
    try {
      const lines = testRawCsv.split('\n').map((l) => l.trim()).filter(Boolean);
      const records = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        const sid = parts[0] || '';
        const score = parseFloat(parts[1] || '0');
        return {
          testId: testId.trim(),
          testName: testName.trim(),
          studentId: sid,
          scorePercent: isNaN(score) ? 0 : score,
        };
      });
      const res = await importTestResults(records);
      setTestImportResult(res);
    } finally {
      setIsImportingTest(false);
    }
  };

  // Handle Club Session Create & Mark
  const handleCreateClubSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubSessionTitle.trim() || !clubName.trim()) return;
    setIsCreatingClub(true);
    try {
      const newSess = await createClubSession(clubName.trim(), clubSessionTitle.trim(), clubDate);
      const studentIds = clubStudentIds.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
      if (studentIds.length > 0) {
        await markClubAttendance(newSess.id, studentIds);
      }
      setClubSessionTitle('');
    } finally {
      setIsCreatingClub(false);
    }
  };

  // Handle Void XP Modal Confirm
  const handleConfirmVoidXp = async () => {
    if (!voidTargetTx) return;
    if (!voidReasonText || voidReasonText.trim().length < 5) {
      alert('A specific faculty justification reason is mandatory (min 5 characters).');
      return;
    }
    setVoidIsSubmitting(true);
    try {
      await voidXp(voidTargetTx.id, voidReasonText.trim());
      setShowVoidModal(false);
      setVoidTargetTx(null);
      setVoidReasonText('');
    } finally {
      setVoidIsSubmitting(false);
    }
  };

  const engagementTrend = [
    { week: 'W1', active: 620, quiz: 65 },
    { week: 'W2', active: 690, quiz: 70 },
    { week: 'W3', active: 740, quiz: 72 },
    { week: 'W4', active: 780, quiz: 74 },
    { week: 'W5', active: 810, quiz: 76 },
    { week: 'W6', active: 824, quiz: 78 },
  ];

  // Filtered Roster
  const filteredRoster = roster.filter((st) => {
    const matchesSearch =
      st.studentId.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      st.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      st.email.toLowerCase().includes(rosterSearch.toLowerCase());

    const matchesStatus =
      rosterStatusFilter === 'all'
        ? true
        : rosterStatusFilter === 'activated'
        ? st.isActivated
        : !st.isActivated;

    return matchesSearch && matchesStatus;
  });

  // Handle Reset Password Submit
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetStudent) return;
    adminResetPassword(resetTargetStudent.studentId, tempPassword);
    setShowResetModal(false);
    setResetTargetStudent(null);
  };

  // Handle Create Announcement Submit
  const handleCreateAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    createAnnouncement(newAnnTitle.trim(), newAnnContent.trim(), newAnnPriority, newAnnCourseTag);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  // Handle Reverse XP Confirm
  const handleConfirmReverseXp = () => {
    if (!reverseTargetFlagId) return;
    reverseIncidentXp(reverseTargetFlagId, reverseReason);
    setShowReverseModal(false);
    setReverseTargetFlagId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Faculty Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-quest-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-mono">
              FACULTY ADMINISTRATIVE SUITE
            </span>
            <span className="text-xs text-quest-muted">Department of Computer Science & Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-quest-navy mt-1">Instructor Console</h1>
          <p className="text-xs text-quest-muted mt-0.5 font-medium">
            Roster governance, student detail, password resets, announcements, and anti-gaming audit oversight.
          </p>
        </div>

        {/* Global Faculty Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/faculty/quizzes"
            className="px-4 py-2.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manage Curriculum Quizzes</span>
          </Link>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-quest-border text-quest-navy text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>XP Policy Caps</span>
          </button>
        </div>
      </div>

      {/* Faculty Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Pedagogical Overview', icon: Sparkles },
          { id: 'roster', label: `Student Roster (${roster.length})`, icon: Users },
          { id: 'points-economy', label: 'MSOT Points Economy', icon: Award },
          { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Bell },
          { id: 'anti-gaming', label: `Anti-Gaming Review (${facultyData.flaggedCount})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white shadow-sm'
                  : 'bg-white text-quest-muted hover:text-quest-navy border border-quest-border shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PEDAGOGICAL OVERVIEW */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Primary Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">
                  Daily Active Students
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-quest-navy font-mono tabular-nums">{facultyData.dailyActiveStudents}</p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ↑ 14% increase vs prior semester
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">
                  Quiz Completion
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-quest-navy font-mono tabular-nums">{facultyData.quizCompletionRate}%</p>
              <span className="text-[11px] text-quest-muted font-medium mt-1 block">
                Target benchmark: &gt;75%
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">
                  Average Streak
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <p className="text-3xl font-black text-quest-navy font-mono tabular-nums">{facultyData.avgStreakDays} days</p>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                Consistent habit formation
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-quest-border shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-quest-muted uppercase tracking-wider">
                  Quiet Students
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-quest-navy font-mono tabular-nums">{facultyData.quietStudentsCount}</p>
              <span className="text-[11px] text-purple-700 font-medium mt-1 block">
                Need gentle peer check-in
              </span>
            </div>
          </div>

          {/* Engagement Over Time Chart & Topics Students Struggle With */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Engagement Trend (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-quest-border p-6 shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-quest-border mb-4">
                <div>
                  <h3 className="text-sm font-bold text-quest-navy">Student Engagement Velocity Over Time</h3>
                  <p className="text-xs text-quest-muted">Active participants & daily quiz completion %</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Semester 4 Live
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementTrend}>
                    <defs>
                      <linearGradient id="colorActiveFaculty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F472B6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#DBEAFE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1E5E9" />
                    <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #F1E5E9',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#24324B',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Area type="monotone" dataKey="active" stroke="#F472B6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActiveFaculty)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Topics Students Struggle With (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
              <div className="pb-3 border-b border-quest-border">
                <h3 className="text-sm font-bold text-quest-navy uppercase tracking-wider">
                  Topics Students Struggle With
                </h3>
                <p className="text-xs text-quest-muted mt-0.5">Automated pedagogical detection from lab runs</p>
              </div>

              <div className="space-y-3.5">
                {facultyData.struggleTopics.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-quest-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-quest-navy">{item.topic}</span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tabular-nums">
                        {item.incorrectPercent}% incorrect
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-rose-500 rounded-full shadow-sm"
                        style={{ width: `${item.incorrectPercent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-quest-muted">
                      <strong className="text-sky-600">Action:</strong> {item.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: STUDENT ROSTER MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          {/* Roster Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-quest-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, student name, or email..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-quest-border text-xs text-quest-navy placeholder-quest-muted focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-quest-border text-xs">
                {(['all', 'activated', 'pending'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRosterStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                      rosterStatusFilter === st
                        ? 'bg-pink-100 text-pink-800'
                        : 'text-quest-muted hover:text-quest-navy'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCsvImportModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-quest-border text-quest-navy text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Roster CSV</span>
            </button>
          </div>

          {/* Roster Table */}
          <div className="rounded-3xl bg-white border border-quest-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-quest-border text-quest-muted uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Mains Student ID</th>
                    <th className="px-6 py-3.5 font-bold">Full Name</th>
                    <th className="px-6 py-3.5 font-bold">Department & Batch</th>
                    <th className="px-6 py-3.5 font-bold">Role</th>
                    <th className="px-6 py-3.5 font-bold">Activation Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Faculty Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-quest-border">
                  {filteredRoster.map((student) => (
                    <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-quest-navy">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-quest-navy">{student.fullName}</p>
                        <p className="text-[11px] text-quest-muted font-mono">{student.email}</p>
                      </td>
                      <td className="px-6 py-4 text-quest-muted">
                        <span className="font-semibold text-quest-navy">{student.department}</span>
                        <span className="block text-[11px]">Batch {student.batch}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-quest-muted">
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono ${
                            student.isActivated
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {student.isActivated ? 'ACTIVATED' : 'PENDING ACTIVATION'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 rounded-lg border border-quest-border hover:bg-slate-100 text-quest-muted hover:text-quest-navy transition-colors"
                            title="View student profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setResetTargetStudent(student);
                              setShowResetModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-quest-navy text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Reset password for student"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                            <span>Reset Pwd</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creator Form (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-quest-border">
              <h3 className="text-base font-bold text-quest-navy">Publish Official Announcement</h3>
              <p className="text-xs text-quest-muted mt-0.5">Dispatched to all enrolled student notification feeds</p>
            </div>

            <form onSubmit={handleCreateAnnSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                  Target Cohort
                </label>
                <select
                  value={newAnnCourseTag}
                  onChange={(e) => setNewAnnCourseTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                >
                  <option value="All CSE Cohorts">All CSE Cohorts</option>
                  <option value="CS204: Algorithms">CS204: Algorithms & Complexity</option>
                  <option value="CS201: Data Structures">CS201: Data Structures</option>
                  <option value="Department Governance">Department Governance & Honors</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                  Priority Level
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAnnPriority === 'normal'}
                      onChange={() => setNewAnnPriority('normal')}
                      className="accent-pink-500"
                    />
                    <span>Normal Notice</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-rose-700 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newAnnPriority === 'urgent'}
                      onChange={() => setNewAnnPriority('urgent')}
                      className="accent-rose-500"
                    />
                    <span>Urgent Alert</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                  Announcement Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-semester Algorithms Battle Schedule & Rules"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-quest-muted uppercase tracking-wider block mb-1">
                  Announcement Body
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Official notice details..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:opacity-95 text-white text-xs font-bold shadow-sunset transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Announcement</span>
              </button>
            </form>
          </div>

          {/* Active Announcements List (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-quest-border">
              <h3 className="text-base font-bold text-quest-navy">Live Published Notices</h3>
              <p className="text-xs text-quest-muted mt-0.5">Faculty broadcasts currently active in student dashboards</p>
            </div>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-2xl border space-y-2 transition-all ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50/60 border-quest-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            ann.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ann.priority}
                        </span>
                        <span className="text-[10px] font-bold text-quest-muted px-2 py-0.5 rounded bg-white border border-quest-border">
                          {ann.courseTag}
                        </span>
                        <span className="text-[11px] text-quest-muted">{ann.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-sm text-quest-navy">{ann.title}</h4>
                    </div>

                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-quest-muted leading-relaxed whitespace-pre-line font-normal">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ANTI-GAMING REVIEW & AUDIT TRAIL */}
      {/* ============================================================== */}
      {activeTab === 'anti-gaming' && (
        <div className="space-y-6">
          {/* Integrity Header */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 font-mono">
                  CAMPUS INTEGRITY GUARANTEE
                </span>
                <h3 className="text-xl font-black text-quest-navy">XP Authenticity Score: {facultyData.xpIntegrityScore}%</h3>
                <p className="text-xs text-quest-muted mt-0.5">
                  Server-side rate limiters, 1-attempt quiz DB constraints, and AST fingerprinting active.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3.5 py-1.5 rounded-2xl border border-amber-200">
                {facultyData.flaggedIncidents.filter((i) => i.status === 'pending').length} Anomaly Flags Pending
              </span>
            </div>
          </div>

          {/* Flagged Incidents List */}
          <div className="rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-quest-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-quest-navy">Flagged XP Activity Incidents</h3>
                <p className="text-xs text-quest-muted mt-0.5">
                  Faculty holds executive power to reverse XP without punitive academic records
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {facultyData.flaggedIncidents.map((inc) => {
                const isPending = inc.status === 'pending';

                return (
                  <div
                    key={inc.id}
                    className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      inc.status === 'reversed'
                        ? 'bg-rose-50/50 border-rose-200 opacity-80'
                        : inc.status === 'dismissed'
                        ? 'bg-slate-50 border-quest-border opacity-70'
                        : inc.status === 'confirmed'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-amber-50/80 border-amber-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-quest-navy text-sm">{inc.studentName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-quest-border text-quest-muted">
                          {inc.studentId}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            inc.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inc.severity} Severity
                        </span>
                        <span className="text-quest-muted text-[11px] font-mono">{inc.timestamp}</span>
                      </div>
                      <p className="text-xs text-quest-muted">
                        <strong className="text-quest-navy">Anomaly:</strong> {inc.details}
                      </p>
                      {inc.facultyNotes && (
                        <p className="text-[11px] text-rose-700 italic">
                          Faculty reversal rationale: &ldquo;{inc.facultyNotes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-black text-amber-700">+{inc.xpAssociated} XP</span>

                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dismissIncident(inc.id)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-quest-border text-quest-muted text-xs font-bold transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => confirmIncident(inc.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                          >
                            Confirm Flag
                          </button>
                          <button
                            onClick={() => {
                              setReverseTargetFlagId(inc.id);
                              setShowReverseModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Reverse XP</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`font-black px-2.5 py-1 rounded-lg uppercase text-[10px] font-mono ${
                            inc.status === 'reversed'
                              ? 'text-rose-700 bg-rose-100 border border-rose-200'
                              : inc.status === 'confirmed'
                              ? 'text-amber-800 bg-amber-100 border border-amber-200'
                              : 'text-slate-600 bg-slate-100'
                          }`}
                        >
                          {inc.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Audit Trail Log */}
          <div className="rounded-3xl bg-white border border-quest-border p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-quest-border flex items-center gap-2 text-quest-navy">
              <History className="w-5 h-5 text-sky-500" />
              <h3 className="text-base font-bold">Faculty Governance Audit Trail</h3>
            </div>

            <div className="divide-y divide-quest-border text-xs">
              {facultyData.auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-quest-navy">{log.actorName}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {log.action}
                      </span>
                      <span className="text-quest-muted">→ Target: {log.targetStudentName}</span>
                    </div>
                    <p className="text-[11px] text-quest-muted mt-0.5">{log.reason}</p>
                  </div>
                  <span className="text-[11px] text-quest-muted font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: OFFICIAL MSOT POINTS ECONOMY CONSOLE */}
      {/* ============================================================== */}
      {activeTab === 'points-economy' && (
        <div className="space-y-6">
          {/* Sub-Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-quest-border">
            {[
              { id: 'attendance', label: 'Class Attendance Import (+10 XP)', icon: Calendar },
              { id: 'assignments', label: 'Assignments Governance (+20 XP)', icon: FileText },
              { id: 'tests', label: 'Bi-Weekly Test Marks (Score% / 2)', icon: GraduationCap },
              { id: 'clubs', label: 'Club Activities (+25 XP)', icon: Users },
              { id: 'rules', label: 'Rules & Economics Engine', icon: Sliders },
              { id: 'ledger', label: `Audit Ledger & Void XP (${xpTransactions.length})`, icon: History },
            ].map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = economySubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setEconomySubTab(sub.id as typeof economySubTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSubActive
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm'
                      : 'bg-white text-quest-muted hover:text-quest-navy border border-quest-border'
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Tab 1: Attendance Import */}
          {economySubTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-quest-navy">Import Class Attendance</h3>
                </div>
                <p className="text-xs text-quest-muted">
                  Ingest verified campus attendance. Students marked <strong>present</strong> receive exactly <strong>+10 XP</strong> per class session. Attendance is uncapped from the 200 XP/day limit.
                </p>

                <form onSubmit={handleImportAttendance} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Class Session ID
                    </label>
                    <input
                      type="text"
                      required
                      value={attSessionId}
                      onChange={(e) => setAttSessionId(e.target.value)}
                      placeholder="e.g. sess-2026-10-12-01"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        required
                        value={attCourseCode}
                        onChange={(e) => setAttCourseCode(e.target.value)}
                        placeholder="CS204"
                        className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={attDate}
                        onChange={(e) => setAttDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Student Attendance CSV (ID, Status)
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={attRawCsv}
                      onChange={(e) => setAttRawCsv(e.target.value)}
                      placeholder={"24CS01,present\n24CS02,present\n24CS03,absent"}
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                    <span className="text-[10px] text-quest-muted">Format: <code>student_id,present|absent|excused</code></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isImportingAtt}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isImportingAtt ? 'Validating...' : 'Validate & Award Attendance XP'}</span>
                  </button>
                </form>

                {attImportResult && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    attImportResult.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Import Completed: {attImportResult.importedCount} valid records.</span>
                    </div>
                    {attImportResult.errors.length > 0 && (
                      <div className="space-y-1 text-rose-700">
                        <span className="font-semibold">{attImportResult.errors.length} Row Validation Errors:</span>
                        <ul className="list-disc pl-4 text-[11px] space-y-0.5 max-h-32 overflow-y-auto">
                          {attImportResult.errors.map((err, i) => (
                            <li key={i}>Row {err.row}: {err.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-quest-navy">Attendance Audit Ledger ({attendanceRecords.length} records)</h3>
                  <span className="text-xs font-mono text-quest-muted">10 XP per Present Session</span>
                </div>

                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="sticky top-0 bg-white border-b border-quest-border text-quest-muted font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Session & Course</th>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Awarded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-quest-border/40">
                      {attendanceRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            <div>{rec.courseCode}</div>
                            <div className="text-[10px] text-quest-muted">{rec.classSessionId}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{rec.studentName}</div>
                            <div className="text-[10px] font-mono text-quest-muted">{rec.studentId}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{rec.sessionDate}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              rec.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'excused'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {rec.status === 'present' ? `+${rec.xpAwarded || 10} XP` : '0 XP'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Assignment Governance */}
          {economySubTab === 'assignments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h3 className="font-bold text-quest-navy">Create Assignment</h3>
                </div>
                <p className="text-xs text-quest-muted">
                  Publish assignments with strict submission deadlines. Submitting on or before deadline grants <strong>+20 XP</strong>. Late submissions preserve academic receipt but grant 0 XP.
                </p>

                <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={asgTitle}
                      onChange={(e) => setAsgTitle(e.target.value)}
                      placeholder="e.g. Graph Traversals Lab Report"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        required
                        value={asgCourseCode}
                        onChange={(e) => setAsgCourseCode(e.target.value)}
                        placeholder="CS204"
                        className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                        Target Batches
                      </label>
                      <input
                        type="text"
                        required
                        value={asgBatches}
                        onChange={(e) => setAsgBatches(e.target.value)}
                        placeholder="2024-2028"
                        className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Deadline (Due At)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={asgDueAt}
                      onChange={(e) => setAsgDueAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingAsg}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCreatingAsg ? 'Publishing...' : 'Publish Official Assignment (+20 XP)'}</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-quest-navy">Active Course Assignments ({assignments.length})</h3>
                  <span className="text-xs font-mono text-quest-muted">20 XP on-time</span>
                </div>

                <div className="space-y-3">
                  {assignments.map((asg) => {
                    const subs = assignmentSubmissions.filter((s) => s.assignmentId === asg.id);
                    const onTimeCount = subs.filter((s) => s.isOnTime).length;
                    return (
                      <div key={asg.id} className="p-4 rounded-2xl border border-quest-border bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-quest-navy text-sm">{asg.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                              {asg.courseCode}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            +20 XP On-Time
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-xs text-quest-muted pt-1 border-t border-quest-border/40 font-mono">
                          <span>Due: {new Date(asg.dueAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                          <span>Batches: {asg.targetBatches.join(', ')}</span>
                          <span className="font-bold text-slate-800">{subs.length} Submissions ({onTimeCount} on-time)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Bi-weekly Test Marks */}
          {economySubTab === 'tests' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-quest-navy">Import Bi-Weekly Test Marks</h3>
                </div>
                <p className="text-xs text-quest-muted">
                  Official examination marks entered by faculty. Formula: <code>floor(score% / 2)</code>, capped at <strong>50 XP</strong>. Bypasses the 200 XP daily limit.
                </p>

                <form onSubmit={handleImportTestMarks} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Test ID
                    </label>
                    <input
                      type="text"
                      required
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      placeholder="e.g. test-algo-03"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="Bi-weekly Algorithms Evaluation #3"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Marks CSV (Student ID, Score %)
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={testRawCsv}
                      onChange={(e) => setTestRawCsv(e.target.value)}
                      placeholder={"24CS01,88\n24CS02,94\n24CS03,72"}
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    />
                    <span className="text-[10px] text-quest-muted">Format: <code>student_id,score_percentage</code> (0 to 100)</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isImportingTest}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isImportingTest ? 'Processing...' : 'Compute & Credit Test XP'}</span>
                  </button>
                </form>

                {testImportResult && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    testImportResult.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span>Ingestion Complete: {testImportResult.importedCount} marks processed.</span>
                    </div>
                    {testImportResult.errors.length > 0 && (
                      <div className="space-y-1 text-rose-700">
                        <span className="font-semibold">{testImportResult.errors.length} Row Errors:</span>
                        <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                          {testImportResult.errors.map((err, i) => (
                            <li key={i}>Row {err.row}: {err.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-quest-navy">Official Test Marks Ledger ({testResults.length} records)</h3>
                  <span className="text-xs font-mono text-quest-muted">Max 50 XP per Test</span>
                </div>

                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="sticky top-0 bg-white border-b border-quest-border text-quest-muted font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Test Title</th>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Score %</th>
                        <th className="py-2.5 px-3 text-right">Computed XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-quest-border/40">
                      {testResults.map((tr) => (
                        <tr key={tr.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            <div>{tr.testName}</div>
                            <div className="text-[10px] font-mono text-quest-muted">{tr.testId}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{tr.studentName}</div>
                            <div className="text-[10px] font-mono text-quest-muted">{tr.studentId}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{tr.scorePercent}%</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            +{tr.xpAwarded} XP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Club Activities */}
          {economySubTab === 'clubs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-quest-navy">Record Club Session</h3>
                </div>
                <p className="text-xs text-quest-muted">
                  Official club activities verified by faculty lead. Participating students receive <strong>+25 XP</strong> (capped at 1 club session per day).
                </p>

                <form onSubmit={handleCreateClubSession} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Club Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g. Google Developer Student Club (GDSC)"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Session Title
                    </label>
                    <input
                      type="text"
                      required
                      value={clubSessionTitle}
                      onChange={(e) => setClubSessionTitle(e.target.value)}
                      placeholder="e.g. Competitive Programming Workshop"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={clubDate}
                      onChange={(e) => setClubDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                      Attending Student IDs (Comma-separated)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={clubStudentIds}
                      onChange={(e) => setClubStudentIds(e.target.value)}
                      placeholder="24CS01, 24CS02, 24CS04"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingClub}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCreatingClub ? 'Recording...' : 'Record Session & Credit +25 XP'}</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-quest-navy">Verified Club Sessions ({clubSessions.length})</h3>
                  <span className="text-xs font-mono text-quest-muted">25 XP per Verified Session</span>
                </div>

                <div className="space-y-3">
                  {clubSessions.map((sess) => {
                    const attendees = clubAttendance.filter((ca) => ca.clubSessionId === sess.id);
                    return (
                      <div key={sess.id} className="p-4 rounded-2xl border border-quest-border bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-quest-navy text-sm">{sess.sessionTitle}</div>
                            <div className="text-xs text-indigo-700 font-semibold">{sess.clubName}</div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            +25 XP Awarded
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-quest-muted pt-1 border-t border-quest-border/40 font-mono">
                          <span>Date: {sess.sessionDate}</span>
                          <span className="font-bold text-slate-800">{attendees.length} Students Attended</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: Rules & Economics Engine */}
          {economySubTab === 'rules' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-quest-border shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-quest-navy">Server-Enforced XP Rules Table</h3>
                  <p className="text-xs text-quest-muted">
                    Mirrored in <code>xp_rules</code> database table. Enforced by SECURITY DEFINER procedure <code>award_xp</code>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                    Daily Non-Academic Cap: {xpRules.limits.globalDailyCap} XP
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="border-b border-quest-border text-quest-muted font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Rule Name & Purpose</th>
                      <th className="py-2.5 px-3">XP Reward</th>
                      <th className="py-2.5 px-3">Daily Limit</th>
                      <th className="py-2.5 px-3">Source Engine</th>
                      <th className="py-2.5 px-3">Global Cap Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-quest-border/40">
                    {Object.values(xpRules.rules).map((rule) => (
                      <tr key={rule.actionType} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-quest-navy">{rule.actionType}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{rule.name}</div>
                          <div className="text-[11px] text-quest-muted">{rule.description}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">+{rule.xp} XP</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {rule.perDayLimit ? `${rule.perDayLimit} / day` : 'Uncapped'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{rule.verificationSource}</td>
                        <td className="py-2.5 px-3">
                          {rule.isExcludedFromGlobalCap ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                              BYPASSES CAP (Academic)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                              Subject to 200 XP/day
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 6: Audit Ledger & Void XP */}
          {economySubTab === 'ledger' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-quest-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-quest-navy">Immutable Campus XP Audit Ledger</h3>
                  <p className="text-xs text-quest-muted">
                    Faculty manual override with mandatory justification reason. Reversals log to audit trail without public shaming.
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-quest-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerFilter}
                    onChange={(e) => setLedgerFilter(e.target.value)}
                    placeholder="Filter by student ID or action..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="sticky top-0 bg-white border-b border-quest-border text-quest-muted font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp (IST)</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Action Description</th>
                      <th className="py-2.5 px-3">Source & Reference</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                      <th className="py-2.5 px-3 text-right">Faculty Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-quest-border/40">
                    {xpTransactions
                      .filter((tx) => {
                        if (!ledgerFilter) return true;
                        const f = ledgerFilter.toLowerCase();
                        return (
                          (tx.studentId || '').toLowerCase().includes(f) ||
                          tx.studentName?.toLowerCase().includes(f) ||
                          tx.actionType.toLowerCase().includes(f) ||
                          tx.description.toLowerCase().includes(f)
                        );
                      })
                      .map((tx) => (
                        <tr key={tx.id} className={`hover:bg-slate-50 ${tx.isVoided ? 'bg-rose-50/40 text-slate-400' : ''}`}>
                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{tx.studentName}</div>
                            <div className="text-[10px] font-mono text-quest-muted">{tx.studentId}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{tx.description}</div>
                            <div className="text-[10px] font-mono text-quest-muted">{tx.actionType}</div>
                            {tx.isVoided && tx.voidReason && (
                              <div className="text-[10px] text-rose-600 font-normal mt-0.5">
                                Voided: "{tx.voidReason}" (by {tx.voidedBy})
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                            <div>{tx.source}</div>
                            <div className="text-slate-400">Ref: {tx.referenceId}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {tx.isVoided ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                                VOIDED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                                VERIFIED
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {tx.isVoided ? <span className="line-through text-slate-400">+{tx.amount} XP</span> : `+${tx.amount} XP`}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {!tx.isVoided ? (
                              <button
                                onClick={() => {
                                  setVoidTargetTx(tx);
                                  setVoidReasonText('Suspicious anomaly detected during faculty audit verification.');
                                  setShowVoidModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono transition-colors"
                              >
                                Void XP
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">Reversed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Student Detail */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <h3 className="font-bold text-base text-quest-navy">Student Roster Profile</h3>
                <button onClick={() => setSelectedStudent(null)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Official Mains ID</span>
                  <p className="font-mono font-bold text-quest-navy text-sm">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Full Name</span>
                  <p className="font-bold text-quest-navy">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Institutional Email</span>
                  <p className="font-mono text-quest-navy">{selectedStudent.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Department</span>
                    <p className="font-semibold text-quest-navy">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Batch</span>
                    <p className="font-semibold text-quest-navy">{selectedStudent.batch}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block">Account Activation</span>
                  <span
                    className={`mt-1 inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono ${
                      selectedStudent.isActivated
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedStudent.isActivated ? 'ACTIVATED' : 'NOT ACTIVATED YET'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-quest-navy text-xs font-bold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Admin Password Reset */}
      <AnimatePresence>
        {showResetModal && resetTargetStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <div className="flex items-center gap-2 text-quest-navy">
                  <KeyRound className="w-5 h-5 text-sky-500" />
                  <h3 className="font-bold text-base">Faculty Password Reset</h3>
                </div>
                <button onClick={() => setShowResetModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecutePasswordReset} className="space-y-4 text-xs">
                <p className="text-quest-muted leading-relaxed">
                  Reset credentials for <strong className="text-quest-navy">{resetTargetStudent.fullName}</strong> ({resetTargetStudent.studentId}).
                </p>

                <div>
                  <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border font-mono font-bold text-quest-navy focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800">
                  Student will be prompted to replace this temporary password immediately upon their next login.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Execute Reset & Issue Credentials
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reverse XP */}
      <AnimatePresence>
        {showReverseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReverseModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <div className="flex items-center gap-2 text-rose-600">
                  <Ban className="w-5 h-5" />
                  <h3 className="font-bold text-base text-quest-navy">Confirm XP Reversal</h3>
                </div>
                <button onClick={() => setShowReverseModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-quest-muted leading-relaxed">
                  Reversing this activity deducts the awarded XP from the student&rsquo;s current total and permanently stamps the faculty reason onto the audit log.
                </p>

                <div>
                  <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                    Faculty Reason / Justification
                  </label>
                  <textarea
                    rows={3}
                    value={reverseReason}
                    onChange={(e) => setReverseReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  Non-punitive pedagogical tone: this resets game mechanics without triggering formal academic disciplinary marks.
                </div>

                <button
                  onClick={handleConfirmReverseXp}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Confirm Reversal & Log to Audit Trail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Import Roster CSV / Add Student */}
      <AnimatePresence>
        {showCsvImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCsvImportModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <div className="flex items-center gap-2 text-quest-navy">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base">Student Roster Enrollment</h3>
                </div>
                <button
                  onClick={() => setShowCsvImportModal(false)}
                  className="text-quest-muted hover:text-quest-navy p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setImportTab('csv')}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    importTab === 'csv' ? 'bg-white text-quest-navy shadow-xs' : 'text-quest-muted hover:text-quest-navy'
                  }`}
                >
                  Bulk CSV / JSON Import
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('single')}
                  className={`flex-1 py-1.5 rounded-xl transition-all ${
                    importTab === 'single' ? 'bg-white text-quest-navy shadow-xs' : 'text-quest-muted hover:text-quest-navy'
                  }`}
                >
                  Enroll Single Student
                </button>
              </div>

              {importTab === 'csv' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-quest-border text-xs text-quest-muted space-y-1">
                    <p className="font-bold text-quest-navy">Format: Student ID (Mains-24813), Full Name, Email, Department, Batch</p>
                    <p className="text-[11px]">
                      Student ID must match <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">^Mains-\d{5}$</code>. Duplicates are rejected case-insensitively.
                    </p>
                  </div>

                  {csvErrorList.length > 0 && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 max-h-36 overflow-y-auto">
                      <p className="font-bold flex items-center gap-1 text-rose-700">
                        <AlertCircle className="w-4 h-4" /> Validation Errors ({csvErrorList.length}):
                      </p>
                      {csvErrorList.map((err, idx) => (
                        <p key={idx} className="text-[11px]">
                          Row {err.row}: {err.reason}
                        </p>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-quest-navy block mb-1">
                      Paste CSV Records or JSON Array:
                    </label>
                    <textarea
                      rows={6}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="Mains-24819, Aryan Mehta, aryan.mehta@msot.edu, Computer Science & Engineering, 2024-2028"
                      className="w-full p-3 rounded-2xl border border-quest-border bg-slate-50 text-xs font-mono text-quest-navy outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isIngestingRoster}
                    onClick={async () => {
                      setIsIngestingRoster(true);
                      setCsvErrorList([]);
                      try {
                        const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
                        let parsed: any[] = [];
                        if (csvText.trim().startsWith('[')) {
                          parsed = JSON.parse(csvText).map((item: any) => ({
                            studentId: item.studentId || item.student_id || '',
                            fullName: item.fullName || item.full_name || item.name || '',
                            email: item.email || '',
                            department: item.department || 'Computer Science & Engineering',
                            batch: item.batch || '2024-2028',
                          }));
                        } else {
                          parsed = lines.map((line, idx) => {
                            if (idx === 0 && (line.toLowerCase().startsWith('student_id') || line.toLowerCase().startsWith('studentid'))) {
                              return null;
                            }
                            const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
                            return {
                              studentId: parts[0] || '',
                              fullName: parts[1] || 'Student',
                              email: parts[2] || '',
                              department: parts[3] || 'Computer Science & Engineering',
                              batch: parts[4] || '2024-2028',
                            };
                          }).filter(Boolean);
                        }

                        if (parsed.length === 0) {
                          setCsvErrorList([{ row: 1, reason: 'No valid data rows provided.' }]);
                          return;
                        }

                        const res = await importRosterCsv(parsed);
                        if (res.errors.length > 0) {
                          setCsvErrorList(res.errors);
                        }
                        if (res.importedCount > 0 && res.errors.length === 0) {
                          setShowCsvImportModal(false);
                          setCsvText('');
                        }
                      } catch (err: any) {
                        setCsvErrorList([{ row: 1, reason: err.message || 'Parsing error' }]);
                      } finally {
                        setIsIngestingRoster(false);
                      }
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {isIngestingRoster ? 'Validating & Enrolling...' : 'Validate & Ingest Students'}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSingleError('');
                    const val = validateStudentId(singleId);
                    if (!val.isValid) {
                      setSingleError(val.error || 'Enter your student ID in this format: Mains-24813');
                      return;
                    }

                    if (!singleName.trim()) {
                      setSingleError('Please provide the student’s full name.');
                      return;
                    }

                    if (!singleEmail.trim() || !singleEmail.includes('@')) {
                      setSingleError('Please provide a valid institutional email.');
                      return;
                    }

                    setIsIngestingRoster(true);
                    try {
                      const res = await addRosterStudent({
                        studentId: val.normalizedId,
                        fullName: singleName.trim(),
                        email: singleEmail.trim(),
                        department: singleDept,
                        batch: singleBatch,
                        role: 'student',
                      });

                      if (res.success) {
                        setShowCsvImportModal(false);
                        setSingleId('');
                        setSingleName('');
                        setSingleEmail('');
                      } else {
                        setSingleError(res.error || 'Enrollment failed.');
                      }
                    } finally {
                      setIsIngestingRoster(false);
                    }
                  }}
                  className="space-y-3 text-xs"
                >
                  {singleError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{singleError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-quest-navy font-bold block mb-1">Student ID (Mains-24813)</label>
                    <input
                      type="text"
                      required
                      value={singleId}
                      onChange={(e) => {
                        setSingleId(e.target.value);
                        if (singleError) setSingleError('');
                      }}
                      placeholder="Mains-24813"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-quest-navy font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-quest-navy font-bold block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      required
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      placeholder="e.g. alex.morgan@msot.edu"
                      className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-quest-navy font-bold block mb-1">Department</label>
                      <input
                        type="text"
                        value={singleDept}
                        onChange={(e) => setSingleDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-quest-navy font-bold block mb-1">Batch</label>
                      <input
                        type="text"
                        value={singleBatch}
                        onChange={(e) => setSingleBatch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-quest-border text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isIngestingRoster}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50 mt-2"
                  >
                    {isIngestingRoster ? 'Enrolling Student...' : 'Enroll Student'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Configure XP Rules Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <h3 className="text-base font-bold text-quest-navy">Campus XP Caps & Anti-Gaming Policy</h3>
                <button onClick={() => setShowConfigModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-quest-navy font-semibold block mb-1.5">
                    Daily Quiz Max XP Cap ({dailyQuizCap} XP)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={dailyQuizCap}
                    onChange={(e) => setDailyQuizCap(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="text-quest-navy font-semibold block mb-1.5">
                    Plagiarism AST Flag Threshold ({plagiarismThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="98"
                    value={plagiarismThreshold}
                    onChange={(e) => setPlagiarismThreshold(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-quest-border space-y-1.5 text-[11px] text-quest-muted">
                  <p>✓ Daily Coding Cap: 150 XP max</p>
                  <p>✓ Peer Help Cap: 50 XP max (max 2 accepted helps / day)</p>
                  <p>✓ Non-punitive game design: absences never deduct XP</p>
                </div>

                <button
                  onClick={() => setShowConfigModal(false)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white text-xs font-black shadow-sunset"
                >
                  Save Policy Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Void Suspicious XP (Faculty Override) */}
      <AnimatePresence>
        {showVoidModal && voidTargetTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoidModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white border border-quest-border p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-quest-border">
                <div className="flex items-center gap-2 text-rose-600">
                  <Ban className="w-5 h-5" />
                  <h3 className="font-bold text-base text-quest-navy">Void XP Award</h3>
                </div>
                <button onClick={() => setShowVoidModal(false)} className="text-quest-muted hover:text-quest-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-quest-muted leading-relaxed">
                  You are reversing an XP award for <strong className="text-quest-navy">{voidTargetTx.studentName}</strong> ({voidTargetTx.studentId}).
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-quest-border space-y-1 font-mono text-[11px]">
                  <div><strong>Action:</strong> {voidTargetTx.description}</div>
                  <div><strong>Amount:</strong> +{voidTargetTx.amount} XP</div>
                  <div><strong>Reference:</strong> {voidTargetTx.referenceId}</div>
                  <div><strong>Date:</strong> {new Date(voidTargetTx.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-quest-muted tracking-wider block mb-1">
                    Mandatory Faculty Justification Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={voidReasonText}
                    onChange={(e) => setVoidReasonText(e.target.value)}
                    placeholder="Provide specific pedagogical justification (min 5 chars)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-quest-border text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none font-sans"
                  />
                  <span className="text-[10px] text-quest-muted">Logged permanently into the faculty audit trail and visible in the student&apos;s ledger.</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  Non-punitive game adjustment: this rolls back game XP without creating negative XP or punitive academic marks.
                </div>

                <button
                  onClick={handleConfirmVoidXp}
                  disabled={voidIsSubmitting || voidReasonText.trim().length < 5}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {voidIsSubmitting ? 'Voiding...' : 'Confirm Reversal & Log to Audit Ledger'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
