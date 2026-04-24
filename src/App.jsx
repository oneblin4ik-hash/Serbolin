import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useTasksStore } from './store/useTasksStore';
import { useQuestStore } from './store/useQuestStore';
import Layout from './layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CharacterPage from './pages/CharacterPage';
import QuestsPage from './pages/QuestsPage';
import ContentPage from './pages/ContentPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProjectsPage from './pages/ProjectsPage';
import CrmPage from './pages/CrmPage';
import WalletPage from './pages/WalletPage';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  const { session, loading, init } = useAuthStore();
  const resetDailyIfNeeded = useTasksStore((s) => s.resetDailyIfNeeded);
  const initQuests         = useQuestStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!session) return;
    resetDailyIfNeeded();
    initQuests();
    const id = setInterval(() => { resetDailyIfNeeded(); initQuests(); }, 60_000);
    return () => clearInterval(id);
  }, [session, resetDailyIfNeeded, initQuests]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="font-display text-brand-gold text-2xl font-black animate-pulse">SSS</div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/tasks"      element={<TasksPage />} />
        <Route path="/character"  element={<CharacterPage />} />
        <Route path="/quests"     element={<QuestsPage />} />
        <Route path="/content"    element={<ContentPage />} />
        <Route path="/workouts"   element={<WorkoutsPage />} />
        <Route path="/projects"   element={<ProjectsPage />} />
        <Route path="/crm"        element={<CrmPage />} />
        <Route path="/wallet"     element={<WalletPage />} />
        <Route path="/finance"    element={<Navigate to="/wallet" replace />} />
        <Route path="*"           element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
