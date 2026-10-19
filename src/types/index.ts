export type LeagueName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
export type UserRole = 'student' | 'faculty';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  collegeId: string; // The official Student / Mains ID (e.g. Mains-24813)
  major: string;
  semester: string;
  role: UserRole;
  isOnboarded: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpNeededForLevel: number;
  streakDays: number;
  streakHistory: { day: string; date: string; completed: boolean; isToday?: boolean; isFreeze?: boolean }[];
  streakFreezeCount: number;
  league: LeagueName;
  classRank: number;
  totalInClass: number;
  coursesCompleted: number;
  codingProblemsSolved: number;
  quizAccuracy: number;
  batch?: string;
  reduceTransparency?: boolean;
  leaderboardOptOut?: boolean;
}

export interface RosterStudent {
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  batch: string;
  role: UserRole;
  isActivated: boolean;
  activatedAt?: string;
  leaderboardOptOut?: boolean;
}

export interface FacultyAllowlistEntry {
  email: string;
  fullName: string;
  department: string;
  addedBy?: string;
  createdAt?: string;
}

export type QuestionType = 'single_mcq' | 'multi_mcq' | 'true_false' | 'short_numeric';
export type QuizStatus = 'draft' | 'scheduled' | 'live' | 'closed' | 'archived';
export type AnswerVisibility = 'immediately' | 'after_close' | 'never';

export interface CustomQuizQuestion {
  id: string;
  quizId?: string;
  questionType: QuestionType;
  questionText: string;
  options: string[]; // Options for MCQ / True-False
  correctAnswers: number[]; // Indices for MCQ / True-False (0=True, 1=False)
  numericAnswer?: number; // Target for short_numeric
  tolerance?: number; // Acceptable delta for short_numeric
  explanation: string;
  marks: number;
  imageUrl?: string;
  orderIndex: number;
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  courseTag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetBatches: string[];
  openAt: string; // ISO 8601
  closeAt: string; // ISO 8601
  timezone: string;
  timeLimitMins: number;
  perQuestionTimeLimitSecs?: number;
  questionsToServe?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  answerVisibility: AnswerVisibility;
  questionXp: number;
  completionBonusXp: number;
  status: QuizStatus;
  version: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  questions: CustomQuizQuestion[];
  attemptsCount?: number;
}

export interface CustomQuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  studentName: string;
  studentId: string;
  score: number;
  maxScore: number;
  xpEarned: number;
  startedAt: string;
  completedAt: string;
  isEvaluated: boolean;
  attemptVersion: number;
  answers: {
    questionId: string;
    selectedOptions?: number[];
    numericAnswer?: number;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
}

export interface QuizAnalytics {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageTimeSecs: number;
  scoreDistribution: { range: string; count: number }[];
  questionStats: {
    questionId: string;
    questionText: string;
    accuracyPercent: number;
    attemptCount: number;
    mostMissedChoice?: string;
  }[];
  studentAttempts: CustomQuizAttempt[];
  integrityFlags: IntegrityFlag[];
}

export interface XpActivity {
  id: string;
  timestamp: string;
  action: string;
  category: 'attendance' | 'quiz' | 'assignment' | 'coding' | 'peer_help' | 'streak_bonus' | 'league' | 'battles' | 'test' | 'club';
  amount: number;
  verified: boolean;
  academicImpact: 'none'; // strictly non-academic mark per MSOT rules
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
  topic: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  xpAwarded: number;
  userAnswers: number[]; // student's selected indices
  isEvaluated: boolean;
  completedAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'archived';
export type ModuleStatus = 'draft' | 'published';
export type LessonType = 'reading' | 'video' | 'quiz' | 'coding';
export type StudentModuleStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  orderIndex: number;
  title: string;
  contentOrLink?: string;
  summary?: string;
  lessonType?: LessonType;
  linkedProblemIds?: string[];
  xpValue: number;
  keyConcepts?: string[];
  isOptional?: boolean;
  prerequisiteLessonIds?: string[];
}

export interface CurriculumModule {
  id: string;
  courseId: string;
  orderIndex: number;
  groupLabel: string;
  title: string;
  description: string;
  xpReward: number;
  status: ModuleStatus;
  keyConcepts?: string[];
  prerequisiteModuleIds: string[];
  lessons: CurriculumLesson[];
  updatedAt?: string;
}

export interface Course {
  id: string;
  code: string; // e.g. 'CS201'
  title: string;
  term: string;
  status: CourseStatus;
  createdBy: string;
  updatedAt: string;
  orderIndex?: number;
  modules?: CurriculumModule[];
}

export interface ModulePrerequisite {
  moduleId: string;
  requiresModuleId: string;
}

export interface StudentModuleProgress {
  studentId: string;
  moduleId: string;
  lessonsCompleted: string[];
  status: StudentModuleStatus;
  completedAt?: string;
  xpAwarded: number;
}

export interface CurriculumAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'course' | 'module' | 'lesson';
  entityId: string;
  details: Record<string, any>;
  createdAt: string;
}

// Backward-compatibility aliases for existing components
export type CourseLesson = CurriculumLesson;
export interface CourseNode {
  id: string;
  courseId: string;
  title: string;
  module: string;
  orderIndex: number;
  status: 'completed' | 'current' | 'locked';
  xpValue: number;
  lessons: CourseLesson[];
  lessonsCount: number;
  completedLessons: number;
  summary: string;
  keyConcepts: string[];
  prerequisiteModuleIds: string[];
  isOptional?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  streakDays: number;
  acceptanceRate: string;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: {
    cpp: string;
    python: string;
    javascript: string;
    java: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  solutionExplanation: string;
  isSolved?: boolean;
  isPublished?: boolean;
  version?: number;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  createdBy?: string;
  updatedAt?: string;
}

export interface LeaderboardStudent {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  change: string; // '↑2', '→', '↑4', '↓1'
  changeType: 'up' | 'same' | 'down';
  league: LeagueName;
  streak: number;
  isCurrentUser: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: 'streak' | 'quiz' | 'coding' | 'community' | 'league' | 'mastery';
}

export interface RewardItem {
  id: string;
  title: string;
  category: 'Passes' | 'Merch' | 'Mentorship' | 'Customization';
  xpCost: number;
  image: string;
  description: string;
  stock: number;
  claimed: boolean;
  msotApproved: boolean;
  sponsorOrPartner: string;
}

export interface PeerHelpResponse {
  id: string;
  requestId: string;
  helperId: string;
  helperName: string;
  helperAvatar: string;
  helperRole: string;
  content: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface PeerHelpRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  subject: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  acceptedResponseId?: string;
  createdAt: string;
  resolvedAt?: string;
  responses: PeerHelpResponse[];
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  isHidden: boolean;
  isAccepted?: boolean;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  courseTag: string;
  title: string;
  body: string;
  isPinned: boolean;
  isHidden: boolean;
  acceptedReplyId?: string;
  resolvedAt?: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  courseTag: string;
  createdAt: string;
  isRead?: boolean;
}

export interface BattleMember {
  userId: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface BattleTeam {
  id: string;
  battleId: string;
  name: string;
  teamCode: string;
  totalScore: number;
  members: BattleMember[];
}

export interface BattleChallengeSubmission {
  id: string;
  battleId: string;
  challengeId: string;
  teamId: string;
  userId: string;
  challengeType: 'quiz' | 'coding';
  answers?: { [qId: string]: number[] | number };
  code?: string;
  language?: string;
  isCorrect: boolean;
  score: number;
  xpAwarded: number;
  submittedAt: string;
}

export interface BattleChallenge {
  id: string;
  battleId: string;
  title: string;
  description?: string;
  type: 'coding' | 'quiz';
  points: number;
  problemRef: string;
  isCompleted?: boolean;
  status?: 'not_started' | 'in_progress' | 'submitted' | 'scored';
  score?: number;
  quizQuestions?: CustomQuizQuestion[];
  codingProblem?: CodingProblem;
  userSubmission?: BattleChallengeSubmission;
}

export interface Battle {
  id: string;
  title: string;
  description: string;
  topic: string;
  status: 'upcoming' | 'registration' | 'live' | 'ended';
  registrationDeadline: string;
  startTime: string;
  endTime: string;
  maxTeamSize: number;
  xpPool: number;
  teams: BattleTeam[];
  challenges: BattleChallenge[];
  userTeamId?: string;
}

export interface IntegrityFlag {
  id: string;
  userId: string;
  studentName: string;
  studentId: string;
  type: 'fast_quiz' | 'reciprocal_help' | 'plagiarism_ast' | 'rate_limit';
  severity: 'low' | 'medium' | 'high';
  details: string;
  status: 'pending' | 'dismissed' | 'confirmed' | 'reversed';
  xpAssociated: number;
  timestamp: string;
  facultyNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorName: string;
  targetStudentName: string;
  reason: string;
  timestamp: string;
}

export interface FacultyStats {
  dailyActiveStudents: number;
  quizCompletionRate: number;
  avgStreakDays: number;
  quietStudentsCount: number;
  xpIntegrityScore: number;
  flaggedCount: number;
  struggleTopics: {
    topic: string;
    incorrectPercent: number;
    course: string;
    recommendedAction: string;
  }[];
  integrityChecks: {
    name: string;
    status: 'pass' | 'warning' | 'alert';
    detail: string;
  }[];
  flaggedIncidents: IntegrityFlag[];
  auditLogs: AuditLogEntry[];
}

export type DailyQuestType = 'coding' | 'answer_based';
export type DailyQuestAnswerType = 'numeric' | 'short_text' | 'mcq';
export type DailyQuestStatus = 'draft' | 'scheduled' | 'live' | 'closed' | 'archived';

export interface DailyQuestTest {
  id: string;
  questId?: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
}

export interface DailyQuestSolution {
  questId: string;
  modelSolution: string;
  explanation: string;
  correctAnswer?: string; // numeric, string, or option index for MCQ
  tolerance?: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  statement: string;
  questType: DailyQuestType;
  answerType?: DailyQuestAnswerType;
  mcqOptions?: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTag: string;
  targetBatches: string[];
  liveDate: string; // YYYY-MM-DD
  openAt: string; // ISO 8601
  closeAt: string; // ISO 8601
  xpReward: number;
  hints: string[];
  status: DailyQuestStatus;
  starterCode?: {
    cpp: string;
    python?: string;
    javascript?: string;
  };
  testCases?: DailyQuestTest[];
  modelSolution?: string; // only present for faculty or revealed post-submission
  solutionExplanation?: string;
  correctAnswer?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  attemptsCount?: number;
  userAttempt?: DailyQuestAttempt;
}

export interface DailyQuestAttempt {
  id: string;
  questId: string;
  userId: string;
  studentName: string;
  studentId: string;
  submissionText: string;
  language?: string;
  isCorrect: boolean;
  score: number;
  xpAwarded: number;
  timeTakenSeconds: number;
  testResults?: {
    index: number;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    runtimeMs: number;
    errorMessage?: string;
    isHidden: boolean;
  }[];
  revealedSolution?: DailyQuestSolution;
  submittedAt: string;
}

export interface DailyQuestAnalytics {
  questId: string;
  totalAttempts: number;
  solveRate: number;
  averageTimeSeconds: number;
  mostCommonWrongAnswers: { answer: string; count: number }[];
  studentAttempts: DailyQuestAttempt[];
  similarityFlags: {
    attemptId: string;
    studentName: string;
    matchedWithStudent: string;
    similarityPercent: number;
  }[];
}

// ====================================================================
// OFFICIAL MSOT POINTS ECONOMY & AUDIT LEDGER TYPES
// ====================================================================

export interface XpTransaction {
  id: string;
  userId: string;
  studentId?: string;
  studentName?: string;
  actionType: string;
  referenceId: string;
  amount: number;
  description: string;
  source: string;
  metadata?: Record<string, any>;
  isVoided?: boolean;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  classSessionId: string;
  studentId: string;
  studentName?: string;
  courseCode: string;
  sessionDate: string;
  status: 'present' | 'absent' | 'excused';
  source?: 'faculty_import' | 'api_sync';
  importedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  xpAwarded?: number;
  createdAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseCode: string;
  dueAt: string;
  targetBatches: string[];
  createdBy?: string;
  createdByName?: string;
  xpOnTime?: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  isOnTime: boolean;
  verifiedBy?: string;
  status: 'verified' | 'pending' | 'rejected' | 'submitted';
  xpAwarded?: number;
  createdAt?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testName: string;
  studentId: string;
  studentName?: string;
  scorePercent: number;
  xpAwarded: number;
  enteredBy?: string;
  enteredAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface ClubSession {
  id: string;
  clubName: string;
  sessionTitle: string;
  sessionDate: string;
  coordinatorId?: string;
  coordinatorName?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface ClubAttendance {
  id: string;
  clubSessionId: string;
  studentId: string;
  studentName?: string;
  verifiedBy?: string;
  markedAt?: string;
  xpAwarded?: number;
  createdAt?: string;
}

export interface LeaderboardPeriod {
  id: string;
  periodType: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  archivedAt?: string;
}

export interface LeaderboardArchive {
  id: string;
  periodId: string;
  studentId: string;
  studentName: string;
  rank: number;
  periodXp: number;
  league: LeagueName;
}
