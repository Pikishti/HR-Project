import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { CurrentUserProvider, useCurrentUser } from "./context/CurrentUser";
import { usePeople } from "./api/people";
import { PersonAvatar } from "./components/PersonAvatar";
import { ProjectsListPage } from "./pages/projects/ProjectsListPage";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { MyTasksPage } from "./pages/projects/MyTasksPage";
import { OrgChartPage } from "./pages/orgchart/OrgChartPage";
import { PerformancePage } from "./pages/performance/PerformancePage";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

function CurrentUserSwitcher() {
  const { data: people } = usePeople();
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const current = people?.find((p) => p.id === currentUserId);

  return (
    <div className="flex items-center gap-2">
      <PersonAvatar person={current} size={26} />
      <select
        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
        value={currentUserId ?? ""}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        <option value="" disabled>
          Acting as...
        </option>
        {people?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-indigo-600">DataSpark HR</span>
            <nav className="flex items-center gap-1">
              <NavLink to="/projects" className={navLinkClass}>
                Projects
              </NavLink>
              <NavLink to="/my-tasks" className={navLinkClass}>
                My Tasks
              </NavLink>
              <NavLink to="/org-chart" className={navLinkClass}>
                Org Chart
              </NavLink>
              <NavLink to="/performance" className={navLinkClass}>
                Performance
              </NavLink>
            </nav>
          </div>
          <CurrentUserSwitcher />
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/org-chart" element={<OrgChartPage />} />
          <Route path="/performance/*" element={<PerformancePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CurrentUserProvider>
      <Shell />
    </CurrentUserProvider>
  );
}
