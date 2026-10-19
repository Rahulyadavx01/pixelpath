import { describe, it, expect } from 'vitest';
import { xpRules } from '../config/xpRules';

/**
 * PURE POINTS ECONOMY ENGINE EMULATOR FOR RIGOROUS UNIT TESTING
 * Simulates the award_xp and void_xp rules identically to the SQL & AppContext implementation.
 */
interface SimulatedTx {
  id: string;
  userId: string;
  actionType: string;
  referenceId: string;
  amount: number;
  day: number;
  isVoided: boolean;
  voidReason?: string;
  isExcludedFromGlobalCap: boolean;
}

class PointsEconomyEmulator {
  public transactions: SimulatedTx[] = [];
  public studentXp: Record<string, number> = {};
  public solvedProblems: Record<string, Set<string>> = {};
  public assignmentSubmissions: Record<string, Set<string>> = {};
  public auditLogs: Array<{ action: string; targetStudent: string; reason: string }> = [];

  constructor() {}

  public awardXp(params: {
    userId: string;
    actionType: string;
    referenceId: string;
    amount?: number;
    day: number;
    helperId?: string;
    askerId?: string;
    scorePercent?: number;
  }): { success: boolean; awardedAmount: number; error?: string } {
    const { userId, actionType, referenceId, day } = params;

    const rule = xpRules.rules[actionType];
    if (!rule || !rule.active) {
      return { success: false, awardedAmount: 0, error: 'Unknown or inactive rule' };
    }

    // 1. Uniqueness check by referenceId
    const alreadyUsed = this.transactions.some(
      (tx) => tx.userId === userId && tx.actionType === actionType && tx.referenceId === referenceId && !tx.isVoided
    );
    if (alreadyUsed) {
      return { success: false, awardedAmount: 0, error: 'Reference already awarded' };
    }

    // 2. Anti-Self-Help check
    if (actionType === 'peer_help') {
      if (params.askerId && params.helperId && params.askerId === params.helperId) {
        return { success: false, awardedAmount: 0, error: 'Self-help peer acceptance disallowed' };
      }
    }

    // 3. Per-Action Daily Limit check
    const todayActionTxs = this.transactions.filter(
      (tx) => tx.userId === userId && tx.day === day && !tx.isVoided
    );

    if (actionType.startsWith('coding_')) {
      const todaySolves = todayActionTxs.filter((tx) => tx.actionType.startsWith('coding_')).length;
      if (todaySolves >= xpRules.limits.codingDailySolvesMax) {
        return { success: false, awardedAmount: 0, error: 'Max daily coding solves limit reached (10/day)' };
      }
    } else if (actionType === 'peer_help') {
      const todayPeer = todayActionTxs.filter((tx) => tx.actionType === 'peer_help').length;
      if (todayPeer >= xpRules.limits.peerHelpDailyAcceptsMax) {
        return { success: false, awardedAmount: 0, error: 'Max daily peer help accepts reached (3/day)' };
      }
    } else if (rule.perDayLimit !== null) {
      const count = todayActionTxs.filter((tx) => tx.actionType === actionType).length;
      if (count >= rule.perDayLimit) {
        return { success: false, awardedAmount: 0, error: `Daily limit reached for ${actionType}` };
      }
    }

    // 4. Determine base amount
    let baseAmount = params.amount ?? rule.xp;
    if (actionType === 'biweekly_test' && typeof params.scorePercent === 'number') {
      baseAmount = xpRules.rewards.biweeklyTestScore(params.scorePercent);
    }

    // 5. Global daily cap check (200 XP/day, excluding attendance and biweekly tests)
    let finalAmount = baseAmount;
    if (!rule.isExcludedFromGlobalCap) {
      const todayCappedSoFar = todayActionTxs
        .filter((tx) => !tx.isExcludedFromGlobalCap)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const capRemaining = Math.max(0, xpRules.limits.globalDailyCap - todayCappedSoFar);
      if (capRemaining <= 0) {
        return { success: false, awardedAmount: 0, error: 'Global daily cap reached (200 XP/day)' };
      }
      finalAmount = Math.min(baseAmount, capRemaining);
    }

    // Record transaction
    const tx: SimulatedTx = {
      id: `tx-${this.transactions.length + 1}`,
      userId,
      actionType,
      referenceId,
      amount: finalAmount,
      day,
      isVoided: false,
      isExcludedFromGlobalCap: rule.isExcludedFromGlobalCap,
    };
    this.transactions.push(tx);

    this.studentXp[userId] = (this.studentXp[userId] || 0) + finalAmount;
    return { success: true, awardedAmount: finalAmount };
  }

  public voidXp(transactionId: string, facultyReason: string): { success: boolean; error?: string } {
    if (!facultyReason || facultyReason.trim().length < 5) {
      return { success: false, error: 'Faculty justification must be at least 5 characters' };
    }

    const tx = this.transactions.find((t) => t.id === transactionId);
    if (!tx) return { success: false, error: 'Transaction not found' };
    if (tx.isVoided) return { success: false, error: 'Already voided' };

    tx.isVoided = true;
    tx.voidReason = facultyReason.trim();

    this.studentXp[tx.userId] = Math.max(0, (this.studentXp[tx.userId] || 0) - tx.amount);
    this.auditLogs.push({
      action: 'VOID_XP',
      targetStudent: tx.userId,
      reason: facultyReason.trim(),
    });

    return { success: true };
  }
}

describe('Official MSOT Points Economy - 13 Verification Rules', () => {
  it('1. Attendance awards 10 XP per class session and bypasses the global daily cap', () => {
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'attendance',
      referenceId: 'sess-math-01',
      day: 1,
    });

    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(10);
    expect(xpRules.rules.attendance.isExcludedFromGlobalCap).toBe(true);
  });

  it('2. Submitting assignment on time awards exactly 20 XP', () => {
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'assignment',
      referenceId: 'asg-os-01',
      day: 1,
    });

    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(20);
    expect(xpRules.table.submitAssignmentOnTime).toBe(20);
  });

  it('3. Daily Quiz awards 15 base + 5 per correct answer, capped at 1/day', () => {
    const engine = new PointsEconomyEmulator();
    // 5 correct answers: 15 + 25 = 40 XP
    const score = 5;
    const computedXp = xpRules.table.dailyQuizBase + score * xpRules.table.dailyQuizPerCorrect;
    expect(computedXp).toBe(40);

    const res1 = engine.awardXp({
      userId: '24CS01',
      actionType: 'daily_quiz',
      referenceId: 'quiz-day-1',
      amount: computedXp,
      day: 1,
    });
    expect(res1.success).toBe(true);
    expect(res1.awardedAmount).toBe(40);

    // Second quiz attempt same day must reject
    const res2 = engine.awardXp({
      userId: '24CS01',
      actionType: 'daily_quiz',
      referenceId: 'quiz-day-1-attempt-2',
      amount: 40,
      day: 1,
    });
    expect(res2.success).toBe(false);
  });

  it('4. Bi-weekly test score computes floor(score% / 2) capped at 50, and bypasses daily cap', () => {
    const engine = new PointsEconomyEmulator();
    // 92% -> floor(92/2) = 46 XP
    expect(xpRules.rewards.biweeklyTestScore(92)).toBe(46);
    // 100% -> floor(100/2) = 50 XP
    expect(xpRules.rewards.biweeklyTestScore(100)).toBe(50);
    // 77% -> floor(77/2) = 38 XP
    expect(xpRules.rewards.biweeklyTestScore(77)).toBe(38);

    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'biweekly_test',
      referenceId: 'test-algo-mid',
      scorePercent: 92,
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(46);
    expect(xpRules.rules.biweekly_test.isExcludedFromGlobalCap).toBe(true);
  });

  it('5. Easy Coding Problem awards 10 XP', () => {
    expect(xpRules.table.codingProblem.easy).toBe(10);
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_easy',
      referenceId: 'prob-two-sum-easy',
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(10);
  });

  it('6. Medium Coding Problem awards 20 XP', () => {
    expect(xpRules.table.codingProblem.medium).toBe(20);
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_medium',
      referenceId: 'prob-lru-cache-medium',
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(20);
  });

  it('7. Hard Coding Problem awards 40 XP', () => {
    expect(xpRules.table.codingProblem.hard).toBe(40);
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_hard',
      referenceId: 'prob-trapping-water-hard',
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(40);
  });

  it('8. Club Activity awards 25 XP, max 1/day', () => {
    expect(xpRules.table.clubActivity).toBe(25);
    const engine = new PointsEconomyEmulator();
    const res1 = engine.awardXp({
      userId: '24CS01',
      actionType: 'club_activity',
      referenceId: 'club-gdsc-day-1',
      day: 1,
    });
    expect(res1.success).toBe(true);
    expect(res1.awardedAmount).toBe(25);

    const res2 = engine.awardXp({
      userId: '24CS01',
      actionType: 'club_activity',
      referenceId: 'club-acm-day-1',
      day: 1,
    });
    expect(res2.success).toBe(false);
  });

  it('9. 7-Day Learning Streak bonus awards 50 XP', () => {
    expect(xpRules.table.streak7DayBonus).toBe(50);
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'streak_7day',
      referenceId: 'streak-cycle-1',
      day: 7,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(50);
  });

  it('10. Peer Help accepted awards 15 XP, max 3/day, and rejects self-help', () => {
    expect(xpRules.table.peerHelpAccepted).toBe(15);
    const engine = new PointsEconomyEmulator();

    // Self-help attempt must reject
    const selfHelp = engine.awardXp({
      userId: '24CS01',
      actionType: 'peer_help',
      referenceId: 'peer-ans-self',
      day: 1,
      askerId: '24CS01',
      helperId: '24CS01',
    });
    expect(selfHelp.success).toBe(false);

    // Legitimate peer accepts (up to 3)
    const h1 = engine.awardXp({
      userId: '24CS02',
      actionType: 'peer_help',
      referenceId: 'peer-ans-1',
      day: 1,
      askerId: '24CS01',
      helperId: '24CS02',
    });
    const h2 = engine.awardXp({
      userId: '24CS02',
      actionType: 'peer_help',
      referenceId: 'peer-ans-2',
      day: 1,
      askerId: '24CS03',
      helperId: '24CS02',
    });
    const h3 = engine.awardXp({
      userId: '24CS02',
      actionType: 'peer_help',
      referenceId: 'peer-ans-3',
      day: 1,
      askerId: '24CS04',
      helperId: '24CS02',
    });
    expect(h1.success).toBe(true);
    expect(h2.success).toBe(true);
    expect(h3.success).toBe(true);
    expect(h1.awardedAmount).toBe(15);

    // 4th peer help on same day must be rejected by daily cap
    const h4 = engine.awardXp({
      userId: '24CS02',
      actionType: 'peer_help',
      referenceId: 'peer-ans-4',
      day: 1,
      askerId: '24CS05',
      helperId: '24CS02',
    });
    expect(h4.success).toBe(false);
  });

  it('11. Daily Quest awards 35 / 50 / 75 XP based on difficulty', () => {
    expect(xpRules.table.dailyQuest.easy).toBe(35);
    expect(xpRules.table.dailyQuest.medium).toBe(50);
    expect(xpRules.table.dailyQuest.hard).toBe(75);

    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'daily_quest',
      referenceId: 'dq-day-1',
      amount: 50,
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(res.awardedAmount).toBe(50);
  });

  it('12. Team Battles challenges award 40 / 60 XP and win awards 50 XP', () => {
    expect(xpRules.table.teamBattles.quizSprint).toBe(40);
    expect(xpRules.table.teamBattles.codingSprint).toBe(60);
    expect(xpRules.table.teamBattles.battleWin).toBe(50);
    expect(xpRules.table.teamBattles.participation).toBe(25);
  });

  it('13. Non-academic daily XP is clamped at 200 XP/day, while attendance and tests bypass', () => {
    const engine = new PointsEconomyEmulator();

    // 1. Solve 4 hard problems: 4 * 40 = 160 XP
    for (let i = 1; i <= 4; i++) {
      const res = engine.awardXp({
        userId: '24CS01',
        actionType: 'coding_hard',
        referenceId: `prob-hard-${i}`,
        day: 1,
      });
      expect(res.success).toBe(true);
    }
    expect(engine.studentXp['24CS01']).toBe(160);

    // 2. Solve another hard problem (40 XP) -> only 40 remaining to cap
    const res5 = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_hard',
      referenceId: 'prob-hard-5',
      day: 1,
    });
    expect(res5.success).toBe(true);
    expect(res5.awardedAmount).toBe(40);
    expect(engine.studentXp['24CS01']).toBe(200); // Reached 200 XP cap

    // 3. Any additional non-academic activity (e.g. daily quest) must be rejected / clamped to 0
    const resBlocked = engine.awardXp({
      userId: '24CS01',
      actionType: 'daily_quest',
      referenceId: 'dq-day-1',
      amount: 50,
      day: 1,
    });
    expect(resBlocked.success).toBe(false);

    // 4. BUT official class attendance and bi-weekly test MUST still succeed (unpenalized academic record)!
    const attRes = engine.awardXp({
      userId: '24CS01',
      actionType: 'attendance',
      referenceId: 'sess-afternoon-lab',
      day: 1,
    });
    expect(attRes.success).toBe(true);
    expect(attRes.awardedAmount).toBe(10);
    expect(engine.studentXp['24CS01']).toBe(210);

    const testRes = engine.awardXp({
      userId: '24CS01',
      actionType: 'biweekly_test',
      referenceId: 'exam-data-structures-midterm',
      scorePercent: 90,
      day: 1,
    });
    expect(testRes.success).toBe(true);
    expect(testRes.awardedAmount).toBe(45);
    expect(engine.studentXp['24CS01']).toBe(255);
  });
});

describe('Anti-Farming & Governance Integrity Enforcement', () => {
  it('Rejects duplicate rewards for the same reference ID', () => {
    const engine = new PointsEconomyEmulator();
    const first = engine.awardXp({
      userId: '24CS01',
      actionType: 'assignment',
      referenceId: 'asg-recursion-01',
      day: 1,
    });
    expect(first.success).toBe(true);

    const duplicate = engine.awardXp({
      userId: '24CS01',
      actionType: 'assignment',
      referenceId: 'asg-recursion-01',
      day: 1,
    });
    expect(duplicate.success).toBe(false);
  });

  it('Caps coding solves at strictly 10 solves per calendar day', () => {
    const engine = new PointsEconomyEmulator();
    for (let i = 1; i <= 10; i++) {
      const res = engine.awardXp({
        userId: '24CS01',
        actionType: 'coding_easy',
        referenceId: `prob-easy-${i}`,
        day: 1,
      });
      expect(res.success).toBe(true);
    }

    // 11th solve on same day must be rejected
    const eleventh = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_easy',
      referenceId: 'prob-easy-11',
      day: 1,
    });
    expect(eleventh.success).toBe(false);
    expect(eleventh.error).toContain('Max daily coding solves limit reached');
  });

  it('Voiding XP requires at least 5 characters justification, recomputes total, and logs to audit', () => {
    const engine = new PointsEconomyEmulator();
    const res = engine.awardXp({
      userId: '24CS01',
      actionType: 'coding_hard',
      referenceId: 'prob-cheat-01',
      day: 1,
    });
    expect(res.success).toBe(true);
    expect(engine.studentXp['24CS01']).toBe(40);

    const txId = engine.transactions[0].id;

    // Reject short reason
    const voidShort = engine.voidXp(txId, 'bot');
    expect(voidShort.success).toBe(false);

    // Accept valid faculty justification
    const voidValid = engine.voidXp(txId, 'AST token inspection revealed automated solution script');
    expect(voidValid.success).toBe(true);

    // Total XP must be reduced
    expect(engine.studentXp['24CS01']).toBe(0);
    expect(engine.transactions[0].isVoided).toBe(true);
    expect(engine.auditLogs.length).toBe(1);
    expect(engine.auditLogs[0].action).toBe('VOID_XP');
  });
});

describe('30-Day Longitudinal Simulation: Honest Student vs Script Farmer', () => {
  it('Demonstrates that anti-farming limits and daily caps prevent bot manipulation over 30 days', () => {
    const engine = new PointsEconomyEmulator();
    const honestId = 'honest_student_alex';
    const farmerId = 'script_farmer_bot';

    for (let day = 1; day <= 30; day++) {
      // --- HONEST STUDENT ROUTINE ---
      // 1. Attends 2 classes per day: 2 * 10 = 20 XP
      engine.awardXp({ userId: honestId, actionType: 'attendance', referenceId: `sess-day-${day}-01`, day });
      engine.awardXp({ userId: honestId, actionType: 'attendance', referenceId: `sess-day-${day}-02`, day });

      // 2. Solves 2 medium problems per day: 2 * 20 = 40 XP
      engine.awardXp({ userId: honestId, actionType: 'coding_medium', referenceId: `prob-honest-${day}-01`, day });
      engine.awardXp({ userId: honestId, actionType: 'coding_medium', referenceId: `prob-honest-${day}-02`, day });

      // 3. Completes Daily Quiz (4/5 correct: 15 + 20 = 35 XP)
      engine.awardXp({ userId: honestId, actionType: 'daily_quiz', referenceId: `quiz-honest-${day}`, amount: 35, day });

      // 4. Solves Daily Quest (Medium: 50 XP)
      engine.awardXp({ userId: honestId, actionType: 'daily_quest', referenceId: `dq-honest-${day}`, amount: 50, day });

      // 5. Weekly assignment on time on days 7, 14, 21, 28: 20 XP
      if (day % 7 === 0) {
        engine.awardXp({ userId: honestId, actionType: 'assignment', referenceId: `asg-honest-${day / 7}`, day });
        // Weekly streak bonus: 50 XP
        engine.awardXp({ userId: honestId, actionType: 'streak_7day', referenceId: `streak-cycle-${day / 7}`, day });
      }

      // 6. Weekly club session on days 5, 12, 19, 26: 25 XP
      if (day % 7 === 5) {
        engine.awardXp({ userId: honestId, actionType: 'club_activity', referenceId: `club-honest-${day}`, day });
      }

      // 7. Bi-weekly test on day 14 (90% score -> 45 XP) and day 28 (94% score -> 47 XP)
      if (day === 14) {
        engine.awardXp({ userId: honestId, actionType: 'biweekly_test', referenceId: 'test-honest-1', scorePercent: 90, day });
      }
      if (day === 28) {
        engine.awardXp({ userId: honestId, actionType: 'biweekly_test', referenceId: 'test-honest-2', scorePercent: 94, day });
      }

      // --- SCRIPT FARMER ROUTINE (Attempts aggressive exploits) ---
      // 1. Never attends class (0 attendance)
      // 2. Attempts to spam 50 easy coding problems every single day
      for (let p = 1; p <= 50; p++) {
        engine.awardXp({
          userId: farmerId,
          actionType: 'coding_easy',
          referenceId: `prob-bot-day-${day}-${p}`,
          day,
        });
      }

      // 3. Attempts to submit 5 daily quizzes per day
      for (let q = 1; q <= 5; q++) {
        engine.awardXp({
          userId: farmerId,
          actionType: 'daily_quiz',
          referenceId: `quiz-bot-${day}-${q}`,
          amount: 40,
          day,
        });
      }

      // 4. Attempts to submit 10 peer helps per day with self-collusion
      for (let ph = 1; ph <= 10; ph++) {
        engine.awardXp({
          userId: farmerId,
          actionType: 'peer_help',
          referenceId: `peer-bot-${day}-${ph}`,
          day,
          askerId: farmerId, // Self-help exploit
          helperId: farmerId,
        });
      }
    }

    const honestFinalXp = engine.studentXp[honestId];
    const farmerFinalXp = engine.studentXp[farmerId];

    // Honest student steadily accumulates over 4,000 verified points through classes, tests, and consistent habit
    expect(honestFinalXp).toBeGreaterThan(4000);

    // Farmer is strictly capped: 10 easy solves/day = 100 XP + 1 quiz/day = 40 XP -> 140 XP/day * 30 days = 4200 XP max
    // All 40 extra solves/day are rejected
    // All duplicate quizzes are rejected
    // All self-peer helps are rejected (0 XP)
    expect(farmerFinalXp).toBeLessThanOrEqual(4200);

    // Furthermore, faculty audit voids the farmer's suspicious days
    const farmerTxs = engine.transactions.filter((tx) => tx.userId === farmerId);
    // Void 5 suspicious days
    for (let i = 0; i < 5; i++) {
      engine.voidXp(farmerTxs[i].id, 'Suspicious bot solve velocity detected across AST audit logs');
    }

    const farmerAfterAudit = engine.studentXp[farmerId];
    expect(farmerAfterAudit).toBeLessThan(farmerFinalXp);
    expect(honestFinalXp).toBeGreaterThan(farmerAfterAudit);
  });
});
