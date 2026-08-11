import { useState } from "react";
import { Link } from "react-router-dom";
import { useCreateProject, useProjects } from "../../api/projects";
import { Modal } from "../../components/Modal";

const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const createProject = useCreateProject();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createProject.mutate(
      { name, description: description || null, color },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            autoFocus
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Relaunch"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Color</label>
          <div className="mt-1 flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-gray-900" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={createProject.isPending}
          className="self-end bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create project
        </button>
      </form>
    </Modal>
  );
}

export function ProjectsListPage() {
  const { data: projects, isLoading } = useProjects();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowNew(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New project
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading projects...</p>}

      {!isLoading && projects?.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          No projects yet. Create your first project to get started.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
              <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
            )}
            <p className="text-xs text-gray-400">{project._count?.tasks ?? 0} tasks</p>
          </Link>
        ))}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
