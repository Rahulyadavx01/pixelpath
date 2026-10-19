import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  UserRole,
  RosterStudent,
  XpActivity,
  Achievement,
  RewardItem,
  PeerHelpRequest,
  DiscussionThread,
  Announcement,
  Battle,
  FacultyStats,
  QuizAttempt,
  LeagueName,
  FacultyAllowlistEntry,
  CustomQuiz,
  CustomQuizQuestion,
  CustomQuizAttempt,
  QuizAnalytics,
  BattleChallengeSubmission,
  DailyQuest,
  DailyQuestAttempt,
  DailyQuestSolution,
  CodingProblem,
  XpTransaction,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  TestResult,
  ClubSession,
  ClubAttendance,
  LeaderboardPeriod,
  Course,
  CurriculumModule,
  CurriculumLesson,
  StudentModuleProgress,
  CurriculumAuditLog
} from '../types';
import {
  initialCurriculumCourses,
  detectCycle,
  getDependentModules,
  computeModuleStatus,
  wouldCreateCycle
} from '../lib/curriculumEngine';
import {
  initialUser,
  facultyUser,
  mockRoster,
  initialXpActivities,
  achievementsData,
  rewardsCatalog,
  mockPeerHelpRequests,
  mockDiscussions,
  mockAnnouncements,
  mockBattles,
  facultyMetrics,
  mockFacultyAllowlist,
  mockCustomQuizzes,
  mockCustomQuizAttempts,
  mockQuizAnalytics,
  initialDailyQuests,
  initialDailyQuestAttempts,
  codingProblems,
  mockXpTransactions,
  mockAttendanceRecords,
  mockAssignments,
  mockAssignmentSubmissions,
  mockTestResults,
  mockClubSessions,
  mockClubAttendance,
  mockLeaderboardPeriods
} from '../mock/data';
import {
  supabase,
  isSupabaseConfigured,
  isDemoMode,
  checkRateLimitLockout,
  recordFailedAttempt,
  clearFailedAttempts
} from '../lib/supabase';
import { xpRules } from '../config/xpRules';
import { DEFAULT_STARTER_CODE } from '../lib/codeRunner';
import {
  validateStudentId,
  normalizeStudentId,
  STUDENT_ID_ERROR_MESSAGE,
  FACULTY_REDIRECT_MESSAGE
} from '../lib/studentIdValidator';

interface ToastNotice {
  id: string;
  type: 'xp' | 'success' | 'level_up' | 'achievement' | 'info' | 'error';
  title: string;
  message: string;
  amount?: number;
}

interface AppContextType {
  user: UserProfile;
  roster: RosterStudent[];
  xpActivities: XpActivity[];
  xpTransactions: XpTransaction[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  testResults: TestResult[];
  clubSessions: ClubSession[];
  clubAttendance: ClubAttendance[];
  leaderboardPeriods: LeaderboardPeriod[];
  achievements: Achievement[];
  rewards: RewardItem[];
  peerHelpRequests: PeerHelpRequest[];
  discussions: DiscussionThread[];
  announcements: Announcement[];
  battles: Battle[];
  facultyData: FacultyStats;
  quizAttempt: QuizAttempt | null;
  completedLessonIds: string[];
  solvedProblemIds: string[];
  toasts: ToastNotice[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSupabaseActive: boolean;
  isAuthLoading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  awardXp: (amount: number, reason: string, category?: XpActivity['category'], actionType?: string, referenceId?: string, metadata?: Record<string, any>) => boolean;
  voidXp: (transactionId: string, facultyReason: string) => Promise<{ success: boolean; error?: string }>;
  triggerCelebration: () => void;
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastNotice, 'id'>) => void;

  // Points Economy & Verified Sources
  importAttendance: (records: { classSessionId: string; studentId: string; courseCode: string; sessionDate: string; status: 'present' | 'absent' | 'excused' }[]) => Promise<{ importedCount: number; errors: { row: number; reason: string }[] }>;
  createAssignment: (title: string, courseCode: string, dueAt: string, targetBatches: string[]) => Promise<Assignment>;
  submitAssignment: (assignmentId: string, studentId: string) => Promise<{ success: boolean; isOnTime: boolean; xpAwarded: number; error?: string }>;
  importTestResults: (results: { testId: string; testName: string; studentId: string; scorePercent: number }[]) => Promise<{ importedCount: number; errors: { row: number; reason: string }[] }>;
  createClubSession: (clubName: string, sessionTitle: string, sessionDate: string) => Promise<ClubSession>;
  markClubAttendance: (clubSessionId: string, studentIds: string[]) => Promise<{ count: number; error?: string }>;
  toggleLeaderboardOptOut: () => Promise<void>;
  acceptDiscussionAnswer: (threadId: string, replyId: string) => { success: boolean; error?: string };

  // Authentication & Roster
  verifyRosterId: (studentId: string) => Promise<{ success: boolean; student?: RosterStudent; error?: string }>;
  activateStudentAccount: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithStudentId: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  addRosterStudent: (student: Omit<RosterStudent, 'isActivated'>) => Promise<{ success: boolean; error?: string }>;
  importRosterCsv: (students: { studentId: string; fullName: string; email: string; department?: string; batch?: string }[]) => Promise<{ importedCount: number; errors: { row: number; reason: string }[] }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (studentId: string) => Promise<{ success: boolean; message: string }>;
  signOutUser: () => Promise<void>;
  switchUserRole: (role: UserRole) => void;

  // Quiz
  recordQuizAttempt: (score: number, userAnswers: number[], xpEarned: number) => void;

  // Peer Help (Requester-only accept)
  createPeerHelpRequest: (subject: string, title: string, description: string) => void;
  addPeerHelpResponse: (requestId: string, content: string) => void;
  acceptPeerHelp: (requestId: string, responseId: string) => { success: boolean; error?: string };

  // Discussions
  createDiscussionThread: (courseTag: string, title: string, body: string) => void;
  addDiscussionReply: (threadId: string, content: string) => void;
  deleteDiscussionThread: (threadId: string) => void;
  deleteDiscussionReply: (threadId: string, replyId: string) => void;
  moderateDiscussion: (threadId: string, isHidden: boolean) => void;

  // Announcements
  markAnnouncementAsRead: (id: string) => void;
  createAnnouncement: (title: string, content: string, priority: 'normal' | 'urgent', courseTag: string) => void;
  deleteAnnouncement: (id: string) => void;

  // Battles
  createBattle: (battleData: Partial<Battle>) => void;
  joinBattleTeam: (battleId: string, teamCode: string) => { success: boolean; error?: string };
  createBattleTeam: (battleId: string, teamName: string) => { success: boolean; teamCode?: string; error?: string };
  submitBattleChallenge: (battleId: string, challengeId: string) => void;
  submitBattleQuizChallenge: (battleId: string, challengeId: string, answers: { [qId: string]: number[] | number }) => Promise<{ success: boolean; isCorrect?: boolean; score?: number; xpAwarded?: number; error?: string }>;
  submitBattleCodingChallenge: (battleId: string, challengeId: string, code: string, testsPassed: number, totalTests: number) => Promise<{ success: boolean; isCorrect?: boolean; score?: number; xpAwarded?: number; error?: string }>;

  // Courses & Coding
  completeLesson: (lessonId: string, xpReward: number) => void;
  recordProblemSolved: (problemId: string, xpReward: number) => boolean;

  // Faculty Governance
  dismissIncident: (flagId: string) => void;
  confirmIncident: (flagId: string) => void;
  reverseIncidentXp: (flagId: string, facultyReason: string) => void;
  adminResetPassword: (studentId: string, newPass?: string) => void;

  // Rewards
  redeemReward: (rewardId: string) => boolean;

  // Faculty Custom Quizzes & Governance
  customQuizzes: CustomQuiz[];
  customAttempts: CustomQuizAttempt[];
  facultyAllowlist: FacultyAllowlistEntry[];
  createCustomQuiz: (quizData: Partial<CustomQuiz>) => Promise<CustomQuiz>;
  updateCustomQuiz: (id: string, quizData: Partial<CustomQuiz>) => Promise<CustomQuiz>;
  deleteCustomQuiz: (id: string) => Promise<boolean>;
  duplicateCustomQuiz: (id: string) => Promise<CustomQuiz>;
  rescoreCustomQuiz: (id: string) => Promise<{ success: boolean; attemptsRescored: number; error?: string }>;
  submitCustomQuizAttempt: (quizId: string, answers: { questionId: string; selectedOptions?: number[]; numericAnswer?: number }[]) => Promise<{
    success: boolean;
    score: number;
    maxScore: number;
    xpEarned: number;
    revealAnswers: boolean;
    answers?: any[];
    error?: string;
  }>;
  getQuizAnalytics: (quizId: string) => QuizAnalytics;
  signInWithFacultyGoogle: () => Promise<{ error?: string }>;
  verifyFacultySession: () => Promise<{ success: boolean; isAllowed: boolean; error?: string }>;

  // Daily Quest Feature
  dailyQuests: DailyQuest[];
  dailyQuestAttempts: DailyQuestAttempt[];
  submitDailyQuestAnswer: (questId: string, answer: string, timeTakenSeconds: number) => Promise<{
    isCorrect: boolean;
    xpAwarded: number;
    modelSolution: string;
    explanation: string;
    correctAnswer?: string;
    error?: string;
  }>;
  submitDailyQuestCoding: (
    questId: string,
    code: string,
    language: string,
    testResults: any[],
    allPassed: boolean,
    timeTakenSeconds: number
  ) => Promise<{
    isCorrect: boolean;
    xpAwarded: number;
    modelSolution: string;
    explanation: string;
    error?: string;
  }>;
  createDailyQuest: (questData: Partial<DailyQuest>, solutionData: Partial<DailyQuestSolution>) => Promise<DailyQuest>;
  updateDailyQuest: (id: string, updates: Partial<DailyQuest>) => Promise<DailyQuest>;
  deleteDailyQuest: (id: string) => Promise<boolean>;

  // Coding Problems Management (Faculty-Only)
  codingProblemsList: CodingProblem[];
  createCodingProblem: (problemData: Partial<CodingProblem>) => Promise<CodingProblem>;
  updateCodingProblem: (id: string, updates: Partial<CodingProblem>) => Promise<CodingProblem>;
  deleteCodingProblem: (id: string) => Promise<boolean>;

  // Accessibility & Visual Themes
  reduceTransparency: boolean;
  toggleReduceTransparency: () => void;

  // Curriculum Management (Data-Driven Courses, Modules & Lessons)
  courses: Course[];
  studentModuleProgress: StudentModuleProgress[];
  curriculumAuditLogs: CurriculumAuditLog[];
  createCourse: (data: Partial<Course>) => Promise<{ success: boolean; course?: Course; error?: string }>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<{ success: boolean; error?: string }>;
  deleteCourse: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  duplicateCourse: (courseId: string) => Promise<{ success: boolean; newCourseId?: string; error?: string }>;
  publishCourse: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  archiveCourse: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  addModule: (courseId: string, moduleData: Partial<CurriculumModule>) => Promise<{ success: boolean; module?: CurriculumModule; error?: string }>;
  updateModule: (courseId: string, moduleId: string, updates: Partial<CurriculumModule>) => Promise<{ success: boolean; error?: string }>;
  deleteModule: (courseId: string, moduleId: string) => Promise<{ success: boolean; error?: string }>;
  reorderModules: (courseId: string, moduleIdsInOrder: string[]) => Promise<{ success: boolean; error?: string }>;
  addLesson: (courseId: string, moduleId: string, lessonData: Partial<CurriculumLesson>) => Promise<{ success: boolean; lesson?: CurriculumLesson; error?: string }>;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<CurriculumLesson>) => Promise<{ success: boolean; error?: string }>;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<{ success: boolean; error?: string }>;
  reorderLessons: (courseId: string, moduleId: string, lessonIdsInOrder: string[]) => Promise<{ success: boolean; error?: string }>;
  importCourseSyllabus: (courseData: Course) => Promise<{ success: boolean; error?: string }>;
  completeCurriculumLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<{ success: boolean; xpAwarded?: number; moduleCompleted?: boolean; error?: string }>;
  completeCurriculumModule: (courseId: string, moduleId: string) => Promise<{ success: boolean; xpAwarded?: number; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('questify_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.collegeId === 'MSOT-2024-001') {
          parsed.collegeId = 'Mains-24813';
        }
        return parsed;
      } catch {
        return initialUser;
      }
    }
    return initialUser;
  });

  const [roster, setRoster] = useState<RosterStudent[]>(() => {
    const saved = localStorage.getItem('questify_roster');
    if (saved) {
      try {
        const parsed: RosterStudent[] = JSON.parse(saved);
        return parsed.map((st) => {
          if (st.studentId === 'MSOT-2024-001') return { ...st, studentId: 'Mains-24813' };
          if (st.studentId === 'MSOT-2024-002') return { ...st, studentId: 'Mains-24814' };
          if (st.studentId === 'MSOT-2024-003') return { ...st, studentId: 'Mains-24815' };
          if (st.studentId === 'MSOT-2024-004') return { ...st, studentId: 'Mains-24816' };
          if (st.studentId === 'MSOT-2024-005') return { ...st, studentId: 'Mains-24817' };
          return st;
        });
      } catch {
        return mockRoster;
      }
    }
    return mockRoster;
  });

  const [xpActivities, setXpActivities] = useState<XpActivity[]>(initialXpActivities);
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsData);
  const [rewards, setRewards] = useState<RewardItem[]>(rewardsCatalog);
  const [peerHelpRequests, setPeerHelpRequests] = useState<PeerHelpRequest[]>(mockPeerHelpRequests);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(mockDiscussions);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [battles, setBattles] = useState<Battle[]>(mockBattles);
  const [facultyData, setFacultyData] = useState<FacultyStats>(facultyMetrics);

  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(() => {
    const saved = localStorage.getItem('questify_quiz_attempt');
    return saved ? JSON.parse(saved) : null;
  });

  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>(() => {
    const saved = localStorage.getItem('questify_custom_quizzes');
    return saved ? JSON.parse(saved) : mockCustomQuizzes;
  });

  const [customAttempts, setCustomAttempts] = useState<CustomQuizAttempt[]>(() => {
    const saved = localStorage.getItem('questify_custom_attempts');
    return saved ? JSON.parse(saved) : mockCustomQuizAttempts;
  });

  const [facultyAllowlist] = useState<FacultyAllowlistEntry[]>(mockFacultyAllowlist);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['l-arr-1', 'l-arr-2', 'l-arr-3', 'l-ll-1', 'l-ll-2', 'l-sq-1', 'l-dc-1']);
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>(['prob-two-sum']);

  // Daily Quests and Coding Arena Problems (Faculty-Controlled)
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem('questify_daily_quests');
    return saved ? JSON.parse(saved) : initialDailyQuests;
  });

  const [dailyQuestAttempts, setDailyQuestAttempts] = useState<DailyQuestAttempt[]>(() => {
    const saved = localStorage.getItem('questify_daily_quest_attempts');
    return saved ? JSON.parse(saved) : initialDailyQuestAttempts;
  });

  const [codingProblemsList, setCodingProblemsList] = useState<CodingProblem[]>(() => {
    const saved = localStorage.getItem('questify_coding_problems');
    return saved ? JSON.parse(saved) : codingProblems;
  });

  // Official MSOT Points Economy State
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>(() => {
    const saved = localStorage.getItem('questify_xp_transactions');
    return saved ? JSON.parse(saved) : mockXpTransactions;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('questify_attendance_records');
    return saved ? JSON.parse(saved) : mockAttendanceRecords;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('questify_assignments');
    return saved ? JSON.parse(saved) : mockAssignments;
  });

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('questify_assignment_submissions');
    return saved ? JSON.parse(saved) : mockAssignmentSubmissions;
  });

  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('questify_test_results');
    return saved ? JSON.parse(saved) : mockTestResults;
  });

  const [clubSessions, setClubSessions] = useState<ClubSession[]>(() => {
    const saved = localStorage.getItem('questify_club_sessions');
    return saved ? JSON.parse(saved) : mockClubSessions;
  });

  const [clubAttendance, setClubAttendance] = useState<ClubAttendance[]>(() => {
    const saved = localStorage.getItem('questify_club_attendance');
    return saved ? JSON.parse(saved) : mockClubAttendance;
  });

  const [leaderboardPeriods, setLeaderboardPeriods] = useState<LeaderboardPeriod[]>(() => {
    const saved = localStorage.getItem('questify_leaderboard_periods');
    return saved ? JSON.parse(saved) : mockLeaderboardPeriods;
  });

  // Curriculum Management States
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('questify_courses');
    return saved ? JSON.parse(saved) : initialCurriculumCourses;
  });

  const [studentModuleProgress, setStudentModuleProgress] = useState<StudentModuleProgress[]>(() => {
    const saved = localStorage.getItem('questify_student_module_progress');
    if (saved) return JSON.parse(saved);
    return [
      { studentId: 'usr-student-1', moduleId: 'node-arrays', lessonsCompleted: ['l-arr-1', 'l-arr-2', 'l-arr-3'], status: 'completed', completedAt: new Date().toISOString(), xpAwarded: 120 },
      { studentId: 'usr-student-1', moduleId: 'node-linked-lists', lessonsCompleted: ['l-ll-1', 'l-ll-2'], status: 'completed', completedAt: new Date().toISOString(), xpAwarded: 150 },
      { studentId: 'usr-student-1', moduleId: 'node-stacks-queues', lessonsCompleted: ['l-sq-1'], status: 'in_progress', xpAwarded: 0 },
      { studentId: 'usr-student-1', moduleId: 'algo-divide-conquer', lessonsCompleted: ['l-dc-1'], status: 'completed', completedAt: new Date().toISOString(), xpAwarded: 140 },
    ];
  });

  const [curriculumAuditLogs, setCurriculumAuditLogs] = useState<CurriculumAuditLog[]>(() => {
    const saved = localStorage.getItem('questify_curriculum_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceTransparency, setReduceTransparency] = useState<boolean>(() => {
    return localStorage.getItem('questify_reduce_transparency') === 'true';
  });

  const toggleReduceTransparency = () => {
    setReduceTransparency((prev) => {
      const next = !prev;
      localStorage.setItem('questify_reduce_transparency', String(next));
      if (next) {
        document.documentElement.classList.add('reduce-transparency');
      } else {
        document.documentElement.classList.remove('reduce-transparency');
      }
      return next;
    });
  };

  useEffect(() => {
    if (reduceTransparency) {
      document.documentElement.classList.add('reduce-transparency');
    } else {
      document.documentElement.classList.remove('reduce-transparency');
    }
  }, [reduceTransparency]);

  const isSupabaseActive = Boolean(isSupabaseConfigured && !isDemoMode && supabase);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('questify_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('questify_roster', JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    if (quizAttempt) {
      localStorage.setItem('questify_quiz_attempt', JSON.stringify(quizAttempt));
    }
  }, [quizAttempt]);

  useEffect(() => {
    localStorage.setItem('questify_custom_quizzes', JSON.stringify(customQuizzes));
  }, [customQuizzes]);

  useEffect(() => {
    localStorage.setItem('questify_custom_attempts', JSON.stringify(customAttempts));
  }, [customAttempts]);

  useEffect(() => {
    localStorage.setItem('questify_xp_transactions', JSON.stringify(xpTransactions));
  }, [xpTransactions]);

  useEffect(() => {
    localStorage.setItem('questify_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('questify_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('questify_assignment_submissions', JSON.stringify(assignmentSubmissions));
  }, [assignmentSubmissions]);

  useEffect(() => {
    localStorage.setItem('questify_test_results', JSON.stringify(testResults));
  }, [testResults]);

  useEffect(() => {
    localStorage.setItem('questify_club_sessions', JSON.stringify(clubSessions));
  }, [clubSessions]);

  useEffect(() => {
    localStorage.setItem('questify_club_attendance', JSON.stringify(clubAttendance));
  }, [clubAttendance]);

  useEffect(() => {
    localStorage.setItem('questify_leaderboard_periods', JSON.stringify(leaderboardPeriods));
  }, [leaderboardPeriods]);

  useEffect(() => {
    localStorage.setItem('questify_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('questify_student_module_progress', JSON.stringify(studentModuleProgress));
  }, [studentModuleProgress]);

  useEffect(() => {
    localStorage.setItem('questify_curriculum_audit_logs', JSON.stringify(curriculumAuditLogs));
  }, [curriculumAuditLogs]);

  // Supabase Auth listener
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseActive || !client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await client.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser((prev) => ({
              ...prev,
              id: profile.id || prev.id,
              name: profile.name || prev.name,
              email: profile.email || prev.email,
              avatar: profile.avatar_url || prev.avatar,
              collegeId: profile.college_id || prev.collegeId,
              role: (profile.role as UserRole) || 'student',
              isOnboarded: profile.is_onboarded ?? true,
              level: profile.level || prev.level,
              xp: profile.xp || prev.xp,
              streakDays: profile.streak_days || prev.streakDays,
              streakFreezeCount: profile.streak_freeze_count || prev.streakFreezeCount,
              league: (profile.league as LeagueName) || prev.league,
              classRank: profile.class_rank || prev.classRank,
            }));
          }
        } catch {
          // Fallback to local session
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseActive]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F472B6', '#60A5FA', '#FBBF24', '#C4B5FD'],
      });
    } catch {}
  };

  const addToast = (toast: Omit<ToastNotice, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ====================================================================
  // OFFICIAL MSOT POINTS ECONOMY & XP GOVERNANCE ENGINE
  // ====================================================================

  const awardXp = (
    amount: number,
    reason: string,
    category: XpActivity['category'] = 'quiz',
    actionTypeParam?: string,
    referenceIdParam?: string,
    metadata?: Record<string, any>
  ): boolean => {
    // 1. Resolve action type from parameter or category
    const actionType = actionTypeParam || (
      category === 'attendance' ? 'attendance' :
      category === 'coding' ? 'coding_medium' :
      category === 'peer_help' ? 'peer_help' :
      category === 'streak_bonus' ? 'streak_7day' :
      category === 'battles' ? 'battle_challenge' :
      category === 'assignment' ? 'assignment' :
      'daily_quiz'
    );

    const rule = xpRules.rules[actionType];
    const refId = referenceIdParam || metadata?.referenceId || `auto-${actionType}-${Date.now()}`;

    // 2. Validate rule exists and is active
    if (!rule || !rule.active) {
      console.warn(`[Points Economy] Inactive or unknown action type: ${actionType}`);
      return false;
    }

    // 3. Determine final XP amount strictly enforced by server table
    let finalAmount = rule.xp;
    if (actionType === 'daily_quiz') {
      finalAmount = amount > 0 ? amount : rule.xp;
    } else if (actionType === 'biweekly_test') {
      finalAmount = Math.min(50, Math.max(0, amount));
    } else if (actionType === 'battle_challenge') {
      finalAmount = Math.min(amount, 60);
    } else if (actionType === 'daily_quest') {
      finalAmount = Math.min(Math.max(amount, 10), 100);
    }

    if (finalAmount <= 0) return false;

    // 4. Enforce unique constraint: (user_id, action_type, reference_id)
    const duplicate = xpTransactions.find(
      (t) => t.userId === user.id && t.actionType === actionType && t.referenceId === refId && !t.isVoided
    );
    if (duplicate) {
      console.warn(`[Points Economy] Duplicate XP award rejected for ${actionType} ref: ${refId}`);
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTransactions = xpTransactions.filter(
      (t) => t.userId === user.id && !t.isVoided && t.createdAt.startsWith(todayStr)
    );

    // 5. Enforce per-day action limits
    if (actionType.startsWith('coding_')) {
      const todayCodingCount = todayTransactions.filter((t) => t.actionType.startsWith('coding_')).length;
      if (todayCodingCount >= xpRules.limits.codingDailySolvesMax) {
        addToast({
          type: 'info',
          title: 'Daily Coding Limit Reached',
          message: `Daily limit reached for coding (${xpRules.limits.codingDailySolvesMax} solves/day). Come back tomorrow!`,
        });
        return false;
      }
    } else if (actionType === 'peer_help') {
      const todayPeerCount = todayTransactions.filter((t) => t.actionType === 'peer_help').length;
      if (todayPeerCount >= xpRules.limits.peerHelpDailyAcceptsMax) {
        addToast({
          type: 'info',
          title: 'Daily Peer Help Limit Reached',
          message: `Daily limit reached for peer help solutions (${xpRules.limits.peerHelpDailyAcceptsMax}/day). Come back tomorrow!`,
        });
        return false;
      }
    } else if (rule.perDayLimit !== null) {
      const actionCount = todayTransactions.filter((t) => t.actionType === actionType).length;
      if (actionCount >= rule.perDayLimit) {
        addToast({
          type: 'info',
          title: 'Daily Limit Reached',
          message: `Daily limit reached for ${rule.name} (${rule.perDayLimit} per day). Great practice today!`,
        });
        return false;
      }
    }

    // 6. Enforce global daily XP cap (default 200 XP/day, excluding official attendance and tests)
    if (!rule.isExcludedFromGlobalCap) {
      const todayNonExcludedXp = todayTransactions
        .filter((t) => {
          const r = xpRules.rules[t.actionType];
          return !r || !r.isExcludedFromGlobalCap;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      if (todayNonExcludedXp + finalAmount > xpRules.limits.globalDailyCap) {
        addToast({
          type: 'info',
          title: 'Global Daily XP Cap Reached',
          message: `You've reached today's ${xpRules.limits.globalDailyCap} XP daily cap. Official learning records remain saved!`,
        });
        return false;
      }
    }

    playChime();

    // 7. Update User Profile Points, Level, and League
    setUser((prev) => {
      const newXp = prev.xp + finalAmount;
      const baseNextLevel = prev.totalXpNeededForLevel;
      let newLevel = prev.level;
      let newTotalNeeded = baseNextLevel;
      let newXpToNext = prev.xpToNextLevel - finalAmount;

      if (newXpToNext <= 0) {
        newLevel += 1;
        newTotalNeeded = baseNextLevel + 1000;
        newXpToNext = newTotalNeeded - newXp;
        triggerCelebration();
        addToast({
          type: 'level_up',
          title: `LEVEL UP! LEVEL ${newLevel}`,
          message: 'Incredible dedication! You unlocked new league standing and honors.',
        });
      }

      let newLeague = prev.league;
      if (newXp >= 10000) newLeague = 'Master';
      else if (newXp >= 6000) newLeague = 'Diamond';
      else if (newXp >= 3500) newLeague = 'Platinum';
      else if (newXp >= 1800) newLeague = 'Gold';
      else if (newXp >= 800) newLeague = 'Silver';
      else newLeague = 'Bronze';

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        league: newLeague,
        totalXpNeededForLevel: newTotalNeeded,
        xpToNextLevel: Math.max(0, newXpToNext),
      };
    });

    // 8. Write to Immutable Ledger
    const newTx: XpTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      studentId: user.collegeId,
      studentName: user.name,
      actionType,
      referenceId: refId,
      amount: finalAmount,
      description: reason || rule.name,
      source: rule.verificationSource,
      metadata,
      isVoided: false,
      createdAt: new Date().toISOString(),
    };

    setXpTransactions((prev) => [newTx, ...prev]);

    // Backwards-compatible XpActivity sync
    const newActivity: XpActivity = {
      id: `xp-${Date.now()}`,
      timestamp: 'Just now',
      action: reason || rule.name,
      category,
      amount: finalAmount,
      verified: true,
      academicImpact: 'none',
    };
    setXpActivities((prev) => [newActivity, ...prev]);

    addToast({
      type: 'xp',
      title: `+${finalAmount} XP EARNED`,
      message: reason || rule.name,
      amount: finalAmount,
    });

    // Invoke Supabase RPC in background if active
    if (isSupabaseActive && supabase) {
      supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_reference_id: refId,
        p_amount: finalAmount,
        p_metadata: metadata || {}
      }).then(({ error }) => {
        if (error) console.error('[Supabase award_xp error]:', error);
      });
    }

    return true;
  };

  // Faculty Manual Override: Void suspicious XP with mandatory logged reason
  const voidXp = async (transactionId: string, facultyReason: string): Promise<{ success: boolean; error?: string }> => {
    if (!facultyReason || facultyReason.trim().length < 5) {
      return { success: false, error: 'A specific faculty justification reason is mandatory (min 5 characters).' };
    }

    const targetTx = xpTransactions.find((t) => t.id === transactionId);
    if (!targetTx) {
      return { success: false, error: 'Transaction record not found.' };
    }

    if (targetTx.isVoided) {
      return { success: false, error: 'Transaction is already voided.' };
    }

    if (isSupabaseActive && supabase) {
      const { error } = await supabase.rpc('void_xp', {
        p_transaction_id: transactionId,
        p_faculty_id: user.id,
        p_reason: facultyReason.trim(),
      });
      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Mark voided in local ledger
    setXpTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              isVoided: true,
              voidReason: facultyReason.trim(),
              voidedBy: user.name,
              voidedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // If target student is the active user, recompute total XP
    if (targetTx.userId === user.id) {
      setUser((prev) => {
        const remainingXp = Math.max(0, prev.xp - targetTx.amount);
        const newLevel = 1 + Math.floor(remainingXp / 1000);
        return {
          ...prev,
          xp: remainingXp,
          level: newLevel,
          xpToNextLevel: 1000 - (remainingXp % 1000),
        };
      });
    }

    // Log to Faculty Audit Log
    setFacultyData((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'VOID_XP_TRANSACTION',
          actorName: user.name,
          targetStudentName: targetTx.studentName || 'Student',
          reason: facultyReason.trim(),
          timestamp: 'Just now',
        },
        ...prev.auditLogs,
      ],
    }));

    addToast({
      type: 'info',
      title: 'XP Award Voided',
      message: `Voided ${targetTx.amount} XP for ${targetTx.studentName}. Reason logged in audit ledger.`,
    });

    return { success: true };
  };

  // 1. Roster Verification
  const verifyRosterId = async (studentId: string): Promise<{ success: boolean; student?: RosterStudent; error?: string }> => {
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      return { success: false, error: val.error || STUDENT_ID_ERROR_MESSAGE };
    }
    const cleanId = val.normalizedId;

    if (isSupabaseActive && supabase) {
      try {
        const { data, error } = await supabase.rpc('check_roster_activation', { p_student_id: cleanId });
        if (error || !data) return { success: false, error: 'Student ID not found in campus roster. Please contact faculty.' };
        if (!data.success) return { success: false, error: data.error };
        return {
          success: true,
          student: {
            studentId: data.studentId,
            fullName: data.fullName,
            email: data.email,
            department: data.department,
            batch: '2024-2028',
            role: data.role || 'student',
            isActivated: false,
          },
        };
      } catch {
        return { success: false, error: 'Verification service error. Please try again.' };
      }
    }

    // Demo Mode Roster Verification
    const found = roster.find((r) => r.studentId.toLowerCase() === cleanId.toLowerCase());
    if (!found) {
      return { success: false, error: 'Student ID not found in campus roster. Please contact faculty or student affairs.' };
    }
    if (found.isActivated) {
      return { success: false, error: 'Account already activated. Please sign in with your password.' };
    }

    return { success: true, student: found };
  };

  // 2. Activate Account
  const activateStudentAccount = async (studentId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      return { success: false, error: val.error || STUDENT_ID_ERROR_MESSAGE };
    }
    const cleanId = val.normalizedId;

    if (isSupabaseActive && supabase) {
      try {
        // Resolve email
        const { data: emailData } = await supabase.rpc('get_auth_email_for_student', { p_student_id: cleanId });
        const email = emailData || `${cleanId.toLowerCase()}@msot.edu`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { student_id: cleanId } },
        });

        if (error) return { success: false, error: error.message };

        // Mark roster activated
        await supabase.rpc('complete_roster_activation', { p_student_id: cleanId });

        if (data.user) {
          setUser((prev) => ({
            ...prev,
            id: data.user?.id || prev.id,
            collegeId: cleanId,
            email,
          }));
        }

        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Activation failed' };
      }
    }

    // Demo Mode Activation
    setRoster((prev) =>
      prev.map((r) => (r.studentId.toLowerCase() === cleanId.toLowerCase() ? { ...r, isActivated: true, activatedAt: new Date().toISOString() } : r))
    );

    const match = roster.find((r) => r.studentId.toLowerCase() === cleanId.toLowerCase());
    if (match) {
      setUser((prev) => ({
        ...prev,
        collegeId: cleanId,
        name: match.fullName,
        email: match.email,
        role: match.role,
        isOnboarded: true,
      }));
    }

    addToast({
      type: 'success',
      title: 'Account Activated',
      message: `Welcome, ${match?.fullName || cleanId}! Your password has been established.`,
    });

    return { success: true };
  };

  // 3. Sign In with Student ID + Password
  const signInWithStudentId = async (studentId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const val = validateStudentId(studentId);
    if (!val.isValid) {
      return { success: false, error: val.error || STUDENT_ID_ERROR_MESSAGE };
    }
    const cleanId = val.normalizedId;

    // Check rate-limiting lockout
    const lockout = checkRateLimitLockout(cleanId);
    if (lockout.locked) {
      return {
        success: false,
        error: `Account temporarily locked due to multiple failed attempts. Please wait ${lockout.remainingSeconds}s.`,
      };
    }

    // Reject faculty accounts on student portal
    const rosterMatch = roster.find((r) => r.studentId.toLowerCase() === cleanId.toLowerCase());
    if (rosterMatch && rosterMatch.role === 'faculty') {
      return { success: false, error: 'This page is for students. Use Faculty Login.' };
    }

    if (isSupabaseActive && supabase) {
      try {
        const { data: emailData } = await supabase.rpc('get_auth_email_for_student', { p_student_id: cleanId });
        if (!emailData) {
          recordFailedAttempt(cleanId);
          fetch('/api/auth/record-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: cleanId, success: false }),
          }).catch(() => {});
          return { success: false, error: 'Incorrect student ID or password.' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailData,
          password,
        });

        if (error) {
          recordFailedAttempt(cleanId);
          fetch('/api/auth/record-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: cleanId, success: false }),
          }).catch(() => {});
          return { success: false, error: 'Incorrect student ID or password.' };
        }

        clearFailedAttempts(cleanId);
        fetch('/api/auth/record-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: cleanId, success: true }),
        }).catch(() => {});

        if (data?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) {
            setUser((prev) => ({
              ...prev,
              id: profile.id,
              name: profile.name || prev.name,
              email: profile.email || emailData,
              collegeId: cleanId,
              role: profile.role || 'student',
              isOnboarded: profile.is_onboarded ?? true,
              level: profile.level || prev.level,
              xp: profile.xp || prev.xp,
            }));
          }
        }

        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: `Authenticated as ${cleanId}`,
        });

        return { success: true };
      } catch {
        recordFailedAttempt(cleanId);
        fetch('/api/auth/record-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: cleanId, success: false }),
        }).catch(() => {});
        return { success: false, error: 'Incorrect student ID or password.' };
      }
    }

    // Demo Mode Sign In
    const found = roster.find((r) => r.studentId.toLowerCase() === cleanId.toLowerCase());
    if (!found) {
      recordFailedAttempt(cleanId);
      fetch('/api/auth/record-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId, success: false }),
      }).catch(() => {});
      return { success: false, error: 'Incorrect student ID or password.' };
    }

    // In demo mode, accept password matching 'password123' or length >= 6
    if (password.length < 6) {
      recordFailedAttempt(cleanId);
      fetch('/api/auth/record-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId, success: false }),
      }).catch(() => {});
      return { success: false, error: 'Incorrect student ID or password.' };
    }

    clearFailedAttempts(cleanId);
    fetch('/api/auth/record-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: cleanId, success: true }),
    }).catch(() => {});

    setUser((prev) => ({
      ...prev,
      collegeId: cleanId,
      name: found.fullName,
      email: found.email,
      role: found.role,
      isOnboarded: true,
    }));

    addToast({
      type: 'success',
      title: 'Welcome Back!',
      message: `Signed in as ${found.fullName} (${cleanId})`,
    });

    return { success: true };
  };

  const addRosterStudent = async (student: Omit<RosterStudent, 'isActivated'>): Promise<{ success: boolean; error?: string }> => {
    const val = validateStudentId(student.studentId);
    if (!val.isValid) {
      return { success: false, error: val.error || STUDENT_ID_ERROR_MESSAGE };
    }
    const cleanId = val.normalizedId;

    // Check duplicate case-insensitively
    const exists = roster.some((r) => r.studentId.toLowerCase() === cleanId.toLowerCase());
    if (exists) {
      return { success: false, error: `Student ID "${cleanId}" already exists in roster.` };
    }

    const emailExists = roster.some((r) => r.email.toLowerCase() === student.email.trim().toLowerCase());
    if (emailExists) {
      return { success: false, error: `Email "${student.email}" already exists in roster.` };
    }

    const newStudent: RosterStudent = {
      studentId: cleanId,
      fullName: student.fullName.trim(),
      email: student.email.trim(),
      department: student.department || 'Computer Science & Engineering',
      batch: student.batch || '2024-2028',
      role: 'student',
      isActivated: false,
    };

    setRoster((prev) => [...prev, newStudent]);

    if (isSupabaseActive && supabase) {
      await supabase.from('student_roster').insert([{
        student_id: newStudent.studentId,
        full_name: newStudent.fullName,
        email: newStudent.email,
        department: newStudent.department,
        batch: newStudent.batch,
        role: 'student',
        is_activated: false,
      }]);
    }

    addToast({
      type: 'success',
      title: 'Student Enrolled',
      message: `Enrolled ${newStudent.fullName} (${cleanId}) in official roster.`,
    });

    return { success: true };
  };

  const importRosterCsv = async (
    students: { studentId: string; fullName: string; email: string; department?: string; batch?: string }[]
  ): Promise<{ importedCount: number; errors: { row: number; reason: string }[] }> => {
    const errors: { row: number; reason: string }[] = [];
    const validStudents: RosterStudent[] = [];
    const seenIds = new Set(roster.map((r) => r.studentId.toLowerCase()));
    const seenEmails = new Set(roster.map((r) => r.email.toLowerCase()));

    students.forEach((st, idx) => {
      const rowNum = idx + 1;
      const val = validateStudentId(st.studentId);
      if (!val.isValid) {
        errors.push({ row: rowNum, reason: val.error || STUDENT_ID_ERROR_MESSAGE });
        return;
      }
      const canonicalId = val.normalizedId;
      const lowerId = canonicalId.toLowerCase();
      if (seenIds.has(lowerId)) {
        errors.push({ row: rowNum, reason: `Duplicate student ID "${canonicalId}" (already in roster).` });
        return;
      }

      const cleanEmail = (st.email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        errors.push({ row: rowNum, reason: 'Invalid or missing institutional email address.' });
        return;
      }
      if (seenEmails.has(cleanEmail)) {
        errors.push({ row: rowNum, reason: `Duplicate email "${cleanEmail}" (already in roster).` });
        return;
      }

      seenIds.add(lowerId);
      seenEmails.add(cleanEmail);

      validStudents.push({
        studentId: canonicalId,
        fullName: st.fullName.trim() || 'Student',
        email: cleanEmail,
        department: st.department || 'Computer Science & Engineering',
        batch: st.batch || '2024-2028',
        role: 'student',
        isActivated: false,
      });
    });

    if (validStudents.length > 0) {
      setRoster((prev) => [...prev, ...validStudents]);

      if (isSupabaseActive && supabase) {
        await supabase.from('student_roster').insert(
          validStudents.map((s) => ({
            student_id: s.studentId,
            full_name: s.fullName,
            email: s.email,
            department: s.department,
            batch: s.batch,
            role: 'student',
            is_activated: false,
          }))
        );
      }
    }

    addToast({
      type: errors.length > 0 && validStudents.length === 0 ? 'error' : 'success',
      title: 'Roster Ingestion Complete',
      message: `Enrolled ${validStudents.length} students. ${errors.length} rows rejected.`,
    });

    return { importedCount: validStudents.length, errors };
  };

  // 4. Change Password
  const changePassword = async (_currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    if (isSupabaseActive && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        addToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your new password is now active.',
        });
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
      }
    }

    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Your credentials have been securely refreshed.',
    });
    return { success: true };
  };

  // 5. Request Password Reset (Zero enumeration leak)
  const requestPasswordReset = async (_studentId: string): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: 'If this ID is registered, your faculty advisor or admin has received your password reset request.',
    };
  };

  // 6. Sign Out
  const signOutUser = async () => {
    if (isSupabaseActive && supabase) {
      await supabase.auth.signOut();
    }
    setUser(initialUser);
    setQuizAttempt(null);
    localStorage.removeItem('questify_quiz_attempt');
    addToast({
      type: 'info',
      title: 'Session Ended',
      message: 'You have been signed out.',
    });
  };

  // Switch role for reviewer testing
  const switchUserRole = (role: UserRole) => {
    if (role === 'faculty') {
      setUser(facultyUser);
      addToast({
        type: 'info',
        title: 'Switched to Faculty Role',
        message: 'Active as Prof. Alan Vance (Faculty Console Unlocked)',
      });
    } else {
      setUser(initialUser);
      addToast({
        type: 'info',
        title: 'Switched to Student Role',
        message: 'Active as Alex Morgan (Student Dashboard)',
      });
    }
  };

  // 7. Quiz Attempt Recording (Single graded attempt enforced)
  const recordQuizAttempt = (score: number, userAnswers: number[], xpEarned: number) => {
    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: 'quiz-daily-algorithm-sprint',
      score,
      totalQuestions: 5,
      xpAwarded: xpEarned,
      userAnswers,
      isEvaluated: true,
      completedAt: new Date().toISOString(),
    };

    setQuizAttempt(attempt);

    if (xpEarned > 0) {
      awardXp(xpEarned, `Daily Algorithm Sprint (${score}/5 correct)`, 'quiz');
    }
    triggerCelebration();
  };

  // 8. Faculty Authentication & Allowlist
  const signInWithFacultyGoogle = async (): Promise<{ error?: string }> => {
    if (isSupabaseActive && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { hd: 'msot.edu', prompt: 'select_account' },
        },
      });
      if (error) return { error: error.message };
      return {};
    } else {
      // Demo simulation
      setUser(facultyUser);
      addToast({
        type: 'success',
        title: 'Faculty Authentication (Demo)',
        message: 'Signed in as Prof. Alan Vance (alan.vance@msot.edu)',
      });
      return {};
    }
  };

  const verifyFacultySession = async (): Promise<{ success: boolean; isAllowed: boolean; error?: string }> => {
    if (isSupabaseActive && supabase) {
      try {
        const { data, error } = await supabase.rpc('verify_and_register_faculty_session');
        if (error) {
          return { success: false, isAllowed: false, error: error.message };
        }
        if (!data?.is_allowed) {
          return {
            success: false,
            isAllowed: false,
            error: data?.error || 'Access restricted - your account is not registered as faculty. Contact your administrator.',
          };
        }
        setUser((prev) => ({
          ...prev,
          name: data.full_name || prev.name,
          email: data.email || prev.email,
          role: 'faculty',
          isOnboarded: true,
          major: data.department || prev.major,
        }));
        return { success: true, isAllowed: true };
      } catch (err: unknown) {
        return { success: false, isAllowed: false, error: err instanceof Error ? err.message : 'Verification failed' };
      }
    }

    // Demo mode: verify against mockFacultyAllowlist
    const matched = facultyAllowlist.find((f) => f.email.toLowerCase() === user.email.toLowerCase());
    if (user.role === 'faculty' || matched) {
      setUser(facultyUser);
      return { success: true, isAllowed: true };
    }
    return {
      success: false,
      isAllowed: false,
      error: 'Access restricted - your account is not registered as faculty. Contact your administrator.',
    };
  };

  // 9. Faculty Custom Quiz Operations
  const createCustomQuiz = async (quizData: Partial<CustomQuiz>): Promise<CustomQuiz> => {
    const newId = `quiz-${Date.now()}`;
    const clampedQuestionXp = Math.min(Math.max(quizData.questionXp || 15, xpRules.quiz.minPerQuestion || 5), xpRules.quiz.maxPerQuestion || 50);
    const clampedBonusXp = Math.min(Math.max(quizData.completionBonusXp || 25, 0), xpRules.quiz.maxCompletionBonus || 100);

    const newQuiz: CustomQuiz = {
      id: newId,
      title: quizData.title || 'Untitled Custom Quiz',
      description: quizData.description || '',
      courseTag: quizData.courseTag || 'CS-101',
      difficulty: quizData.difficulty || 'Medium',
      targetBatches: quizData.targetBatches && quizData.targetBatches.length > 0 ? quizData.targetBatches : ['2024-2028'],
      openAt: quizData.openAt || new Date().toISOString(),
      closeAt: quizData.closeAt || new Date(Date.now() + 86400000).toISOString(),
      timezone: quizData.timezone || 'UTC',
      timeLimitMins: quizData.timeLimitMins || 15,
      perQuestionTimeLimitSecs: quizData.perQuestionTimeLimitSecs,
      questionsToServe: quizData.questionsToServe,
      shuffleQuestions: quizData.shuffleQuestions ?? true,
      shuffleOptions: quizData.shuffleOptions ?? true,
      answerVisibility: quizData.answerVisibility || 'after_close',
      questionXp: clampedQuestionXp,
      completionBonusXp: clampedBonusXp,
      status: quizData.status || 'draft',
      version: 1,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attemptsCount: 0,
      questions: quizData.questions || [],
    };

    setCustomQuizzes((prev) => [newQuiz, ...prev]);
    addToast({
      type: 'success',
      title: 'Quiz Created',
      message: `"${newQuiz.title}" has been saved as ${newQuiz.status}.`,
    });
    return newQuiz;
  };

  const updateCustomQuiz = async (id: string, quizData: Partial<CustomQuiz>): Promise<CustomQuiz> => {
    let updatedQuiz: CustomQuiz | null = null;
    setCustomQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const hasAttempts = (q.attemptsCount || 0) > 0;
          const newVersion = hasAttempts ? q.version + 1 : q.version;
          updatedQuiz = {
            ...q,
            ...quizData,
            version: newVersion,
            updatedAt: new Date().toISOString(),
          };
          return updatedQuiz;
        }
        return q;
      })
    );
    addToast({
      type: 'success',
      title: 'Quiz Updated',
      message: 'Changes saved successfully.',
    });
    return updatedQuiz || (quizData as CustomQuiz);
  };

  const deleteCustomQuiz = async (id: string): Promise<boolean> => {
    setCustomQuizzes((prev) => prev.filter((q) => q.id !== id));
    addToast({
      type: 'info',
      title: 'Quiz Deleted',
      message: 'The quiz has been removed.',
    });
    return true;
  };

  const duplicateCustomQuiz = async (id: string): Promise<CustomQuiz> => {
    const target = customQuizzes.find((q) => q.id === id);
    if (!target) throw new Error('Quiz not found');
    const clone: CustomQuiz = {
      ...target,
      id: `quiz-copy-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: 'draft',
      version: 1,
      attemptsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: target.questions.map((q, idx) => ({
        ...q,
        id: `q-copy-${Date.now()}-${idx}`,
      })),
    };
    setCustomQuizzes((prev) => [clone, ...prev]);
    addToast({
      type: 'success',
      title: 'Quiz Duplicated',
      message: `Created draft copy: "${clone.title}"`,
    });
    return clone;
  };

  const rescoreCustomQuiz = async (id: string): Promise<{ success: boolean; attemptsRescored: number; error?: string }> => {
    const target = customQuizzes.find((q) => q.id === id);
    if (!target) return { success: false, attemptsRescored: 0, error: 'Quiz not found' };

    let rescoredCount = 0;
    setCustomAttempts((prev) =>
      prev.map((attempt) => {
        if (attempt.quizId === id) {
          rescoredCount++;
          let newScore = 0;
          let correctCount = 0;
          const updatedAnswers = attempt.answers.map((ans) => {
            const qDef = target.questions.find((q) => q.id === ans.questionId);
            if (!qDef) return ans;
            let isCorrect = false;
            if (qDef.questionType === 'short_numeric') {
              if (ans.numericAnswer !== undefined && qDef.numericAnswer !== undefined) {
                isCorrect = Math.abs(ans.numericAnswer - qDef.numericAnswer) <= (qDef.tolerance || 0);
              }
            } else {
              const correctSet = new Set(qDef.correctAnswers);
              const userSet = new Set(ans.selectedOptions || []);
              isCorrect = correctSet.size === userSet.size && [...correctSet].every((x) => userSet.has(x));
            }
            if (isCorrect) {
              newScore += qDef.marks;
              correctCount++;
            }
            return {
              ...ans,
              isCorrect,
              marksAwarded: isCorrect ? qDef.marks : 0,
            };
          });

          const newXp = (correctCount * target.questionXp) + (correctCount === target.questions.length ? target.completionBonusXp : 0);

          return {
            ...attempt,
            score: newScore,
            xpEarned: newXp,
            attemptVersion: target.version,
            answers: updatedAnswers,
          };
        }
        return attempt;
      })
    );

    addToast({
      type: 'success',
      title: 'Audited Re-Score Completed',
      message: `Rescored ${rescoredCount} student attempts against current answer keys.`,
    });
    return { success: true, attemptsRescored: rescoredCount };
  };

  const submitCustomQuizAttempt = async (
    quizId: string,
    answers: { questionId: string; selectedOptions?: number[]; numericAnswer?: number }[]
  ): Promise<{ success: boolean; score: number; maxScore: number; xpEarned: number; revealAnswers: boolean; answers?: any[]; error?: string }> => {
    const quiz = customQuizzes.find((q) => q.id === quizId);
    if (!quiz) return { success: false, score: 0, maxScore: 0, xpEarned: 0, revealAnswers: false, error: 'Quiz not found' };

    const alreadyAttempted = customAttempts.some((a) => a.quizId === quizId && (a.userId === user.id || a.studentId === user.collegeId));
    if (alreadyAttempted) {
      return { success: false, score: 0, maxScore: 0, xpEarned: 0, revealAnswers: false, error: 'You have already submitted an attempt for this quiz.' };
    }

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    const evaluatedAnswers = quiz.questions.map((qDef) => {
      maxScore += qDef.marks;
      const studentAns = answers.find((a) => a.questionId === qDef.id);
      let isCorrect = false;
      if (studentAns) {
        if (qDef.questionType === 'short_numeric') {
          if (studentAns.numericAnswer !== undefined && qDef.numericAnswer !== undefined) {
            isCorrect = Math.abs(studentAns.numericAnswer - qDef.numericAnswer) <= (qDef.tolerance || 0);
          }
        } else {
          const correctSet = new Set(qDef.correctAnswers);
          const userSet = new Set(studentAns.selectedOptions || []);
          isCorrect = correctSet.size === userSet.size && [...correctSet].every((x) => userSet.has(x));
        }
      }
      if (isCorrect) {
        totalScore += qDef.marks;
        correctCount++;
      }
      return {
        questionId: qDef.id,
        selectedOptions: studentAns?.selectedOptions,
        numericAnswer: studentAns?.numericAnswer,
        isCorrect,
        marksAwarded: isCorrect ? qDef.marks : 0,
      };
    });

    const xpEarned = (correctCount * quiz.questionXp) + (quiz.questions.length > 0 && correctCount === quiz.questions.length ? quiz.completionBonusXp : 0);

    const newAttempt: CustomQuizAttempt = {
      id: `att-${Date.now()}`,
      quizId,
      userId: user.id,
      studentName: user.name,
      studentId: user.collegeId,
      score: totalScore,
      maxScore,
      xpEarned,
      startedAt: new Date(Date.now() - 600000).toISOString(),
      completedAt: new Date().toISOString(),
      isEvaluated: true,
      attemptVersion: quiz.version,
      answers: evaluatedAnswers,
    };

    setCustomAttempts((prev) => [newAttempt, ...prev]);

    setCustomQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, attemptsCount: (q.attemptsCount || 0) + 1 } : q))
    );

    if (xpEarned > 0) {
      awardXp(xpEarned, `Completed Quiz: ${quiz.title}`, 'quiz');
    }

    const revealAnswers = quiz.answerVisibility === 'immediately';

    return {
      success: true,
      score: totalScore,
      maxScore,
      xpEarned,
      revealAnswers,
      answers: revealAnswers ? evaluatedAnswers : undefined,
    };
  };

  const getQuizAnalytics = (quizId: string): QuizAnalytics => {
    const quiz = customQuizzes.find((q) => q.id === quizId);
    const attempts = customAttempts.filter((a) => a.quizId === quizId);
    const total = attempts.length;
    if (total === 0 || !quiz) {
      return {
        totalAttempts: 0,
        completionRate: 0,
        averageScore: 0,
        averageTimeSecs: 0,
        scoreDistribution: [
          { range: '0-20%', count: 0 },
          { range: '21-40%', count: 0 },
          { range: '41-60%', count: 0 },
          { range: '61-80%', count: 0 },
          { range: '81-100%', count: 0 },
        ],
        questionStats: (quiz?.questions || []).map((q) => ({
          questionId: q.id,
          questionText: q.questionText,
          accuracyPercent: 0,
          attemptCount: 0,
        })),
        studentAttempts: [],
        integrityFlags: [],
      };
    }

    const avgScore = Math.round(attempts.reduce((sum, a) => sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) / total);

    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    attempts.forEach((a) => {
      const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
      if (pct <= 20) distribution[0].count++;
      else if (pct <= 40) distribution[1].count++;
      else if (pct <= 60) distribution[2].count++;
      else if (pct <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    const questionStats = quiz.questions.map((q) => {
      let qCorrect = 0;
      attempts.forEach((a) => {
        const studentAns = a.answers.find((ans) => ans.questionId === q.id);
        if (studentAns?.isCorrect) qCorrect++;
      });
      return {
        questionId: q.id,
        questionText: q.questionText,
        accuracyPercent: Math.round((qCorrect / total) * 100),
        attemptCount: total,
      };
    });

    return {
      totalAttempts: total,
      completionRate: 100,
      averageScore: avgScore,
      averageTimeSecs: 580,
      scoreDistribution: distribution,
      questionStats,
      studentAttempts: attempts,
      integrityFlags: facultyData.flaggedIncidents.filter((f) => attempts.some((a) => a.studentId === f.studentId)),
    };
  };

  // 8. Peer Help (Requester-only accept)
  const createPeerHelpRequest = (subject: string, title: string, description: string) => {
    const newReq: PeerHelpRequest = {
      id: `req-${Date.now()}`,
      requesterId: user.id,
      requesterName: user.name,
      requesterAvatar: user.avatar,
      subject,
      title,
      description,
      status: 'open',
      createdAt: 'Just now',
      responses: [],
    };
    setPeerHelpRequests((prev) => [newReq, ...prev]);
    addToast({
      type: 'success',
      title: 'Help Request Published',
      message: 'Classmates in your cohort will be notified to offer solutions.',
    });
  };

  const addPeerHelpResponse = (requestId: string, content: string) => {
    const newResp = {
      id: `resp-${Date.now()}`,
      requestId,
      helperId: user.id,
      helperName: user.name,
      helperAvatar: user.avatar,
      helperRole: `${user.role === 'faculty' ? 'Faculty Instructor' : 'Student'} • Level ${user.level}`,
      content,
      isAccepted: false,
      createdAt: 'Just now',
    };

    setPeerHelpRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, responses: [...req.responses, newResp] } : req))
    );

    addToast({
      type: 'info',
      title: 'Response Posted',
      message: 'Your explanation was shared. You will receive +25 XP if the student marks it as accepted.',
    });
  };

  const acceptPeerHelp = (requestId: string, responseId: string): { success: boolean; error?: string } => {
    const req = peerHelpRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found.' };

    // STRICT CHECK: Only requester can accept
    if (req.requesterId !== user.id) {
      return { success: false, error: 'Only the student who asked for help can mark an answer as accepted.' };
    }

    const resp = req.responses.find((r) => r.id === responseId);
    if (!resp) return { success: false, error: 'Response not found.' };

    // No self-help accept
    if (resp.helperId === user.id) {
      return { success: false, error: 'You cannot accept your own response.' };
    }

    setPeerHelpRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'resolved',
            acceptedResponseId: responseId,
            resolvedAt: new Date().toISOString(),
            responses: r.responses.map((res) => (res.id === responseId ? { ...res, isAccepted: true } : res)),
          };
        }
        return r;
      })
    );

    // If helper is the current logged in user (in a test scenario), award XP directly
    if (resp.helperId === user.id) {
      awardXp(xpRules.rewards.peerHelpAccepted, 'Peer Help: Accepted Solution', 'peer_help');
    }

    addToast({
      type: 'success',
      title: 'Solution Accepted!',
      message: `${resp.helperName} received +25 Peer Help XP for their explanation.`,
    });

    triggerCelebration();
    return { success: true };
  };

  // 9. Discussions
  const createDiscussionThread = (courseTag: string, title: string, body: string) => {
    const newThread: DiscussionThread = {
      id: `disc-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: `${user.role === 'faculty' ? 'Faculty Instructor' : 'Student'} • Level ${user.level}`,
      courseTag,
      title,
      body,
      isPinned: false,
      isHidden: false,
      createdAt: 'Just now',
      replies: [],
    };
    setDiscussions((prev) => [newThread, ...prev]);
    addToast({
      type: 'success',
      title: 'Discussion Thread Started',
      message: 'Your topic is now live in the student community.',
    });
  };

  const addDiscussionReply = (threadId: string, content: string) => {
    const newReply = {
      id: `drep-${Date.now()}`,
      threadId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: `${user.role === 'faculty' ? 'Faculty Instructor' : 'Student'} • Level ${user.level}`,
      content,
      isHidden: false,
      createdAt: 'Just now',
    };

    setDiscussions((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, newReply] } : t))
    );
  };

  const deleteDiscussionThread = (threadId: string) => {
    setDiscussions((prev) => prev.filter((t) => t.id !== threadId));
    addToast({ type: 'info', title: 'Thread Removed', message: 'The discussion thread was deleted.' });
  };

  const deleteDiscussionReply = (threadId: string, replyId: string) => {
    setDiscussions((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replies: t.replies.filter((r) => r.id !== replyId) } : t))
    );
  };

  const moderateDiscussion = (threadId: string, isHidden: boolean) => {
    if (user.role !== 'faculty') return;
    setDiscussions((prev) => prev.map((t) => (t.id === threadId ? { ...t, isHidden } : t)));
    addToast({
      type: 'info',
      title: 'Moderation Action Applied',
      message: isHidden ? 'Thread hidden from student view.' : 'Thread visibility restored.',
    });
  };

  const acceptDiscussionAnswer = (threadId: string, replyId: string): { success: boolean; error?: string } => {
    const thread = discussions.find((t) => t.id === threadId);
    if (!thread) return { success: false, error: 'Discussion thread not found.' };

    if (thread.authorId !== user.id && user.role !== 'faculty') {
      return { success: false, error: 'Only the author of the question (or faculty) can accept an answer.' };
    }

    const reply = thread.replies.find((r) => r.id === replyId);
    if (!reply) return { success: false, error: 'Reply not found.' };

    if (reply.authorId === thread.authorId) {
      return { success: false, error: 'Cannot accept your own answer for peer help XP.' };
    }

    if (reply.isAccepted || thread.acceptedReplyId === replyId) {
      return { success: false, error: 'This answer is already marked as accepted.' };
    }

    setDiscussions((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            acceptedReplyId: replyId,
            replies: t.replies.map((r) => (r.id === replyId ? { ...r, isAccepted: true } : r)),
          };
        }
        return t;
      })
    );

    // If helper is the current user (e.g. testing) award XP, else create ledger transaction for helper
    if (reply.authorId === user.id) {
      awardXp(
        xpRules.table.peerHelpAccepted,
        `Peer Help: Accepted Solution in "${thread.title.substring(0, 30)}..."`,
        'peer_help',
        'peer_help',
        `reply-${replyId}`
      );
    } else {
      const helperStudent = roster.find((r) => r.studentId === reply.authorId || r.fullName === reply.authorName);
      const helperTx: XpTransaction = {
        id: `tx-peer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: reply.authorId,
        studentId: helperStudent?.studentId || reply.authorId,
        studentName: reply.authorName,
        actionType: 'peer_help',
        referenceId: `reply-${replyId}`,
        amount: xpRules.table.peerHelpAccepted,
        description: `Peer Help: Accepted Solution in "${thread.title.substring(0, 30)}..."`,
        source: 'discussion_accepted_answer',
        metadata: { threadId, replyId },
        isVoided: false,
        createdAt: new Date().toISOString(),
      };
      setXpTransactions((prev) => [helperTx, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Answer Accepted!',
      message: `${reply.authorName} received +${xpRules.table.peerHelpAccepted} XP for helpful solution.`,
    });
    triggerCelebration();
    return { success: true };
  };

  // 10. Announcements
  const markAnnouncementAsRead = (id: string) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const createAnnouncement = (title: string, content: string, priority: 'normal' | 'urgent', courseTag: string) => {
    if (user.role !== 'faculty') return;
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      authorId: user.id,
      authorName: `${user.name} (Faculty)`,
      title,
      content,
      priority,
      courseTag,
      createdAt: 'Just now',
      isRead: false,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addToast({
      type: 'success',
      title: 'Announcement Published',
      message: 'All enrolled students will receive this notification.',
    });
  };

  const deleteAnnouncement = (id: string) => {
    if (user.role !== 'faculty') return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // 11. Team Battles
  const createBattle = (battleData: Partial<Battle>) => {
    if (user.role !== 'faculty') return;
    const newBattle: Battle = {
      id: `bat-${Date.now()}`,
      title: battleData.title || 'Untitled Battle',
      description: battleData.description || 'Department team challenge',
      topic: battleData.topic || 'General Algorithms',
      status: 'registration',
      registrationDeadline: battleData.registrationDeadline || new Date(Date.now() + 86400000).toISOString(),
      startTime: battleData.startTime || new Date(Date.now() + 172800000).toISOString(),
      endTime: battleData.endTime || new Date(Date.now() + 200000000).toISOString(),
      maxTeamSize: battleData.maxTeamSize || 4,
      xpPool: battleData.xpPool || 500,
      teams: [],
      challenges: battleData.challenges || [],
    };

    if (newBattle.challenges.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Failed',
        message: 'A battle must attach at least one challenge (quiz or coding) before publishing.',
      });
      return;
    }

    setBattles((prev) => [newBattle, ...prev]);
    addToast({ type: 'success', title: 'Team Battle Created', message: 'Registration is now open for students.' });
  };

  const joinBattleTeam = (battleId: string, teamCode: string): { success: boolean; error?: string } => {
    const battle = battles.find((b) => b.id === battleId);
    if (!battle) return { success: false, error: 'Battle not found.' };

    const team = battle.teams.find((t) => t.teamCode.toUpperCase() === teamCode.toUpperCase().trim());
    if (!team) return { success: false, error: 'Team code not recognized.' };

    if (team.members.length >= battle.maxTeamSize) {
      return { success: false, error: `Team has reached maximum capacity of ${battle.maxTeamSize} students.` };
    }

    const alreadyInTeam = team.members.some((m) => m.userId === user.id);
    if (alreadyInTeam) return { success: true };

    const newMember = {
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      role: 'member' as const,
      joinedAt: 'Just now',
    };

    setBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          return {
            ...b,
            userTeamId: team.id,
            teams: b.teams.map((t) => (t.id === team.id ? { ...t, members: [...t.members, newMember] } : t)),
          };
        }
        return b;
      })
    );

    addToast({ type: 'success', title: 'Joined Team!', message: `You are now on squad "${team.name}".` });
    return { success: true };
  };

  const createBattleTeam = (battleId: string, teamName: string): { success: boolean; teamCode?: string; error?: string } => {
    const battle = battles.find((b) => b.id === battleId);
    if (!battle) return { success: false, error: 'Battle not found.' };

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newTeam = {
      id: `team-${Date.now()}`,
      battleId,
      name: teamName,
      teamCode: code,
      totalScore: 0,
      members: [
        {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          role: 'leader' as const,
          joinedAt: 'Just now',
        },
      ],
    };

    setBattles((prev) =>
      prev.map((b) => (b.id === battleId ? { ...b, userTeamId: newTeam.id, teams: [...b.teams, newTeam] } : b))
    );

    addToast({
      type: 'success',
      title: 'Squad Created!',
      message: `Share code "${code}" with classmates to recruit members.`,
    });

    return { success: true, teamCode: code };
  };

  const submitBattleQuizChallenge = async (
    battleId: string,
    challengeId: string,
    answers: { [qId: string]: number[] | number }
  ): Promise<{ success: boolean; isCorrect?: boolean; score?: number; xpAwarded?: number; error?: string }> => {
    const battle = battles.find((b) => b.id === battleId);
    if (!battle) return { success: false, error: 'Battle not found' };

    const now = new Date().getTime();
    const start = new Date(battle.startTime).getTime();
    const end = new Date(battle.endTime).getTime();
    if (battle.status !== 'live' || now < start || now > end) {
      addToast({ type: 'error', title: 'Battle Not Active', message: 'Submissions are accepted strictly during live battle window.' });
      return { success: false, error: 'Battle is not active' };
    }

    if (!battle.userTeamId) {
      addToast({ type: 'error', title: 'No Squad Registered', message: 'You must form or join a squad before attempting challenges.' });
      return { success: false, error: 'Must join a squad first' };
    }

    const challenge = battle.challenges.find((c) => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };

    if (challenge.userSubmission || challenge.isCompleted) {
      addToast({ type: 'info', title: 'Already Submitted', message: 'You have already submitted this challenge for your squad.' });
      return { success: false, error: 'Already submitted' };
    }

    // Evaluate quiz answers
    let correctCount = 0;
    const questions = challenge.quizQuestions || [];
    const totalQ = questions.length || 1;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (q.questionType === 'short_numeric') {
        if (typeof ans === 'number' && typeof q.numericAnswer === 'number') {
          if (Math.abs(ans - q.numericAnswer) <= (q.tolerance || 0)) {
            correctCount++;
          }
        }
      } else {
        const selected = Array.isArray(ans) ? [...ans].sort() : [];
        const correct = [...(q.correctAnswers || [])].sort();
        if (selected.length === correct.length && selected.every((val, idx) => val === correct[idx])) {
          correctCount++;
        }
      }
    });

    const isAllCorrect = correctCount === totalQ;
    const pointsEarned = isAllCorrect ? challenge.points : Math.round((correctCount / totalQ) * challenge.points);
    const xpReward = Math.min(pointsEarned, xpRules.rewards.battleChallengeQuiz);

    const submission: BattleChallengeSubmission = {
      id: `sub-${Date.now()}`,
      battleId,
      challengeId,
      teamId: battle.userTeamId,
      userId: user.id,
      challengeType: 'quiz',
      answers,
      isCorrect: isAllCorrect,
      score: pointsEarned,
      xpAwarded: xpReward,
      submittedAt: new Date().toISOString(),
    };

    setBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          return {
            ...b,
            challenges: b.challenges.map((c) =>
              c.id === challengeId
                ? {
                    ...c,
                    isCompleted: true,
                    status: 'scored',
                    score: pointsEarned,
                    userSubmission: submission,
                  }
                : c
            ),
            teams: b.teams.map((t) =>
              t.id === b.userTeamId
                ? { ...t, totalScore: t.totalScore + pointsEarned }
                : t
            ),
          };
        }
        return b;
      })
    );

    if (xpReward > 0) {
      awardXp(xpReward, `Battle Quiz Challenge Solved: ${challenge.title}`, 'battles', 'team_battle_quiz', challengeId);
    }

    triggerCelebration();
    addToast({
      type: 'success',
      title: 'Squad Quiz Scored!',
      message: `Contributed +${pointsEarned} squad points and earned +${xpReward} XP!`,
    });

    return { success: true, isCorrect: isAllCorrect, score: pointsEarned, xpAwarded: xpReward };
  };

  const submitBattleCodingChallenge = async (
    battleId: string,
    challengeId: string,
    code: string,
    testsPassed: number,
    totalTests: number
  ): Promise<{ success: boolean; isCorrect?: boolean; score?: number; xpAwarded?: number; error?: string }> => {
    const battle = battles.find((b) => b.id === battleId);
    if (!battle) return { success: false, error: 'Battle not found' };

    const now = new Date().getTime();
    const start = new Date(battle.startTime).getTime();
    const end = new Date(battle.endTime).getTime();
    if (battle.status !== 'live' || now < start || now > end) {
      addToast({ type: 'error', title: 'Battle Not Active', message: 'Submissions are accepted strictly during live battle window.' });
      return { success: false, error: 'Battle is not active' };
    }

    if (!battle.userTeamId) {
      addToast({ type: 'error', title: 'No Squad Registered', message: 'You must form or join a squad before attempting challenges.' });
      return { success: false, error: 'Must join a squad first' };
    }

    const challenge = battle.challenges.find((c) => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };

    if (challenge.userSubmission || challenge.isCompleted) {
      addToast({ type: 'info', title: 'Already Submitted', message: 'You have already submitted this challenge for your squad.' });
      return { success: false, error: 'Already submitted' };
    }

    const isAllPassed = testsPassed === totalTests && totalTests > 0;
    const pointsEarned = isAllPassed ? challenge.points : Math.round((testsPassed / totalTests) * challenge.points);
    const xpReward = isAllPassed ? Math.min(challenge.points, xpRules.rewards.battleChallengeCoding) : 0;

    const submission: BattleChallengeSubmission = {
      id: `sub-${Date.now()}`,
      battleId,
      challengeId,
      teamId: battle.userTeamId,
      userId: user.id,
      challengeType: 'coding',
      code,
      isCorrect: isAllPassed,
      score: pointsEarned,
      xpAwarded: xpReward,
      submittedAt: new Date().toISOString(),
    };

    setBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          return {
            ...b,
            challenges: b.challenges.map((c) =>
              c.id === challengeId
                ? {
                    ...c,
                    isCompleted: true,
                    status: 'scored',
                    score: pointsEarned,
                    userSubmission: submission,
                  }
                : c
            ),
            teams: b.teams.map((t) =>
              t.id === b.userTeamId
                ? { ...t, totalScore: t.totalScore + pointsEarned }
                : t
            ),
          };
        }
        return b;
      })
    );

    if (xpReward > 0) {
      awardXp(xpReward, `Battle Code Test Suite Passed: ${challenge.title}`, 'battles', 'team_battle_code', challengeId);
    }

    triggerCelebration();
    addToast({
      type: isAllPassed ? 'success' : 'info',
      title: isAllPassed ? 'Battle Challenge Solved!' : 'Partial Evaluation Recorded',
      message: `Squad earned +${pointsEarned} points and +${xpReward} XP (${testsPassed}/${totalTests} tests passed).`,
    });

    return { success: true, isCorrect: isAllPassed, score: pointsEarned, xpAwarded: xpReward };
  };

  const submitBattleChallenge = (battleId: string, challengeId: string) => {
    submitBattleQuizChallenge(battleId, challengeId, {});
  };

  // 12. Course Progress
  const completeLesson = (lessonId: string, xpReward: number) => {
    if (completedLessonIds.includes(lessonId)) return;
    setCompletedLessonIds((prev) => [...prev, lessonId]);
    awardXp(xpReward, 'Course Lesson Mastery Verification', 'assignment');
  };

  // 13. Coding Problem Solved (Strictly awards XP once, capped at 10 problems/day)
  const recordProblemSolved = (problemId: string, xpReward?: number): boolean => {
    if (solvedProblemIds.includes(problemId)) {
      addToast({
        type: 'info',
        title: 'Problem Already Solved',
        message: 'All test cases passed. XP was already claimed on your first submission.',
      });
      return false;
    }

    const targetProblem = codingProblemsList.find((p) => p.id === problemId);
    const difficulty = (targetProblem?.difficulty || 'Easy').toLowerCase() as 'easy' | 'medium' | 'hard';
    const computedXp = xpRules.rewards.codingProblem(difficulty);
    const finalXp = typeof xpReward === 'number' && xpReward > 0 ? xpReward : computedXp;
    const actionType = `coding_${difficulty}`;

    const awarded = awardXp(
      finalXp,
      `Coding Arena: Solved ${targetProblem?.title || problemId} (${targetProblem?.difficulty || 'Easy'})`,
      'coding',
      actionType,
      problemId,
      { difficulty, problemTitle: targetProblem?.title }
    );

    if (awarded) {
      setSolvedProblemIds((prev) => [...prev, problemId]);
      triggerCelebration();
      return true;
    }
    return false;
  };

  // 14. Faculty Governance Actions
  const dismissIncident = (flagId: string) => {
    setFacultyData((prev) => ({
      ...prev,
      flaggedIncidents: prev.flaggedIncidents.map((i) => (i.id === flagId ? { ...i, status: 'dismissed' } : i)),
      flaggedCount: Math.max(0, prev.flaggedCount - 1),
    }));
    addToast({ type: 'info', title: 'Flag Dismissed', message: 'Anomaly dismissed without penalty.' });
  };

  const confirmIncident = (flagId: string) => {
    setFacultyData((prev) => ({
      ...prev,
      flaggedIncidents: prev.flaggedIncidents.map((i) => (i.id === flagId ? { ...i, status: 'confirmed' } : i)),
      flaggedCount: Math.max(0, prev.flaggedCount - 1),
    }));
    addToast({ type: 'info', title: 'Flag Confirmed', message: 'Incident confirmed for academic advisor review.' });
  };

  const reverseIncidentXp = (flagId: string, facultyReason: string) => {
    const inc = facultyData.flaggedIncidents.find((i) => i.id === flagId);
    if (!inc) return;

    setFacultyData((prev) => ({
      ...prev,
      flaggedIncidents: prev.flaggedIncidents.map((i) =>
        i.id === flagId ? { ...i, status: 'reversed', facultyNotes: facultyReason } : i
      ),
      flaggedCount: Math.max(0, prev.flaggedCount - 1),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          action: 'xp_reversed',
          actorName: user.name,
          targetStudentName: inc.studentName,
          reason: facultyReason,
          timestamp: 'Just now',
        },
        ...prev.auditLogs,
      ],
    }));

    addToast({
      type: 'info',
      title: 'XP Reversal Executed',
      message: `Reversed ${inc.xpAssociated} XP with faculty justification logged to audit trail.`,
    });
  };

  const adminResetPassword = (studentId: string, newPass = 'MSOT-2026-Reset!') => {
    addToast({
      type: 'success',
      title: 'Temporary Password Issued',
      message: `Password for ${studentId} reset to "${newPass}". Student must change upon login.`,
    });
  };

  // 15. Redeem Reward
  const redeemReward = (rewardId: string): boolean => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return false;

    if (user.xp < reward.xpCost) {
      addToast({
        type: 'info',
        title: 'Insufficient XP',
        message: `You need ${reward.xpCost - user.xp} more XP to claim this reward.`,
      });
      return false;
    }

    setUser((prev) => ({ ...prev, xp: prev.xp - reward.xpCost }));
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, claimed: true, stock: Math.max(0, r.stock - 1) } : r))
    );

    triggerCelebration();
    playChime();

    addToast({
      type: 'success',
      title: 'Reward Claimed!',
      message: `Your voucher for "${reward.title}" has been issued to student affairs.`,
    });

    return true;
  };

  // Daily Quest submission & management methods
  const submitDailyQuestAnswer = async (questId: string, answer: string, timeTakenSeconds: number) => {
    const targetQuest = dailyQuests.find((q) => q.id === questId);
    if (!targetQuest) return { isCorrect: false, xpAwarded: 0, modelSolution: '', explanation: '', error: 'Quest not found' };

    const alreadyAttempted = dailyQuestAttempts.some((a) => a.questId === questId && a.userId === user.id);
    if (alreadyAttempted) return { isCorrect: false, xpAwarded: 0, modelSolution: '', explanation: '', error: 'You have already submitted an attempt for this quest' };

    let isCorrect = false;
    const normUser = String(answer).trim().toLowerCase();
    const normCorrect = String(targetQuest.correctAnswer || '').trim().toLowerCase();

    if (targetQuest.answerType === 'numeric') {
      const numUser = parseFloat(normUser);
      const numCorrect = parseFloat(normCorrect);
      isCorrect = !isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) <= 0.0001;
    } else {
      isCorrect = normUser === normCorrect;
    }

    let xpAwarded = 0;
    if (isCorrect) {
      xpAwarded = Math.min(Math.max(targetQuest.xpReward, xpRules.dailyQuest.minXp), xpRules.dailyQuest.maxXp);
      awardXp(xpAwarded, `Daily Quest: ${targetQuest.title}`, 'assignment', 'daily_quest', questId);
      setUser((prev) => ({ ...prev, streakDays: prev.streakDays + 1 }));
      triggerCelebration();
    }

    const newAttempt: DailyQuestAttempt = {
      id: 'dqa-' + Date.now(),
      questId,
      userId: user.id,
      studentName: user.name,
      studentId: user.collegeId,
      submissionText: answer,
      language: 'answer',
      isCorrect,
      score: isCorrect ? 100 : 0,
      xpAwarded,
      timeTakenSeconds,
      revealedSolution: {
        questId,
        modelSolution: targetQuest.modelSolution || '',
        explanation: targetQuest.solutionExplanation || '',
        correctAnswer: targetQuest.correctAnswer,
      },
      submittedAt: new Date().toISOString(),
    };

    const updatedAttempts = [newAttempt, ...dailyQuestAttempts];
    setDailyQuestAttempts(updatedAttempts);
    localStorage.setItem('questify_daily_quest_attempts', JSON.stringify(updatedAttempts));

    return {
      isCorrect,
      xpAwarded,
      modelSolution: targetQuest.modelSolution || '',
      explanation: targetQuest.solutionExplanation || '',
      correctAnswer: targetQuest.correctAnswer,
    };
  };

  const submitDailyQuestCoding = async (
    questId: string,
    code: string,
    language: string,
    testResults: any[],
    allPassed: boolean,
    timeTakenSeconds: number
  ) => {
    const targetQuest = dailyQuests.find((q) => q.id === questId);
    if (!targetQuest) return { isCorrect: false, xpAwarded: 0, modelSolution: '', explanation: '', error: 'Quest not found' };

    const alreadyAttempted = dailyQuestAttempts.some((a) => a.questId === questId && a.userId === user.id);
    if (alreadyAttempted) return { isCorrect: false, xpAwarded: 0, modelSolution: '', explanation: '', error: 'Already submitted an attempt for this quest' };

    let xpAwarded = 0;
    if (allPassed) {
      xpAwarded = Math.min(Math.max(targetQuest.xpReward, xpRules.dailyQuest.minXp), xpRules.dailyQuest.maxXp);
      awardXp(xpAwarded, `Daily Quest (Coding): ${targetQuest.title}`, 'coding', 'daily_quest', questId);
      setUser((prev) => ({ ...prev, streakDays: prev.streakDays + 1 }));
      triggerCelebration();
    }

    const newAttempt: DailyQuestAttempt = {
      id: 'dqa-code-' + Date.now(),
      questId,
      userId: user.id,
      studentName: user.name,
      studentId: user.collegeId,
      submissionText: code,
      language,
      isCorrect: allPassed,
      score: allPassed ? 100 : 0,
      xpAwarded,
      timeTakenSeconds,
      testResults,
      revealedSolution: {
        questId,
        modelSolution: targetQuest.modelSolution || '',
        explanation: targetQuest.solutionExplanation || '',
        correctAnswer: targetQuest.correctAnswer,
      },
      submittedAt: new Date().toISOString(),
    };

    const updatedAttempts = [newAttempt, ...dailyQuestAttempts];
    setDailyQuestAttempts(updatedAttempts);
    localStorage.setItem('questify_daily_quest_attempts', JSON.stringify(updatedAttempts));

    return {
      isCorrect: allPassed,
      xpAwarded,
      modelSolution: targetQuest.modelSolution || '',
      explanation: targetQuest.solutionExplanation || '',
    };
  };

  const createDailyQuest = async (questData: Partial<DailyQuest>, solutionData: Partial<DailyQuestSolution>): Promise<DailyQuest> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can create Daily Quests.');
    }
    const newQuest: DailyQuest = {
      id: 'dq-' + Date.now(),
      title: questData.title || 'Untitled Daily Quest',
      statement: questData.statement || '',
      questType: questData.questType || 'answer_based',
      answerType: questData.answerType,
      mcqOptions: questData.mcqOptions || [],
      difficulty: questData.difficulty || 'Medium',
      topicTag: questData.topicTag || 'Algorithms',
      targetBatches: questData.targetBatches || ['2024-2028'],
      liveDate: questData.liveDate || new Date().toISOString().split('T')[0],
      openAt: questData.openAt || new Date().toISOString(),
      closeAt: questData.closeAt || new Date(Date.now() + 86400000).toISOString(),
      xpReward: Math.min(Math.max(questData.xpReward || 50, xpRules.dailyQuest.minXp), xpRules.dailyQuest.maxXp),
      hints: questData.hints || [],
      status: questData.status || 'scheduled',
      starterCode: questData.starterCode,
      testCases: questData.testCases,
      modelSolution: solutionData.modelSolution,
      solutionExplanation: solutionData.explanation,
      correctAnswer: solutionData.correctAnswer,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      attemptsCount: 0,
    };

    const updated = [newQuest, ...dailyQuests];
    setDailyQuests(updated);
    localStorage.setItem('questify_daily_quests', JSON.stringify(updated));
    addToast({ type: 'success', title: 'Daily Quest Created', message: `Quest "${newQuest.title}" scheduled successfully.` });
    return newQuest;
  };

  const updateDailyQuest = async (id: string, updates: Partial<DailyQuest>): Promise<DailyQuest> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can update Daily Quests.');
    }
    const updated = dailyQuests.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q));
    setDailyQuests(updated);
    localStorage.setItem('questify_daily_quests', JSON.stringify(updated));
    const modified = updated.find((q) => q.id === id)!;
    addToast({ type: 'success', title: 'Daily Quest Updated', message: `Quest "${modified.title}" has been saved.` });
    return modified;
  };

  const deleteDailyQuest = async (id: string): Promise<boolean> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can delete Daily Quests.');
    }
    const filtered = dailyQuests.filter((q) => q.id !== id);
    setDailyQuests(filtered);
    localStorage.setItem('questify_daily_quests', JSON.stringify(filtered));
    addToast({ type: 'info', title: 'Daily Quest Deleted', message: 'The quest has been removed.' });
    return true;
  };

  const createCodingProblem = async (problemData: Partial<CodingProblem>): Promise<CodingProblem> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can manage coding problems.');
    }
    const newProb: CodingProblem = {
      id: 'prob-' + Date.now(),
      title: problemData.title || 'New Problem',
      slug: (problemData.title || 'new-problem').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      difficulty: problemData.difficulty || 'Medium',
      xpReward: problemData.xpReward || 50,
      streakDays: 4,
      acceptanceRate: '0%',
      tags: problemData.tags || ['Algorithms'],
      description: problemData.description || '',
      examples: problemData.examples || [],
      constraints: problemData.constraints || [],
      starterCode: problemData.starterCode || {
        cpp: DEFAULT_STARTER_CODE.cpp,
        python: DEFAULT_STARTER_CODE.python,
        javascript: DEFAULT_STARTER_CODE.javascript,
        java: DEFAULT_STARTER_CODE.java,
      },
      testCases: problemData.testCases || [],
      solutionExplanation: problemData.solutionExplanation || '',
      isPublished: problemData.isPublished !== undefined ? problemData.isPublished : true,
      version: 1,
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProb, ...codingProblemsList];
    setCodingProblemsList(updated);
    localStorage.setItem('questify_coding_problems', JSON.stringify(updated));
    addToast({ type: 'success', title: 'Problem Created', message: `Coding problem "${newProb.title}" is saved.` });
    return newProb;
  };

  const updateCodingProblem = async (id: string, updates: Partial<CodingProblem>): Promise<CodingProblem> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can manage coding problems.');
    }
    const updated = codingProblemsList.map((p) => (p.id === id ? { ...p, ...updates, version: (p.version || 1) + 1, updatedAt: new Date().toISOString() } : p));
    setCodingProblemsList(updated);
    localStorage.setItem('questify_coding_problems', JSON.stringify(updated));
    const modified = updated.find((p) => p.id === id)!;
    addToast({ type: 'success', title: 'Problem Updated', message: `Problem "${modified.title}" (v${modified.version}) saved.` });
    return modified;
  };

  const deleteCodingProblem = async (id: string): Promise<boolean> => {
    if (user.role !== 'faculty') {
      throw new Error('Unauthorized: Only faculty can manage coding problems.');
    }
    const filtered = codingProblemsList.filter((p) => p.id !== id);
    setCodingProblemsList(filtered);
    localStorage.setItem('questify_coding_problems', JSON.stringify(filtered));
    addToast({ type: 'info', title: 'Problem Deleted', message: 'Coding problem removed.' });
    return true;
  };

  // --------------------------------------------------------------------------
  // Curriculum Management (Data-Driven Courses, Modules & Lessons)
  // --------------------------------------------------------------------------
  const logCurriculumAction = (
    action: string,
    entityType: 'course' | 'module' | 'lesson',
    entityId: string,
    details: Record<string, any>
  ) => {
    const entry: CurriculumAuditLog = {
      id: 'cal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      userId: user.id,
      userEmail: user.email || 'faculty@msot.edu',
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setCurriculumAuditLogs((prev) => [entry, ...prev]);
  };

  const createCourse = async (data: Partial<Course>): Promise<{ success: boolean; course?: Course; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can create courses.' };
    }
    if (!data.title?.trim() || !data.code?.trim()) {
      return { success: false, error: 'Course code and title are required.' };
    }

    const code = data.code.trim().toUpperCase();
    const newCourse: Course = {
      id: 'course-' + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString().slice(-4),
      code,
      title: data.title.trim(),
      term: data.term?.trim() || 'Fall 2026',
      status: data.status || 'draft',
      createdBy: user.id,
      orderIndex: courses.length + 1,
      updatedAt: new Date().toISOString(),
      modules: [],
    };

    setCourses((prev) => [...prev, newCourse]);
    logCurriculumAction('create_course', 'course', newCourse.id, { code: newCourse.code, title: newCourse.title });
    addToast({ type: 'success', title: 'Course Created', message: `${newCourse.code}: ${newCourse.title} added in draft mode.` });
    return { success: true, course: newCourse };
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can update courses.' };
    }

    let found = false;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          found = true;
          return { ...c, ...updates, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    if (!found) return { success: false, error: 'Course not found.' };
    logCurriculumAction('update_course', 'course', courseId, updates);
    addToast({ type: 'success', title: 'Course Saved', message: 'Course details updated successfully.' });
    return { success: true };
  };

  const deleteCourse = async (courseId: string): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can delete courses.' };
    }

    const target = courses.find((c) => c.id === courseId);
    if (!target) return { success: false, error: 'Course not found.' };

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    logCurriculumAction('delete_course', 'course', courseId, { code: target.code, title: target.title });
    addToast({ type: 'info', title: 'Course Deleted', message: `Course ${target.code} has been deleted.` });
    return { success: true };
  };

  const duplicateCourse = async (courseId: string): Promise<{ success: boolean; newCourseId?: string; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can duplicate courses.' };
    }

    const source = courses.find((c) => c.id === courseId);
    if (!source) return { success: false, error: 'Course not found.' };

    const newCourseId = `course-${source.code.toLowerCase()}-copy-${Date.now().toString().slice(-4)}`;

    const idMap = new Map<string, string>();
    (source.modules || []).forEach((m) => {
      idMap.set(m.id, `mod-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(2, 6)}`);
    });

    const clonedModules: CurriculumModule[] = (source.modules || []).map((m) => {
      const newModId = idMap.get(m.id)!;
      return {
        ...m,
        id: newModId,
        courseId: newCourseId,
        prerequisiteModuleIds: (m.prerequisiteModuleIds || []).map((oldPrereqId) => idMap.get(oldPrereqId) || oldPrereqId),
        lessons: (m.lessons || []).map((l, lIdx) => ({
          ...l,
          id: `l-${newModId.slice(-4)}-${lIdx + 1}`,
          moduleId: newModId,
        })),
      };
    });

    const duplicated: Course = {
      ...source,
      id: newCourseId,
      code: `${source.code}_COPY`,
      title: `${source.title} (Copy)`,
      status: 'draft',
      createdBy: user.id,
      orderIndex: courses.length + 1,
      updatedAt: new Date().toISOString(),
      modules: clonedModules,
    };

    setCourses((prev) => [...prev, duplicated]);
    logCurriculumAction('duplicate_course', 'course', duplicated.id, { sourceCourseId: courseId });
    addToast({ type: 'success', title: 'Course Duplicated', message: `Created draft copy: ${duplicated.title}` });
    return { success: true, newCourseId: duplicated.id };
  };

  const publishCourse = async (courseId: string): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can publish courses.' };
    }

    const target = courses.find((c) => c.id === courseId);
    if (!target) return { success: false, error: 'Course not found.' };

    const cycleCheck = detectCycle(target.modules || []);
    if (cycleCheck.hasCycle) {
      const cycleMsg = cycleCheck.cyclePath ? cycleCheck.cyclePath.join(' -> ') : 'Circular loop';
      return { success: false, error: `Cannot publish: Circular prerequisite chain detected: ${cycleMsg}` };
    }

    return updateCourse(courseId, { status: 'published' });
  };

  const archiveCourse = async (courseId: string): Promise<{ success: boolean; error?: string }> => {
    return updateCourse(courseId, { status: 'archived' });
  };

  const addModule = async (
    courseId: string,
    moduleData: Partial<CurriculumModule>
  ): Promise<{ success: boolean; module?: CurriculumModule; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can add modules.' };
    }
    if (!moduleData.title?.trim()) {
      return { success: false, error: 'Module title is required.' };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, error: 'Course not found.' };

    const existingModules = course.modules || [];
    const newModuleId = 'mod-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).slice(2, 5);

    const newModule: CurriculumModule = {
      id: newModuleId,
      courseId,
      orderIndex: existingModules.length + 1,
      groupLabel: moduleData.groupLabel?.trim() || `Module ${existingModules.length + 1}`,
      title: moduleData.title.trim(),
      description: moduleData.description?.trim() || '',
      xpReward: Math.max(0, moduleData.xpReward ?? 50),
      status: moduleData.status || 'published',
      keyConcepts: moduleData.keyConcepts || [],
      prerequisiteModuleIds: moduleData.prerequisiteModuleIds || [],
      lessons: moduleData.lessons || [],
      updatedAt: new Date().toISOString(),
    };

    const simulated = [...existingModules, newModule];
    const cycleCheck = detectCycle(simulated);
    if (cycleCheck.hasCycle) {
      return { success: false, error: 'Circular prerequisite dependency detected. Module cannot require itself or create a dependency loop.' };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            modules: [...(c.modules || []), newModule],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logCurriculumAction('add_module', 'module', newModule.id, { courseId, title: newModule.title });
    addToast({ type: 'success', title: 'Module Added', message: `Module "${newModule.title}" added to syllabus.` });
    return { success: true, module: newModule };
  };

  const updateModule = async (
    courseId: string,
    moduleId: string,
    updates: Partial<CurriculumModule>
  ): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can update modules.' };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, error: 'Course not found.' };

    const existingModules = course.modules || [];
    const simulated = existingModules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m));

    if (updates.prerequisiteModuleIds) {
      const cycleCheck = detectCycle(simulated);
      if (cycleCheck.hasCycle) {
        return { success: false, error: 'Circular prerequisite chain detected. Please resolve prerequisite loops before saving.' };
      }
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            modules: simulated,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logCurriculumAction('update_module', 'module', moduleId, { courseId, updates });
    addToast({ type: 'success', title: 'Module Saved', message: 'Module details and prerequisites updated.' });
    return { success: true };
  };

  const deleteModule = async (courseId: string, moduleId: string): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can delete modules.' };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, error: 'Course not found.' };

    const dependents = getDependentModules(moduleId, course.modules || []);
    if (dependents.length > 0) {
      const titles = dependents.map((d) => `"${d.title}"`).join(', ');
      return {
        success: false,
        error: `Cannot delete module because ${dependents.length} other module(s) require it as a prerequisite: ${titles}. Please reassign their prerequisites first.`,
      };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const filtered = (c.modules || []).filter((m) => m.id !== moduleId);
          const reindexed = filtered.map((m, idx) => ({ ...m, orderIndex: idx + 1 }));
          return { ...c, modules: reindexed, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    logCurriculumAction('delete_module', 'module', moduleId, { courseId });
    addToast({ type: 'info', title: 'Module Deleted', message: 'The curriculum module was removed.' });
    return { success: true };
  };

  const reorderModules = async (courseId: string, moduleIdsInOrder: string[]): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can reorder modules.' };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const modMap = new Map((c.modules || []).map((m) => [m.id, m]));
          const reordered: CurriculumModule[] = [];
          moduleIdsInOrder.forEach((id, idx) => {
            const m = modMap.get(id);
            if (m) reordered.push({ ...m, orderIndex: idx + 1 });
          });
          return { ...c, modules: reordered, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    logCurriculumAction('reorder_modules', 'module', courseId, { moduleIdsInOrder });
    return { success: true };
  };

  const addLesson = async (
    courseId: string,
    moduleId: string,
    lessonData: Partial<CurriculumLesson>
  ): Promise<{ success: boolean; lesson?: CurriculumLesson; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can manage lessons.' };
    }
    if (!lessonData.title?.trim()) {
      return { success: false, error: 'Lesson title is required.' };
    }

    const newLessonId = 'l-' + moduleId.slice(-4) + '-' + Date.now().toString().slice(-4);
    const newLesson: CurriculumLesson = {
      id: newLessonId,
      moduleId,
      orderIndex: 99,
      title: lessonData.title.trim(),
      summary: lessonData.summary?.trim() || '',
      contentOrLink: lessonData.contentOrLink?.trim() || '',
      lessonType: lessonData.lessonType || 'reading',
      linkedProblemIds: lessonData.linkedProblemIds || [],
      xpValue: Math.max(0, lessonData.xpValue ?? 20),
      keyConcepts: lessonData.keyConcepts || [],
      isOptional: Boolean(lessonData.isOptional),
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              const currentLessons = m.lessons || [];
              newLesson.orderIndex = currentLessons.length + 1;
              return {
                ...m,
                lessons: [...currentLessons, newLesson],
                updatedAt: new Date().toISOString(),
              };
            }
            return m;
          });
          return { ...c, modules: updatedModules, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    logCurriculumAction('add_lesson', 'lesson', newLesson.id, { courseId, moduleId, title: newLesson.title });
    addToast({ type: 'success', title: 'Lesson Created', message: `Lesson "${newLesson.title}" added to module.` });
    return { success: true, lesson: newLesson };
  };

  const updateLesson = async (
    courseId: string,
    moduleId: string,
    lessonId: string,
    updates: Partial<CurriculumLesson>
  ): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can manage lessons.' };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              const updatedLessons = (m.lessons || []).map((l) => (l.id === lessonId ? { ...l, ...updates } : l));
              return { ...m, lessons: updatedLessons, updatedAt: new Date().toISOString() };
            }
            return m;
          });
          return { ...c, modules: updatedModules, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    logCurriculumAction('update_lesson', 'lesson', lessonId, { courseId, moduleId, updates });
    addToast({ type: 'success', title: 'Lesson Saved', message: 'Lesson updated successfully.' });
    return { success: true };
  };

  const deleteLesson = async (courseId: string, moduleId: string, lessonId: string): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can manage lessons.' };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              const filtered = (m.lessons || []).filter((l) => l.id !== lessonId);
              const reindexed = filtered.map((l, idx) => ({ ...l, orderIndex: idx + 1 }));
              return { ...m, lessons: reindexed, updatedAt: new Date().toISOString() };
            }
            return m;
          });
          return { ...c, modules: updatedModules, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    logCurriculumAction('delete_lesson', 'lesson', lessonId, { courseId, moduleId });
    addToast({ type: 'info', title: 'Lesson Removed', message: 'The lesson was deleted from this milestone.' });
    return { success: true };
  };

  const reorderLessons = async (
    courseId: string,
    moduleId: string,
    lessonIdsInOrder: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can reorder lessons.' };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              const lessonMap = new Map((m.lessons || []).map((l) => [l.id, l]));
              const reordered: CurriculumLesson[] = [];
              lessonIdsInOrder.forEach((id, idx) => {
                const l = lessonMap.get(id);
                if (l) reordered.push({ ...l, orderIndex: idx + 1 });
              });
              return { ...m, lessons: reordered, updatedAt: new Date().toISOString() };
            }
            return m;
          });
          return { ...c, modules: updatedModules, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    return { success: true };
  };

  const importCourseSyllabus = async (courseData: Course): Promise<{ success: boolean; error?: string }> => {
    if (user.role !== 'faculty') {
      return { success: false, error: 'Unauthorized: Only faculty can import curriculum.' };
    }

    const cycleCheck = detectCycle(courseData.modules || []);
    if (cycleCheck.hasCycle) {
      return { success: false, error: 'Import failed: Syllabus contains a circular prerequisite loop.' };
    }

    const importedCourse: Course = {
      ...courseData,
      id: courseData.id || `course-${(courseData.code || 'imported').toLowerCase()}-${Date.now().toString().slice(-4)}`,
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    setCourses((prev) => {
      const exists = prev.some((c) => c.id === importedCourse.id);
      if (exists) {
        return prev.map((c) => (c.id === importedCourse.id ? importedCourse : c));
      }
      return [...prev, importedCourse];
    });

    logCurriculumAction('import_syllabus', 'course', importedCourse.id, { code: importedCourse.code, title: importedCourse.title });
    addToast({ type: 'success', title: 'Syllabus Imported', message: `Course ${importedCourse.code} imported successfully with ${(importedCourse.modules || []).length} modules.` });
    return { success: true };
  };

  const completeCurriculumLesson = async (
    courseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<{ success: boolean; xpAwarded?: number; moduleCompleted?: boolean; error?: string }> => {
    if (completedLessonIds.includes(lessonId)) {
      return { success: true, xpAwarded: 0 };
    }

    const course = courses.find((c) => c.id === courseId);
    const moduleItem = course?.modules?.find((m) => m.id === moduleId);
    const lessonItem = moduleItem?.lessons?.find((l) => l.id === lessonId);

    if (!course || !moduleItem || !lessonItem) {
      return { success: false, error: 'Lesson or module not found' };
    }

    setCompletedLessonIds((prev) => [...prev, lessonId]);

    let totalXpAwarded = 0;
    if (lessonItem.xpValue > 0) {
      awardXp(lessonItem.xpValue, `Lesson Completed: ${lessonItem.title}`, 'assignment');
      totalXpAwarded += lessonItem.xpValue;
    }

    let isModuleDone = false;
    setStudentModuleProgress((prev) => {
      const existing = prev.find((p) => p.studentId === user.id && p.moduleId === moduleId);
      const updatedLessons = existing ? Array.from(new Set([...existing.lessonsCompleted, lessonId])) : [lessonId];

      const allReqLessons = (moduleItem.lessons || []).filter((l) => !l.isOptional);
      const allDone = allReqLessons.length > 0 && allReqLessons.every((l) => updatedLessons.includes(l.id));

      if (allDone && (!existing || existing.status !== 'completed')) {
        isModuleDone = true;
      }

      if (existing) {
        return prev.map((p) =>
          p.studentId === user.id && p.moduleId === moduleId
            ? {
                ...p,
                lessonsCompleted: updatedLessons,
                status: allDone ? 'completed' : 'in_progress',
                completedAt: allDone ? new Date().toISOString() : p.completedAt,
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            studentId: user.id,
            moduleId,
            lessonsCompleted: updatedLessons,
            status: allDone ? 'completed' : 'in_progress',
            completedAt: allDone ? new Date().toISOString() : undefined,
            xpAwarded: 0,
          },
        ];
      }
    });

    if (isModuleDone) {
      await completeCurriculumModule(courseId, moduleId);
    }

    return { success: true, xpAwarded: totalXpAwarded, moduleCompleted: isModuleDone };
  };

  const completeCurriculumModule = async (
    courseId: string,
    moduleId: string
  ): Promise<{ success: boolean; xpAwarded?: number; error?: string }> => {
    const course = courses.find((c) => c.id === courseId);
    const targetModule = course?.modules?.find((m) => m.id === moduleId);

    if (!course || !targetModule) {
      return { success: false, error: 'Module or course not found.' };
    }

    // Prerequisite check
    const completedSet = new Set(
      studentModuleProgress.filter((p) => p.studentId === user.id && p.status === 'completed').map((p) => p.moduleId)
    );

    const reqs = targetModule.prerequisiteModuleIds || [];
    const missingReqs = reqs.filter((r) => !completedSet.has(r));
    if (missingReqs.length > 0) {
      const missingTitles = missingReqs.map((rId) => {
        const found = course.modules?.find((m) => m.id === rId);
        return found ? found.title : rId;
      });
      addToast({
        type: 'error',
        title: 'Prerequisite Locked',
        message: `You must first master: ${missingTitles.join(', ')}`,
      });
      return { success: false, error: `Prerequisites not satisfied: ${missingTitles.join(', ')}` };
    }

    const existingProgress = studentModuleProgress.find((p) => p.studentId === user.id && p.moduleId === moduleId);
    if (existingProgress && existingProgress.status === 'completed' && existingProgress.xpAwarded > 0) {
      return { success: true, xpAwarded: 0 };
    }

    const xpToAward = targetModule.xpReward || 50;
    awardXp(xpToAward, `Module Milestone Mastered: ${targetModule.title}`, 'assignment');
    triggerCelebration();

    setStudentModuleProgress((prev) => {
      const exists = prev.find((p) => p.studentId === user.id && p.moduleId === moduleId);
      if (exists) {
        return prev.map((p) =>
          p.studentId === user.id && p.moduleId === moduleId
            ? {
                ...p,
                status: 'completed',
                completedAt: new Date().toISOString(),
                xpAwarded: xpToAward,
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            studentId: user.id,
            moduleId,
            lessonsCompleted: (targetModule.lessons || []).map((l) => l.id),
            status: 'completed',
            completedAt: new Date().toISOString(),
            xpAwarded: xpToAward,
          },
        ];
      }
    });

    addToast({
      type: 'success',
      title: 'Milestone Completed!',
      message: `Mastered "${targetModule.title}"! +${xpToAward} XP awarded.`,
    });

    return { success: true, xpAwarded: xpToAward };
  };

  // 17. Points Economy & Verified Sources Management
  const importAttendance = async (
    records: { classSessionId: string; studentId: string; courseCode: string; sessionDate: string; status: 'present' | 'absent' | 'excused' }[]
  ): Promise<{ importedCount: number; errors: { row: number; reason: string }[] }> => {
    const errors: { row: number; reason: string }[] = [];
    const validRecords: AttendanceRecord[] = [];
    let importedCount = 0;

    records.forEach((rec, idx) => {
      const rowNum = idx + 1;
      const cleanStudentId = rec.studentId?.trim().toUpperCase();
      if (!cleanStudentId) {
        errors.push({ row: rowNum, reason: 'Missing student ID' });
        return;
      }
      const student = roster.find((r) => r.studentId.toUpperCase() === cleanStudentId);
      if (!student) {
        errors.push({ row: rowNum, reason: `Student ID "${cleanStudentId}" not found in campus roster` });
        return;
      }
      if (!rec.classSessionId || !rec.courseCode) {
        errors.push({ row: rowNum, reason: 'Missing class session ID or course code' });
        return;
      }

      const exists = attendanceRecords.some(
        (a) => a.classSessionId === rec.classSessionId && a.studentId.toUpperCase() === cleanStudentId
      );
      if (exists) {
        errors.push({ row: rowNum, reason: `Attendance already recorded for session ${rec.classSessionId}` });
        return;
      }

      const newAttRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${idx}`,
        classSessionId: rec.classSessionId,
        studentId: cleanStudentId,
        studentName: student.fullName,
        courseCode: rec.courseCode,
        sessionDate: rec.sessionDate || new Date().toISOString().split('T')[0],
        status: rec.status,
        verifiedBy: user.name,
        verifiedAt: new Date().toISOString(),
        xpAwarded: rec.status === 'present' ? xpRules.rewards.attendanceClass : 0,
      };

      validRecords.push(newAttRecord);
      importedCount++;

      if (rec.status === 'present') {
        if (cleanStudentId === user.collegeId.toUpperCase()) {
          awardXp(
            xpRules.rewards.attendanceClass,
            `Attended Class: ${rec.courseCode}`,
            'attendance',
            'attendance',
            rec.classSessionId,
            { courseCode: rec.courseCode, sessionDate: rec.sessionDate }
          );
        } else {
          const newTx: XpTransaction = {
            id: `tx-att-${Date.now()}-${idx}`,
            userId: cleanStudentId,
            studentId: cleanStudentId,
            studentName: student.fullName,
            actionType: 'attendance',
            referenceId: rec.classSessionId,
            amount: xpRules.rewards.attendanceClass,
            description: `Attended Class: ${rec.courseCode}`,
            source: 'official_attendance_roster',
            metadata: { courseCode: rec.courseCode, sessionDate: rec.sessionDate },
            isVoided: false,
            createdAt: new Date().toISOString(),
          };
          setXpTransactions((prev) => [newTx, ...prev]);
        }
      }
    });

    if (validRecords.length > 0) {
      setAttendanceRecords((prev) => [...validRecords, ...prev]);
    }

    addToast({
      type: errors.length > 0 && validRecords.length === 0 ? 'info' : 'success',
      title: 'Attendance Import Complete',
      message: `Processed ${importedCount} attendance records. ${errors.length} rows had errors.`,
    });

    return { importedCount, errors };
  };

  const createAssignment = async (
    title: string,
    courseCode: string,
    dueAt: string,
    targetBatches: string[]
  ): Promise<Assignment> => {
    const newAss: Assignment = {
      id: `asg-${Date.now()}`,
      title,
      courseCode,
      dueAt,
      targetBatches,
      xpOnTime: xpRules.rewards.assignmentOnTime,
      createdAt: new Date().toISOString(),
      createdByName: user.name,
    };
    setAssignments((prev) => [newAss, ...prev]);
    addToast({
      type: 'success',
      title: 'Assignment Created',
      message: `"${title}" published for ${targetBatches.join(', ')}. On-time submission: +${xpRules.rewards.assignmentOnTime} XP.`,
    });
    return newAss;
  };

  const submitAssignment = async (
    assignmentId: string,
    studentId: string
  ): Promise<{ success: boolean; isOnTime: boolean; xpAwarded: number; error?: string }> => {
    const cleanStudentId = studentId.toUpperCase().trim();
    const ass = assignments.find((a) => a.id === assignmentId);
    if (!ass) return { success: false, isOnTime: false, xpAwarded: 0, error: 'Assignment not found.' };

    const existingSub = assignmentSubmissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId.toUpperCase() === cleanStudentId
    );
    if (existingSub) {
      return { success: false, isOnTime: false, xpAwarded: 0, error: 'Assignment already submitted.' };
    }

    const now = new Date();
    const dueDate = new Date(ass.dueAt);
    const isOnTime = now <= dueDate;
    const xpAwarded = isOnTime ? xpRules.rewards.assignmentOnTime : 0;

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: cleanStudentId,
      submittedAt: now.toISOString(),
      isOnTime,
      status: 'submitted',
      xpAwarded,
    };

    setAssignmentSubmissions((prev) => [newSub, ...prev]);

    if (isOnTime) {
      if (cleanStudentId === user.collegeId.toUpperCase()) {
        awardXp(
          xpAwarded,
          `On-Time Assignment Submission: ${ass.title}`,
          'assignment',
          'assignment',
          assignmentId,
          { courseCode: ass.courseCode }
        );
      } else {
        const student = roster.find((r) => r.studentId.toUpperCase() === cleanStudentId);
        const newTx: XpTransaction = {
          id: `tx-asg-${Date.now()}`,
          userId: cleanStudentId,
          studentId: cleanStudentId,
          studentName: student?.fullName || cleanStudentId,
          actionType: 'assignment',
          referenceId: assignmentId,
          amount: xpAwarded,
          description: `On-Time Assignment Submission: ${ass.title}`,
          source: 'lms_assignment_submission',
          metadata: { courseCode: ass.courseCode },
          isVoided: false,
          createdAt: now.toISOString(),
        };
        setXpTransactions((prev) => [newTx, ...prev]);
      }
      addToast({
        type: 'success',
        title: 'Assignment Submitted On-Time!',
        message: `+${xpAwarded} XP awarded for on-time submission of "${ass.title}".`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Late Submission Recorded',
        message: 'Assignment received. Academic evaluation preserved, but on-time XP is not eligible.',
      });
    }

    return { success: true, isOnTime, xpAwarded };
  };

  const importTestResults = async (
    results: { testId: string; testName: string; studentId: string; scorePercent: number }[]
  ): Promise<{ importedCount: number; errors: { row: number; reason: string }[] }> => {
    const errors: { row: number; reason: string }[] = [];
    const validResults: TestResult[] = [];
    let importedCount = 0;

    results.forEach((rec, idx) => {
      const rowNum = idx + 1;
      const cleanStudentId = rec.studentId?.trim().toUpperCase();
      if (!cleanStudentId) {
        errors.push({ row: rowNum, reason: 'Missing student ID' });
        return;
      }
      const student = roster.find((r) => r.studentId.toUpperCase() === cleanStudentId);
      if (!student) {
        errors.push({ row: rowNum, reason: `Student ID "${cleanStudentId}" not found in campus roster` });
        return;
      }
      if (typeof rec.scorePercent !== 'number' || rec.scorePercent < 0 || rec.scorePercent > 100) {
        errors.push({ row: rowNum, reason: `Invalid score percentage: ${rec.scorePercent}` });
        return;
      }

      const exists = testResults.some(
        (t) => t.testId === rec.testId && t.studentId.toUpperCase() === cleanStudentId
      );
      if (exists) {
        errors.push({ row: rowNum, reason: `Test result already imported for ${cleanStudentId}` });
        return;
      }

      const xp = xpRules.rewards.biweeklyTestScore(rec.scorePercent);

      const newResult: TestResult = {
        id: `tr-${Date.now()}-${idx}`,
        testId: rec.testId,
        testName: rec.testName,
        studentId: cleanStudentId,
        studentName: student.fullName,
        scorePercent: rec.scorePercent,
        xpAwarded: xp,
        verifiedBy: user.name,
        verifiedAt: new Date().toISOString(),
      };

      validResults.push(newResult);
      importedCount++;

      if (cleanStudentId === user.collegeId.toUpperCase()) {
        awardXp(
          xp,
          `Bi-weekly Test: ${rec.testName} (${rec.scorePercent}%)`,
          'test',
          'biweekly_test',
          rec.testId,
          { scorePercent: rec.scorePercent }
        );
      } else {
        const newTx: XpTransaction = {
          id: `tx-test-${Date.now()}-${idx}`,
          userId: cleanStudentId,
          studentId: cleanStudentId,
          studentName: student.fullName,
          actionType: 'biweekly_test',
          referenceId: rec.testId,
          amount: xp,
          description: `Bi-weekly Test: ${rec.testName} (${rec.scorePercent}%)`,
          source: 'faculty_gradebook_import',
          metadata: { scorePercent: rec.scorePercent },
          isVoided: false,
          createdAt: new Date().toISOString(),
        };
        setXpTransactions((prev) => [newTx, ...prev]);
      }
    });

    if (validResults.length > 0) {
      setTestResults((prev) => [...validResults, ...prev]);
    }

    addToast({
      type: errors.length > 0 && validResults.length === 0 ? 'info' : 'success',
      title: 'Test Marks Imported',
      message: `Processed ${importedCount} test marks. ${errors.length} errors found.`,
    });

    return { importedCount, errors };
  };

  const createClubSession = async (
    clubName: string,
    sessionTitle: string,
    sessionDate: string
  ): Promise<ClubSession> => {
    const newSession: ClubSession = {
      id: `club-sess-${Date.now()}`,
      clubName,
      sessionTitle,
      sessionDate,
      verifiedBy: user.name,
      createdAt: new Date().toISOString(),
    };
    setClubSessions((prev) => [newSession, ...prev]);
    addToast({
      type: 'success',
      title: 'Club Session Created',
      message: `Created "${sessionTitle}" for ${clubName}. Verified attendance: +${xpRules.table.clubActivity} XP.`,
    });
    return newSession;
  };

  const markClubAttendance = async (
    clubSessionId: string,
    studentIds: string[]
  ): Promise<{ count: number; error?: string }> => {
    const session = clubSessions.find((s) => s.id === clubSessionId);
    if (!session) return { count: 0, error: 'Club session not found.' };

    let count = 0;
    const newClubAtts: ClubAttendance[] = [];

    studentIds.forEach((sid) => {
      const cleanId = sid.trim().toUpperCase();
      const student = roster.find((r) => r.studentId.toUpperCase() === cleanId);
      if (!student) return;

      const already = clubAttendance.some(
        (ca) => ca.clubSessionId === clubSessionId && ca.studentId.toUpperCase() === cleanId
      );
      if (already) return;

      newClubAtts.push({
        id: `ca-${Date.now()}-${cleanId}`,
        clubSessionId,
        studentId: cleanId,
        markedAt: new Date().toISOString(),
        xpAwarded: xpRules.table.clubActivity,
      });
      count++;

      if (cleanId === user.collegeId.toUpperCase()) {
        awardXp(
          xpRules.table.clubActivity,
          `Club Activity: ${session.clubName} - ${session.sessionTitle}`,
          'club',
          'club_activity',
          clubSessionId,
          { clubName: session.clubName }
        );
      } else {
        const newTx: XpTransaction = {
          id: `tx-club-${Date.now()}-${cleanId}`,
          userId: cleanId,
          studentId: cleanId,
          studentName: student.fullName,
          actionType: 'club_activity',
          referenceId: clubSessionId,
          amount: xpRules.table.clubActivity,
          description: `Club Activity: ${session.clubName} - ${session.sessionTitle}`,
          source: 'club_faculty_lead_verification',
          metadata: { clubName: session.clubName },
          isVoided: false,
          createdAt: new Date().toISOString(),
        };
        setXpTransactions((prev) => [newTx, ...prev]);
      }
    });

    if (newClubAtts.length > 0) {
      setClubAttendance((prev) => [...newClubAtts, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Club Attendance Confirmed',
      message: `Awarded +${xpRules.table.clubActivity} XP to ${count} students for ${session.clubName}.`,
    });

    return { count };
  };

  const toggleLeaderboardOptOut = async () => {
    const nextVal = !user.leaderboardOptOut;
    setUser((prev) => ({ ...prev, leaderboardOptOut: nextVal }));
    setRoster((prev) =>
      prev.map((r) => (r.studentId.toUpperCase() === user.collegeId.toUpperCase() ? { ...r, leaderboardOptOut: nextVal } : r))
    );

    if (isSupabaseActive && supabase) {
      await supabase.from('profiles').update({ leaderboard_opt_out: nextVal }).eq('id', user.id);
    }

    addToast({
      type: 'info',
      title: nextVal ? 'Opted Out of Public Leaderboards' : 'Opted In to Public Leaderboards',
      message: nextVal
        ? 'Your name and rank are now hidden from public leaderboards. Your XP and personal progress remain active.'
        : 'Your rank and points are now visible to your cohort on leaderboards.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        roster,
        xpActivities,
        xpTransactions,
        attendanceRecords,
        assignments,
        assignmentSubmissions,
        testResults,
        clubSessions,
        clubAttendance,
        leaderboardPeriods,
        achievements,
        rewards,
        peerHelpRequests,
        discussions,
        announcements,
        battles,
        facultyData,
        quizAttempt,
        completedLessonIds,
        solvedProblemIds,
        toasts,
        isSearchOpen,
        setIsSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSupabaseActive,
        isAuthLoading,
        soundEnabled,
        setSoundEnabled,
        awardXp,
        voidXp,
        importAttendance,
        createAssignment,
        submitAssignment,
        importTestResults,
        createClubSession,
        markClubAttendance,
        toggleLeaderboardOptOut,
        acceptDiscussionAnswer,
        triggerCelebration,
        removeToast,
        addToast,
        verifyRosterId,
        activateStudentAccount,
        signInWithStudentId,
        addRosterStudent,
        importRosterCsv,
        changePassword,
        requestPasswordReset,
        signOutUser,
        switchUserRole,
        recordQuizAttempt,
        createPeerHelpRequest,
        addPeerHelpResponse,
        acceptPeerHelp,
        createDiscussionThread,
        addDiscussionReply,
        deleteDiscussionThread,
        deleteDiscussionReply,
        moderateDiscussion,
        markAnnouncementAsRead,
        createAnnouncement,
        deleteAnnouncement,
        createBattle,
        joinBattleTeam,
        createBattleTeam,
        submitBattleChallenge,
        submitBattleQuizChallenge,
        submitBattleCodingChallenge,
        completeLesson,
        recordProblemSolved,
        dismissIncident,
        confirmIncident,
        reverseIncidentXp,
        adminResetPassword,
        redeemReward,
        customQuizzes,
        customAttempts,
        facultyAllowlist,
        createCustomQuiz,
        updateCustomQuiz,
        deleteCustomQuiz,
        duplicateCustomQuiz,
        rescoreCustomQuiz,
        submitCustomQuizAttempt,
        getQuizAnalytics,
        signInWithFacultyGoogle,
        verifyFacultySession,
        dailyQuests,
        dailyQuestAttempts,
        submitDailyQuestAnswer,
        submitDailyQuestCoding,
        createDailyQuest,
        updateDailyQuest,
        deleteDailyQuest,
        codingProblemsList,
        createCodingProblem,
        updateCodingProblem,
        deleteCodingProblem,
        reduceTransparency,
        toggleReduceTransparency,
        courses,
        studentModuleProgress,
        curriculumAuditLogs,
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
        completeCurriculumLesson,
        completeCurriculumModule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
