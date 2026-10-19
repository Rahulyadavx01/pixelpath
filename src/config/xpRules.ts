/**
 * OFFICIAL MSOT POINTS ECONOMY & XP GOVERNANCE CONFIGURATION
 * 
 * Single source of truth for all XP rewards, daily limits, and anti-farming rules.
 * Mirrored in PostgreSQL table `public.xp_rules` and enforced via SECURITY DEFINER
 * function `award_xp`. The client application cannot dictate XP amounts.
 * 
 * CRITICAL RULE: Game XP never alters official academic evaluation or GPA.
 */

export interface XpRuleEntry {
  actionType: string;
  name: string;
  description: string;
  xp: number; // base or fixed amount
  perDayLimit: number | null; // maximum times awardable per student per calendar day
  perRefLimit: number; // maximum times awardable per unique reference_id (usually 1)
  verificationSource: 'attendance_record' | 'assignment_submission' | 'test_result' | 'coding_sandbox' | 'daily_quiz_server' | 'club_attendance' | 'streak_engine' | 'peer_acceptance' | 'battle_engine' | 'quest_engine';
  isExcludedFromGlobalCap: boolean; // Attendance & Bi-weekly tests bypass global daily cap
  active: boolean;
}

export interface XpRulesConfig {
  /**
   * Official MSOT Reward Table
   */
  table: {
    attendClass: number;
    submitAssignmentOnTime: number;
    dailyQuizBase: number;
    dailyQuizPerCorrect: number;
    biweeklyTestMax: number;
    codingProblem: {
      easy: number;
      medium: number;
      hard: number;
    };
    clubActivity: number;
    streak7DayBonus: number;
    peerHelpAccepted: number;
    dailyQuest: {
      easy: number;
      medium: number;
      hard: number;
    };
    teamBattles: {
      quizSprint: number;
      codingSprint: number;
      battleWin: number;
      participation: number;
    };
  };

  /**
   * Daily & Period Limits
   */
  limits: {
    codingDailySolvesMax: number; // Max 10 coding solves per day
    peerHelpDailyAcceptsMax: number; // Max 3 peer help acceptances per day
    dailyQuizPerDayMax: number; // 1 daily quiz per day
    dailyQuestPerDayMax: number; // 1 daily quest per day
    clubActivityDailyMax: number; // 1 club activity per day
    globalDailyCap: number; // 200 XP/day (excluding official attendance & bi-weekly tests)
  };

  /**
   * Integrity & Anti-Farming Thresholds
   */
  integrity: {
    minSecondsPerQuizQuestion: number; // minimum realistic response time (seconds)
    minSecondsBetweenCodingSubmissions: number; // rate limit between submissions
    astPlagiarismFlagThreshold: number; // AST token similarity threshold (85%)
    maxPeerHelpsBetweenSamePairPerDay: number; // collusion prevention
    requireFacultySignOffForReversal: boolean;
  };

  /**
   * Accessors & Compatibility Mappings
   */
  rewards: {
    attendanceClass: number;
    assignmentOnTime: number;
    dailyQuizBase: number;
    dailyQuizPerCorrect: number;
    biweeklyTestMax: number;
    biweeklyTestScore: (scorePercent: number) => number;
    codingProblem: (difficulty: 'easy' | 'medium' | 'hard') => number;
    clubActivity: number;
    streak7DayBonus: number;
    peerHelpAccepted: number;
    battleChallengeQuiz: number;
    battleChallengeCoding: number;
  };

  dailyQuest: {
    minXp: number;
    maxXp: number;
    easy: number;
    medium: number;
    hard: number;
  };

  quiz: {
    minPerQuestion: number;
    maxPerQuestion: number;
    maxCompletionBonus: number;
  };

  dailyCaps: {
    quiz: number;
    global: number;
  };

  /**
   * Detailed Rule Registry (Mirrors server-side xp_rules table)
   */
  rules: Record<string, XpRuleEntry>;
}

export const xpRules: XpRulesConfig = {
  table: {
    attendClass: 10,
    submitAssignmentOnTime: 20,
    dailyQuizBase: 15,
    dailyQuizPerCorrect: 5,
    biweeklyTestMax: 50, // floor(score_percent / 2) clamped to 50
    codingProblem: {
      easy: 10,
      medium: 20,
      hard: 40,
    },
    clubActivity: 25,
    streak7DayBonus: 50,
    peerHelpAccepted: 15,
    dailyQuest: {
      easy: 35,
      medium: 50,
      hard: 75,
    },
    teamBattles: {
      quizSprint: 40,
      codingSprint: 60,
      battleWin: 50,
      participation: 25,
    },
  },

  limits: {
    codingDailySolvesMax: 10,
    peerHelpDailyAcceptsMax: 3,
    dailyQuizPerDayMax: 1,
    dailyQuestPerDayMax: 1,
    clubActivityDailyMax: 1,
    globalDailyCap: 200, // 200 XP/day excluding attendance and bi-weekly tests
  },

  integrity: {
    minSecondsPerQuizQuestion: 5,
    minSecondsBetweenCodingSubmissions: 15,
    astPlagiarismFlagThreshold: 85,
    maxPeerHelpsBetweenSamePairPerDay: 1,
    requireFacultySignOffForReversal: true,
  },

  rewards: {
    attendanceClass: 10,
    assignmentOnTime: 20,
    dailyQuizBase: 15,
    dailyQuizPerCorrect: 5,
    biweeklyTestMax: 50,
    biweeklyTestScore: (scorePercent: number) => Math.min(50, Math.floor(scorePercent / 2)),
    codingProblem: (difficulty: 'easy' | 'medium' | 'hard') => {
      if (difficulty === 'hard') return 40;
      if (difficulty === 'medium') return 20;
      return 10;
    },
    clubActivity: 25,
    streak7DayBonus: 50,
    peerHelpAccepted: 15,
    battleChallengeQuiz: 40,
    battleChallengeCoding: 60,
  },

  dailyQuest: {
    minXp: 35,
    maxXp: 75,
    easy: 35,
    medium: 50,
    hard: 75,
  },

  quiz: {
    minPerQuestion: 1,
    maxPerQuestion: 10,
    maxCompletionBonus: 25,
  },

  dailyCaps: {
    quiz: 40,
    global: 200,
  },

  rules: {
    attendance: {
      actionType: 'attendance',
      name: 'Attend a class',
      description: 'Official verified class attendance imported by department faculty.',
      xp: 10,
      perDayLimit: null, // Multiple classes per day permitted
      perRefLimit: 1, // Once per class_session_id per student
      verificationSource: 'attendance_record',
      isExcludedFromGlobalCap: true, // Official academic record
      active: true,
    },
    assignment: {
      actionType: 'assignment',
      name: 'Submit classwork/homework on time',
      description: 'Coursework submitted on or before the faculty deadline.',
      xp: 20,
      perDayLimit: null,
      perRefLimit: 1, // Once per assignment_id
      verificationSource: 'assignment_submission',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    daily_quiz: {
      actionType: 'daily_quiz',
      name: 'Daily quiz completed',
      description: 'Server-graded daily quiz (15 base + 5 per correct answer).',
      xp: 15, // base + 5 * correct answers
      perDayLimit: 1, // Once per day
      perRefLimit: 1,
      verificationSource: 'daily_quiz_server',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    biweekly_test: {
      actionType: 'biweekly_test',
      name: 'Bi-weekly test score',
      description: 'Official test marks entered by faculty: floor(score% / 2), max 50.',
      xp: 50, // variable based on test score
      perDayLimit: null,
      perRefLimit: 1, // Once per test_id
      verificationSource: 'test_result',
      isExcludedFromGlobalCap: true, // Official academic record
      active: true,
    },
    coding_easy: {
      actionType: 'coding_easy',
      name: 'Solve Easy Coding Problem',
      description: 'Passes 100% of hidden test cases in sandboxed C++/Python runner.',
      xp: 10,
      perDayLimit: 10, // Part of max 10 coding solves/day
      perRefLimit: 1,
      verificationSource: 'coding_sandbox',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    coding_medium: {
      actionType: 'coding_medium',
      name: 'Solve Medium Coding Problem',
      description: 'Passes 100% of hidden test cases in sandboxed C++/Python runner.',
      xp: 20,
      perDayLimit: 10,
      perRefLimit: 1,
      verificationSource: 'coding_sandbox',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    coding_hard: {
      actionType: 'coding_hard',
      name: 'Solve Hard Coding Problem',
      description: 'Passes 100% of hidden test cases in sandboxed C++/Python runner.',
      xp: 40,
      perDayLimit: 10,
      perRefLimit: 1,
      verificationSource: 'coding_sandbox',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    club_activity: {
      actionType: 'club_activity',
      name: 'Club activity participation',
      description: 'Official verified club attendance marked by faculty or coordinator.',
      xp: 25,
      perDayLimit: 1, // Max 1 club session per day
      perRefLimit: 1,
      verificationSource: 'club_attendance',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    streak_7day: {
      actionType: 'streak_7day',
      name: '7-day learning streak',
      description: 'Verified milestone for 7 consecutive days of qualifying activity.',
      xp: 50,
      perDayLimit: 1,
      perRefLimit: 1, // Once per streak cycle
      verificationSource: 'streak_engine',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    peer_help: {
      actionType: 'peer_help',
      name: 'Help a peer (answer accepted)',
      description: 'Student asker accepts helper explanation on peer board (max 3/day).',
      xp: 15,
      perDayLimit: 3,
      perRefLimit: 1,
      verificationSource: 'peer_acceptance',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    daily_quest: {
      actionType: 'daily_quest',
      name: 'Daily Quest problem solved',
      description: 'Daily algorithmic or discrete problem set by faculty.',
      xp: 50,
      perDayLimit: 1,
      perRefLimit: 1,
      verificationSource: 'quest_engine',
      isExcludedFromGlobalCap: false,
      active: true,
    },
    battle_challenge: {
      actionType: 'battle_challenge',
      name: 'Team Battle sprint challenge',
      description: 'Passing quiz or coding sprint during a live team battle.',
      xp: 50,
      perDayLimit: 4,
      perRefLimit: 1,
      verificationSource: 'battle_engine',
      isExcludedFromGlobalCap: false,
      active: true,
    },
  },
};
