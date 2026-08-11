import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { KpiSetsPage } from "./KpiSetsPage";
import { GoalsPage } from "./GoalsPage";
import { StrikesPage } from "./StrikesPage";

const subNavClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium ${
    isActive ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export function PerformancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Performance</h1>
      <nav className="flex items-center gap-1 mb-6 border-b border-gray-200 pb-4">
        <NavLink to="/performance/kpis" className={subNavClass}>
          KPI Sets
        </NavLink>
        <NavLink to="/performance/goals" className={subNavClass}>
          Goals
        </NavLink>
        <NavLink to="/performance/strikes" className={subNavClass}>
          Strike System
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/performance/kpis" replace />} />
        <Route path="kpis" element={<KpiSetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="strikes" element={<StrikesPage />} />
      </Routes>
    </div>
  );
}
