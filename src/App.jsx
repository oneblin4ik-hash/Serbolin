import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useQuestStore } from './store/useQuestStore';
import Layout from './layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CharacterPage from './pages/CharacterPage';
import QuestsPage from './pages/QuestsPage';
import ContentPage from './pages/ContentPage';
import WorkoutsPage from './pages/WorkoutsPage';
import CrmPage from './pages/CrmPage';
import WalletPage from './pages/WalletPage';

export default function App() {
  const { session, loading, init } = useAuthStore();
  const initQuests = useQuestStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!session) return;
    initQuests();
    const id = setInterval(() => { initQuests(); }, 60_000);
    return () => clearInterval(id);
  }, [session, initQuests]);

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
        <Route index                element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/character"    element={<CharacterPage />} />
        <Route path="/quests"       element={<QuestsPage />} />
        <Route path="/workouts"     element={<WorkoutsPage />} />
        <Route path="/content"      element={<ContentPage />} />
        <Route path="/crm"          element={<CrmPage />} />
        <Route path="/wallet"       element={<WalletPage />} />
        <Route path="/tasks"        element={<Navigate to="/quests" replace />} />
        <Route path="/projects"     element={<Navigate to="/quests" replace />} />
        <Route path="/finance"      element={<Navigate to="/wallet" replace />} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
