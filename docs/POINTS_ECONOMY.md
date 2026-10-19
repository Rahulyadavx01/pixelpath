# MSOT Points Economy & Gamification Governance Architecture

> **CRITICAL RULE**: Game XP strictly measures engagement, deliberate practice, and peer collaboration. Game XP **never alters official examination marks, academic evaluation, or student GPA**.

---

## 1. Executive Summary

QUESTIFY implements the official **MSOT Points Economy**, designed to encourage consistent academic habits while rigorously preventing XP farming, scripting, and dishonest competition.

Every point awarded in QUESTIFY must derive from an **officially verifiable source**:
1. **Official Campus Attendance**: Verified by department faculty from classroom registers.
2. **On-Time Coursework**: Submitted via LMS before deadline timestamps.
3. **Official Examination Results**: Gradebook percentages entered by instructors.
4. **Sandboxed Evaluation**: Multi-test C++17 / Python test suites executed in sandboxed runners with rate-limiting and AST plagiarism detection.
5. **Authenticated Peer Collaboration**: Solution acceptances granted exclusively by original question askers (no self-accepting, no collusion).

---

## 2. Official MSOT Points Economy Rules Table

The single client-side source of truth is [`src/config/xpRules.ts`](../src/config/xpRules.ts), mirrored identically in the PostgreSQL table `public.xp_rules` and enforced via the server-side SECURITY DEFINER function `award_xp`.

| Action | XP Reward | Daily / Periodic Limit | Verification Source | Excluded from Global 200 XP Cap? |
| :--- | :--- | :--- | :--- | :--- |
| **Attend a class** | **10 XP** | Per class session | Official Campus Attendance Roster | **YES (Academic)** |
| **Submit classwork/homework on time** | **20 XP** | Per assignment | LMS Submission Timestamp | No |
| **Daily quiz completed** | **15 base + 5 / correct** | 1 attempt per day | Server-Graded Daily Quiz Suite | No |
| **Bi-weekly test score** | **floor(score% / 2)**, max 50 | Per official test | Faculty Gradebook Import | **YES (Academic)** |
| **Solve coding problem (Easy)** | **10 XP** | Max 10 solves/day | Sandboxed Test Suite (100% pass) | No |
| **Solve coding problem (Medium)** | **20 XP** | Max 10 solves/day | Sandboxed Test Suite (100% pass) | No |
| **Solve coding problem (Hard)** | **40 XP** | Max 10 solves/day | Sandboxed Test Suite (100% pass) | No |
| **Club activity participation** | **25 XP** | Max 1 session/day | Faculty / Club Lead Verification | No |
| **7-day learning streak** | **50 XP bonus** | 1 per active 7-day cycle | Activity Engine Milestone Tracker | No |
| **Help a peer (answer accepted)** | **15 XP** | Max 3 accepted/day | Peer Discussion Board Acceptance | No |
| **Daily Quest (Easy / Med / Hard)** | **35 / 50 / 75 XP** | 1 quest/day | Faculty-Authored Daily Quest | No |
| **Team Battle Quiz Sprint** | **40 XP** | Live battle window | Real-Time Squad Quiz Engine | No |
| **Team Battle Coding Sprint** | **60 XP** | Live battle window | Real-Time Squad Code Sandbox | No |
| **Team Battle Victory** | **50 XP** | Per battle conclusion | Final Squad Matchmaking Result | No |
| **Team Battle Participation** | **25 XP** | Per battle registration | Registered Squad Active Play | No |

---

## 3. Anti-Farming & Daily Caps Architecture

### 3.1 Global Daily Cap (200 XP / Day)
Non-academic learning activities (coding arena solves, daily quizzes, quests, peer help, club activities) are strictly capped at **200 XP per calendar day** (calculated in `Asia/Kolkata` timezone).
- **Academic Exemption**: Official classroom attendance (+10 XP per class) and bi-weekly test marks (up to +50 XP per exam) are **exempt** from this cap. A dedicated student who attends 6 lectures and achieves high exam scores is never penalized in their platform learning activities.

### 3.2 Anti-Farming Sub-Caps & Rate Limiting
1. **Coding Problem Cap**: Maximum **10 problem solves per calendar day** across all difficulties. Uniqueness constraint: a problem only awards XP on its first verified pass; solving the same problem repeatedly awards 0 XP.
2. **Anti-Self-Help & Collusion Filter**:
   - Only the original student who posted a question can mark a reply as accepted.
   - Self-accepting is strictly rejected: `asker_id !== helper_id`.
   - Maximum **3 peer help acceptances per helper per day** (max 45 XP/day).
   - Rate limit: maximum 1 accepted help between the same student pair per calendar day.
3. **Daily Quiz & Quest Lock**: Maximum 1 graded submission per day.
4. **AST Plagiarism Detection**: Code submissions with similarity $\ge 85\%$ against existing campus repository solutions trigger an anomaly alert in the faculty console.

---

## 4. Database Schema & Security Architecture

### 4.1 Tables Created
- `public.xp_rules`: Server-authoritative registry of action types, base XP, daily limits, and reference limits.
- `public.xp_transactions`: Immutable append-only transaction ledger (`id`, `user_id`, `student_id`, `action_type`, `reference_id`, `amount`, `source`, `is_voided`, `void_reason`, `voided_by`, `created_at`). Direct client `INSERT`/`UPDATE` is revoked.
- `public.attendance_records`: Official attendance entries imported by faculty.
- `public.assignments` & `public.assignment_submissions`: LMS tracking with due dates and on-time validation.
- `public.test_results`: Official examination results entered by instructors.
- `public.club_sessions` & `public.club_attendance`: Verified student club activities.
- `public.leaderboard_periods` & `public.leaderboard_archive`: Weekly/monthly reset tracking and snapshot archives.

### 4.2 Security Definer Functions
- `award_xp(p_user_id, p_action_type, p_reference_id, p_amount, p_metadata)`:
  - Enforces reference uniqueness: `(user_id, action_type, reference_id)`.
  - Calculates daily total in `Asia/Kolkata` timezone.
  - Enforces per-rule daily limit and global 200 XP/day cap.
  - Updates `profiles.xp`, calculates new level, and adjusts league tier.
  - Inserts transaction record into `xp_transactions`.
- `void_xp(p_transaction_id, p_faculty_id, p_reason)`:
  - Verifies caller has `role = 'faculty'`.
  - Validates mandatory justification reason (min 5 characters).
  - Marks transaction `is_voided = true` and stamps `void_reason`.
  - Recomputes student's total XP and league standings.
  - Writes reversing audit entry to `faculty_audit_logs`.

---

## 5. Leaderboard Reset & Privacy Opt-Out

### 5.1 Weekly & Monthly Resets
- Division leaderboards reset on a **Weekly Cycle** (Sundays at 23:59:59 UTC / 05:29:59 IST).
- When a period concludes, final ranks are archived to `leaderboard_archive` and students receive tier promotion or maintenance status.
- Career XP remains persistent in the student profile; weekly league tables reset to zero to give every student a fresh start each week.

### 5.2 Student Privacy Opt-Out (`leaderboard_opt_out`)
- In accordance with inclusive learning guidelines, students can toggle **"Hide Me from Public Cohort Leaderboards"** in `Settings & Privacy`.
- When opted out:
  - The student is excluded from cohort and global leaderboards displayed to peers.
  - The student can still view their own position and statistics privately.
  - Verified academic records, XP accumulation, and badges remain 100% active.

### 5.3 Non-Punitive Pedagogical Design
- **No Negative XP**: Absence or wrong answers yield 0 XP, never docked or negative points.
- **Zero Public Shaming**: No "Danger Zone", "Relegation Drop", or "Slacker" badges. Lower tiers are framed constructively as "Maintenance Zone".

---

## 6. Faculty Import Data Formats

### 6.1 Class Attendance Import Format (CSV)
```csv
student_id,status
24CS01,present
24CS02,present
24CS03,absent
24CS04,excused
```
- Present students receive `+10 XP` per session.
- System validates `student_id` against the campus roster; unknown IDs produce detailed row-level error reports without failing the entire batch.

### 6.2 Bi-Weekly Test Marks Import Format (CSV)
```csv
student_id,score_percentage
24CS01,88
24CS02,94
24CS03,72
24CS04,60
```
- Formula: `floor(score% / 2)`, clamped between 0 and 50 XP.

### 6.3 Club Attendance Format
- Session Title, Club Name (e.g. GDSC, ACM, Robotics), Date.
- Comma-separated Student IDs: `24CS01, 24CS02, 24CS04`. Each student receives `+25 XP` (max 1/day).

---

## 7. 30-Day Simulation: Honest Student vs Script Farmer

Automated unit tests in [`src/lib/pointsEconomy.test.ts`](../src/lib/pointsEconomy.test.ts) simulate 30 consecutive calendar days of student activity:

| Metric | Honest Student (Alex) | Script Farmer Bot |
| :--- | :--- | :--- |
| **Attendance** | 2 classes/day (60 classes = 600 XP) | 0 classes attended (0 XP) |
| **Coding Solves** | 2 medium problems/day (60 solves = 1,200 XP) | Attempted 50 easy problems/day (1,500 attempted) |
| **Coding Solves Count** | 60 verified unique solves | **Capped at 10/day** (300 accepted, 1,200 rejected) |
| **Coding XP** | 1,200 XP | Capped at 3,000 XP |
| **Daily Quizzes** | 1 quiz/day with 80% accuracy (1,050 XP) | Attempted 5 quizzes/day (150 attempted, **120 rejected**) |
| **Quiz XP** | 1,050 XP | Capped at 1,200 XP |
| **Daily Quests** | 1 quest/day (1,500 XP) | 0 quests solved (requires manual reasoning) |
| **Assignments** | 4 on-time submissions (80 XP) | Attempted duplicate submissions (**rejected**) |
| **Bi-Weekly Tests** | 2 exams with 90% and 94% scores (**92 XP**) | 0 official test marks (0 XP) |
| **7-Day Streaks** | 4 weekly milestone bonuses (**200 XP**) | 0 streak bonuses (activity irregular) |
| **Peer Tutoring** | 0 self-acceptances | Attempted 300 self-acceptances (**100% rejected**) |
| **Total 30-Day XP** | **4,822 XP** | **4,200 XP** (before faculty audit) |
| **Faculty Audit** | 0 flagged incidents | 5 bot solve batches voided (**-200 XP deducted**) |
| **Final Standing** | **#1 in Cohort (4,822 XP)** | **Throttled & Audited (4,000 XP)** |

**Conclusion**: The anti-farming architecture guarantees that a bot spamming easy scripts cannot surpass a consistently engaged student who attends classes, solves daily challenges, and maintains academic momentum.
