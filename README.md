# ⚡ QUESTIFY

> *"Make learning impossible to ignore."*

**QUESTIFY** is a premier gamified learning platform engineered for college education based on the **MSOT "Gamified Learning Challenge: Student Proposal"**. It transforms everyday computer science curriculum into an engaging habit through verified XP, streaks, weekly cohort leagues, algorithmic team battles, interactive course progression, sandboxed code execution, peer help desks, and comprehensive faculty governance.

---

## 🎨 Visual Identity & Design System
- **Theme**: Dreamy, energetic Light Pink + Sky Blue + Sunset Gradient palette with clean ivory surfaces and dark navy typography (`#24324B`).
- **Signature Gradients**:
  - Primary Sunset Gradient: `linear-gradient(135deg, #F9A8D4 0%, #C4B5FD 45%, #93C5FD 100%)`
  - Warm Sunset Gradient: `linear-gradient(135deg, #FDBA9A 0%, #FB7185 50%, #C4B5FD 100%)`
- **Typography**: Inter (Weights 400, 600, 700, 800, 900) with bold hero metrics and monospace accents for code and Student IDs.

---

## 🔐 Dual Authentication Architecture

### 1. Students: Institutional Mains ID + Password
- **Zero Third-Party OAuth for Students**: Students sign in with their official Student ID (e.g. `MSOT-2024-001`) and password. Google is strictly prohibited for students.
- **Roster-Gated Registration**: Only IDs pre-registered on `student_roster` by faculty/admin can activate an account.
- **First-Time Activation Flow**:
  1. Student enters their Mains Student ID.
  2. System checks roster existence and ensures account is not already activated.
  3. Student creates an 8+ character password with real-time visual strength estimation (`PasswordStrengthMeter`).
  4. Account is established in Supabase Auth and roster row is marked `is_activated = true`.
- **Security & Anti-Enumeration**:
  - Rate limiting lockout after 5 consecutive failed attempts (30-second lockout).
  - Password change in Settings via `supabase.auth.updateUser`.
  - Faculty password reset path with temporary password issuance.

### 2. Faculty: Official `@msot.edu` Google SSO
- **Segmented Login Toggle**: `[ Student ] [ Faculty ]` tabs on `/login`.
- **Google OAuth**: A 48px "Continue with Google" button with helper text *"Use your @msot.edu faculty account."*
- **Server-Side Domain & Allowlist Enforcement**:
  - PostgreSQL trigger `validate_faculty_google_signup` on `auth.users` strictly rejects Google signups whose email domain does not match `system_config.faculty_email_domain` (`msot.edu`).
  - Table `faculty_allowlist` stores pre-authorized faculty emails.
  - SECURITY DEFINER RPC `verify_and_register_faculty_session` checks `faculty_allowlist` and sets `profiles.role = 'faculty'`.
- **Access Restricted Screen**: If an `@msot.edu` account is authenticated but absent from `faculty_allowlist`, an access-restricted screen is rendered with *"Try Another Google Account"* and *"Return to Questify"* CTAs.

---

## 🎯 Faculty-Customizable Daily Quiz System

Faculty members have full control over curriculum sprints, scheduling, anti-collusion measures, and XP rewards:

### 1. Authoring & Settings (`/faculty/quizzes/new` & `edit`)
- **Metadata**: Title, Description, Course Tag (`CS-201`, `CS-302`), Difficulty (`Easy`, `Medium`, `Hard`).
- **Batch Targeting**: Multi-select cohorts (`2024-2028`, `2023-2027`, etc.).
- **Schedule Window**: Open and close date/time with timezone localization.
- **Time Limits**: Total quiz limit (mins) and optional per-question time limits (secs).
- **Anti-Collusion & Delivery**:
  - Shuffle question sequence toggle.
  - Shuffle MCQ choice letters toggle.
  - Question pool sampling (serve N random items).
  - Review visibility control: `immediately`, `after_close` (revealed only after deadline passes), or `never`.
- **Clamped XP Incentive Calibration**:
  - Question XP clamped strictly to `xpRules.quiz.maxPerQuestion` (ceiling: 50 XP).
  - Completion bonus clamped strictly to `xpRules.quiz.maxCompletionBonus` (ceiling: 100 XP).
  - *Academic Impact: NONE* (strictly non-academic reward per MSOT guidelines).

### 2. Multi-Type Question Builder
Supports 4 distinct question types with points/marks, diagrams, and explanations:
1. **Single MCQ**: Traditional single correct multiple choice.
2. **Multi MCQ**: Multiple select with multi-checkbox validation.
3. **True / False**: Binary assertion validation.
4. **Short Numeric**: Target numeric answer with acceptable tolerance delta ($\pm$).

### 3. Bulk CSV Importer (`CsvQuestionImporter`)
- Supports copy-paste or `.csv` upload with one-click sample template.
- Schema: `type,question,options,correct,explanation,marks,numeric_answer,tolerance`
- Real-time row-by-row parser with granular error reporting.

### 4. Student Sandbox Preview Modal (`QuizStudentPreviewModal`)
- Faculty can experience the student quiz UI, timer, and grading in a safe sandbox without altering student databases or awarding XP.

### 5. Post-Attempt Editing Guard & Audited Re-Score
- If student attempts exist (`attemptsCount > 0`), questions are guarded. Modifying answer keys automatically bumps the quiz version and provides an audited **Re-Score Quiz** procedure that re-evaluates student answers and reconciles XP balances.

### 6. Results & Analytics (`/faculty/quizzes/:id/results`)
- Total attempts, completion rate %, cohort mean score %, average completion duration.
- Score distribution histogram.
- Item difficulty & per-question accuracy % with "Common Pitfall / Most Missed Choice" callouts.
- Searchable student attempt roster with **Export to CSV** for university gradebooks.
- Automated integrity flags for impossible reading velocities or rapid submission bursts.

### 7. Student Experience (`/quiz`)
- Dynamically loads active live quiz targeted to student's cohort.
- Answer keys are **never transmitted to the client** prior to server-side evaluation.
- Strictly **one graded attempt** enforced via database constraints.
- Post-submission Review Mode conforms to quiz's `answer_visibility` rules.

---

## 🗺️ Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Startup landing page and habit engine preview |
| `/login` | Public | Segmented Student (ID + Pass) & Faculty (Google) login |
| `/auth/callback` | Public | Google OAuth session verification and allowlist check |
| `/dashboard` | Student | Student velocity HUD, streak tracker, and active practice |
| `/quiz` | Student | Daily Quiz sprint with single attempt guard and review mode |
| `/courses` | Student | Interactive curriculum map with authenticated lesson progress |
| `/coding` | Student | Sandboxed code arena with AST test normalization |
| `/leaderboard` | Authenticated | Inclusive campus and division leaderboard |
| `/leagues` | Student | Weekly cohort leagues with promotion cutoffs |
| `/battles` | Student | Algorithmic squad battles and team codes |
| `/achievements` | Student | Verified milestone badges and honors |
| `/rewards` | Student | Non-academic department perks catalog |
| `/community` | Authenticated | Requester-only Peer Help desk and course discussion forums |
| `/profile` | Authenticated | Student activity heatmap and passport |
| `/settings` | Authenticated | Account credentials, password change, audio toggles |
| `/faculty` | Faculty Only | Instructor governance, roster, password resets, audit trail |
| `/faculty/quizzes` | Faculty Only | Curriculum quiz catalog, status filters, and attempts overview |
| `/faculty/quizzes/new` | Faculty Only | Multi-type question builder and quiz authoring |
| `/faculty/quizzes/:id/edit` | Faculty Only | Quiz edit interface with post-attempt version lock |
| `/faculty/quizzes/:id/results` | Faculty Only | Analytics, accuracy breakdown, score histogram, CSV export |

---

## 💾 Database Migrations

Run both migrations in your Supabase project **SQL Editor**:
1. `supabase/migrations/20261010_questify_production_upgrade.sql`
   - Provisions `student_roster`, `profiles` role RLS, `peer_help_requests`, `coding_problems`, `audit_log`.
2. `supabase/migrations/20261011_faculty_auth_and_custom_quizzes.sql`
   - Provisions `system_config`, `faculty_allowlist`, `validate_faculty_google_signup` trigger.
   - Provisions `quizzes`, `quiz_questions`, `quiz_answer_keys` (strictly faculty-only RLS).
   - Provisions `custom_quiz_attempts` and RPCs: `verify_and_register_faculty_session`, `submit_custom_quiz_attempt`, `rescore_custom_quiz`, `get_active_student_quizzes`.

---

## 🚀 Running Locally

```bash
# If using portable Node in .tools/bin:
export PATH="$(pwd)/.tools/bin:$PATH"

# Run development server
npm run dev

# Run production build
npm run build
```
