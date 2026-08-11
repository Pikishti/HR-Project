import { Navigate, Route, Routes } from "react-router-dom";
import { KpiSetsPage } from "./KpiSetsPage";
import { GoalsPage } from "./GoalsPage";
import { StrikesPage } from "./StrikesPage";

export function PerformancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Performance</h1>
      <Routes>
        <Route path="/" element={<Navigate to="/performance/kpis" replace />} />
        <Route path="kpis" element={<KpiSetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="strikes" element={<StrikesPage />} />
      </Routes>
    </div>
  );
}
