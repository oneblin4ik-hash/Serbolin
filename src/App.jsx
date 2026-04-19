import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './layout/Layout';
import TasksPage from './pages/TasksPage';
import CharacterPage from './pages/CharacterPage';
import ComingSoon from './pages/ComingSoon';
import { useTasksStore } from './store/useTasksStore';

export default function App() {
  const resetDailyIfNeeded = useTasksStore((s) => s.resetDailyIfNeeded);

  useEffect(() => {
    resetDailyIfNeeded();
    const id = setInterval(resetDailyIfNeeded, 60 * 1000);
    return () => clearInterval(id);
  }, [resetDailyIfNeeded]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/character" element={<CharacterPage />} />
        <Route
          path="/dashboard"
          element={
            <ComingSoon
              title="Главная"
              description="Сводка по всем разделам — задачи дня, XP, доходы, напоминания. Появится после раздела «Финансы»."
            />
          }
        />
        <Route
          path="/finance"
          element={
            <ComingSoon
              title="Личный кабинет"
              description="Учёт доходов и расходов, графики и цели по сбережениям."
            />
          }
        />
        <Route
          path="/crm"
          element={
            <ComingSoon
              title="CRM / Лиды"
              description="Воронка продаж, карточки клиентов, заметки по сделкам."
            />
          }
        />
        <Route
          path="/content"
          element={
            <ComingSoon
              title="Контент-план"
              description="Календарь постов и публикаций с отметкой статуса."
            />
          }
        />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Route>
    </Routes>
  );
}
