import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CurrentUserProvider, useCurrentUser } from "./context/CurrentUser";
import { usePeople } from "./api/people";
import { PersonAvatar } from "./components/PersonAvatar";
import { ProjectsListPage } from "./pages/projects/ProjectsListPage";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { MyTasksPage } from "./pages/projects/MyTasksPage";
import { OrgChartPage } from "./pages/orgchart/OrgChartPage";
import { PerformancePage } from "./pages/performance/PerformancePage";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
  }`;

const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
    isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-500 hover:bg-gray-100"
  }`;

function ProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function OrgChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5V12M12 12 6.5 17M12 12l5.5 5" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12.5" y="8" width="3" height="10" />
      <rect x="18" y="5" width="3" height="13" />
    </svg>
  );
}

function CurrentUserSwitcher() {
  const { data: people } = usePeople();
  const { currentUserId, setCurrentUserId } = useCurrentUser();
  const current = people?.find((p) => p.id === currentUserId);

  return (
    <div className="flex items-center gap-2">
      <PersonAvatar person={current} size={30} />
      <select
        className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
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

function Sidebar() {
  const location = useLocation();
  const onPerformance = location.pathname.startsWith("/performance");

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-gray-200 shrink-0">
        <span className="text-lg font-bold text-indigo-600">DataSpark HR</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        <NavLink to="/projects" className={navLinkClass}>
          <ProjectsIcon />
          Projects
        </NavLink>
        <NavLink to="/my-tasks" className={navLinkClass}>
          <TasksIcon />
          My Tasks
        </NavLink>
        <NavLink to="/org-chart" className={navLinkClass}>
          <OrgChartIcon />
          Org Chart
        </NavLink>

        <NavLink to="/performance" className={navLinkClass}>
          <PerformanceIcon />
          Performance
        </NavLink>
        {onPerformance && (
          <div className="ml-[1.625rem] pl-2.5 border-l border-gray-200 flex flex-col gap-0.5 mt-0.5 mb-1">
            <NavLink to="/performance/kpis" className={subNavLinkClass}>
              KPI Sets
            </NavLink>
            <NavLink to="/performance/goals" className={subNavLinkClass}>
              Goals
            </NavLink>
            <NavLink to="/performance/strikes" className={subNavLinkClass}>
              Strike System
            </NavLink>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 p-3 shrink-0">
        <CurrentUserSwitcher />
      </div>
    </aside>
  );
}

function Shell() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/org-chart" element={<OrgChartPage />} />
            <Route path="/performance/*" element={<PerformancePage />} />
          </Routes>
        </div>
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
