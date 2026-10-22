import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider } from './context/AppContext';
import { RoleRoute } from './components/auth/RoleRoute';
import { StudentLayout } from './components/layout/StudentLayout';
import { FacultyLayout } from './components/layout/FacultyLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { FacultyLoginPage } from './pages/faculty/FacultyLoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// Student Pages (bundled for student speed)
import { DashboardPage } from './pages/DashboardPage';
import { DailyQuestPage } from './pages/DailyQuestPage';
import { QuizPage } from './pages/QuizPage';
import { CoursesPage } from './pages/CoursesPage';
import { CodingPage } from './pages/CodingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LeaguesPage } from './pages/LeaguesPage';
import { BattlesPage } from './pages/BattlesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { RewardsPage } from './pages/RewardsPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { XpHistoryPage } from './pages/XpHistoryPage';
import { Sparkles } from 'lucide-react';

// Faculty Pages (lazy-loaded to exclude faculty code from student bundles)
const FacultyPage = React.lazy(() => import('./pages/FacultyPage').then((m) => ({ default: m.FacultyPage })));
const CurriculumManagerPage = React.lazy(() =>
  import('./pages/faculty/CurriculumManagerPage').then((m) => ({ default: m.CurriculumManagerPage }))
);
const DailyQuestManagerPage = React.lazy(() =>
  import('./pages/faculty/DailyQuestManagerPage').then((m) => ({ default: m.DailyQuestManagerPage }))
);
const CodingProblemsManagerPage = React.lazy(() =>
  import('./pages/faculty/CodingProblemsManagerPage').then((m) => ({ default: m.CodingProblemsManagerPage }))
);
const QuizListPage = React.lazy(() => import('./pages/faculty/QuizListPage').then((m) => ({ default: m.QuizListPage })));
const QuizBuilderPage = React.lazy(() =>
  import('./pages/faculty/QuizBuilderPage').then((m) => ({ default: m.QuizBuilderPage }))
);
const QuizResultsPage = React.lazy(() =>
  import('./pages/faculty/QuizResultsPage').then((m) => ({ default: m.QuizResultsPage }))
);

const FacultyLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-sky shadow-glowSky animate-pulse flex items-center justify-center">
      <div className="w-full h-full bg-white/95 rounded-[14px] flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-quest-skyDark" />
      </div>
    </div>
    <p className="text-xs font-mono text-quest-textSecondary">Loading Faculty Operations Console...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Analytics />
        <Routes>
          {/* Public Authentication & Landing Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/faculty/login" element={<FacultyLoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Student Portal Shell (Role Protected) */}
          <Route
            element={
              <RoleRoute allowedRole="student">
                <StudentLayout />
              </RoleRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/daily-quest" element={<DailyQuestPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/battles" element={<BattlesPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/xp-history" element={<XpHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Faculty Portal Shell (Role Protected & Code-Split) */}
          <Route
            element={
              <RoleRoute allowedRole="faculty">
                <FacultyLayout />
              </RoleRoute>
            }
          >
            <Route
              path="/faculty"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/curriculum"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <CurriculumManagerPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/daily-quest"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <DailyQuestManagerPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/problems"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <CodingProblemsManagerPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/quizzes"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <QuizListPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/quizzes/new"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <QuizBuilderPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/quizzes/:id/edit"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <QuizBuilderPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/quizzes/:id/results"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <QuizResultsPage />
                </Suspense>
              }
            />
            <Route
              path="/faculty/battles"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage initialTab="overview" />
                </Suspense>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage initialTab="roster" />
                </Suspense>
              }
            />
            <Route
              path="/faculty/integrity"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage initialTab="anti-gaming" />
                </Suspense>
              }
            />
            <Route
              path="/faculty/announcements"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage initialTab="announcements" />
                </Suspense>
              }
            />
            <Route
              path="/faculty/audit"
              element={
                <Suspense fallback={<FacultyLoadingFallback />}>
                  <FacultyPage initialTab="anti-gaming" />
                </Suspense>
              }
            />
          </Route>

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
