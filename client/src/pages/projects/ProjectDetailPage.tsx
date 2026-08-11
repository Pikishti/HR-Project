import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useProject, useCreateSection, useDeleteSection, useUpdateSection } from "../../api/projects";
import { useCreateTask, useMoveTask, useUpdateTask } from "../../api/tasks";
import { PersonAvatar } from "../../components/PersonAvatar";
import { PriorityBadge, TagPill } from "../../components/Badges";
import { TaskDetailModal } from "./TaskDetailModal";
import type { Task } from "../../types";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TaskCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const updateTask = useUpdateTask();
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => onOpen(task.id)}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateTask.mutate({ id: task.id, data: { completed: e.target.checked } })}
          className="mt-0.5"
        />
        <p className={`text-sm font-medium flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.name}
        </p>
        <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 px-1">
          ⠿
        </span>
      </div>
      <div className="flex items-center flex-wrap gap-1.5 mt-2 ml-6">
        {task.tags?.map((t) => <TagPill key={t.tagId} name={t.tag.name} color={t.tag.color} />)}
      </div>
      <div className="flex items-center justify-between mt-2 ml-6">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>}
        </div>
        <PersonAvatar person={task.assignee} size={22} />
      </div>
    </div>
  );
}

function BoardColumn({
  sectionId,
  name,
  tasks,
  onOpen,
  onRename,
  onDelete,
  onQuickAdd,
}: {
  sectionId: string;
  name: string;
  tasks: Task[];
  onOpen: (id: string) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onQuickAdd: (name: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: sectionId });
  const [quickAdd, setQuickAdd] = useState("");

  return (
    <div className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <input
          className="text-sm font-semibold text-gray-700 bg-transparent outline-none w-40"
          defaultValue={name}
          onBlur={(e) => e.target.value.trim() && e.target.value !== name && onRename(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{tasks.length}</span>
          <button onClick={onDelete} className="text-gray-300 hover:text-red-500 text-xs">
            ✕
          </button>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-2 min-h-[120px] ${isOver ? "bg-indigo-50" : "bg-gray-50"}`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} />
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!quickAdd.trim()) return;
            onQuickAdd(quickAdd);
            setQuickAdd("");
          }}
        >
          <input
            className="w-full text-sm bg-transparent px-2 py-1.5 rounded-md outline-none placeholder:text-gray-400 hover:bg-white focus:bg-white"
            placeholder="+ Add task"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

function ListRow({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const updateTask = useUpdateTask();
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={() => onOpen(task.id)}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => updateTask.mutate({ id: task.id, data: { completed: e.target.checked } })}
      />
      <span className={`flex-1 text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
        {task.name}
      </span>
      <div className="flex items-center gap-1.5">
        {task.tags?.map((t) => <TagPill key={t.tagId} name={t.tag.name} color={t.tag.color} />)}
      </div>
      <PriorityBadge priority={task.priority} />
      {task.dueDate && <span className="text-xs text-gray-400 w-16">{formatDate(task.dueDate)}</span>}
      <PersonAvatar person={task.assignee} size={22} />
    </div>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const createSection = useCreateSection(projectId!);
  const updateSection = useUpdateSection(projectId!);
  const deleteSection = useDeleteSection(projectId!);
  const createTask = useCreateTask();
  const moveTask = useMoveTask();
  const [view, setView] = useState<"board" | "list">("board");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksBySection = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const section of project?.sections ?? []) map.set(section.id, []);
    for (const task of project?.tasks ?? []) {
      if (!task.sectionId) continue;
      map.get(task.sectionId)?.push(task);
    }
    return map;
  }, [project]);

  if (!project) return <p className="text-gray-500 text-sm">Loading project...</p>;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const task = project!.tasks?.find((t) => t.id === taskId);
    if (!task) return;

    const overId = String(over.id);
    const isOverSection = project!.sections?.some((s) => s.id === overId);
    const targetSectionId = isOverSection ? overId : project!.tasks?.find((t) => t.id === overId)?.sectionId;
    if (!targetSectionId) return;

    const targetTasks = (tasksBySection.get(targetSectionId) ?? []).filter((t) => t.id !== taskId);
    const insertIndex = isOverSection ? targetTasks.length : targetTasks.findIndex((t) => t.id === overId);
    const finalIndex = insertIndex === -1 ? targetTasks.length : insertIndex;
    targetTasks.splice(finalIndex, 0, task);

    targetTasks.forEach((t, idx) => {
      if (t.id === taskId || t.sectionId !== targetSectionId || t.order !== idx) {
        moveTask.mutate({ id: t.id, sectionId: targetSectionId, order: idx });
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("board")}
            className={`px-3 py-1 text-sm rounded-md ${view === "board" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 text-sm rounded-md ${view === "list" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            List
          </button>
        </div>
      </div>

      {view === "board" ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {project.sections?.map((section) => (
              <BoardColumn
                key={section.id}
                sectionId={section.id}
                name={section.name}
                tasks={tasksBySection.get(section.id) ?? []}
                onOpen={setOpenTaskId}
                onRename={(name) => updateSection.mutate({ id: section.id, data: { name } })}
                onDelete={() => confirm(`Delete section "${section.name}"?`) && deleteSection.mutate(section.id)}
                onQuickAdd={(name) =>
                  createTask.mutate({
                    projectId: project.id,
                    sectionId: section.id,
                    name,
                    order: (tasksBySection.get(section.id)?.length ?? 0),
                  })
                }
              />
            ))}
            <button
              onClick={() => createSection.mutate({ name: "New section", order: project.sections?.length ?? 0 })}
              className="w-56 shrink-0 h-10 self-start text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
            >
              + Add section
            </button>
          </div>
        </DndContext>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {project.sections?.map((section) => (
            <div key={section.id}>
              <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>{section.name}</span>
                <span className="text-xs text-gray-400">{(tasksBySection.get(section.id) ?? []).length}</span>
              </div>
              {(tasksBySection.get(section.id) ?? []).map((task) => (
                <ListRow key={task.id} task={task} onOpen={setOpenTaskId} />
              ))}
              <QuickAddRow
                onAdd={(name) =>
                  createTask.mutate({
                    projectId: project.id,
                    sectionId: section.id,
                    name,
                    order: tasksBySection.get(section.id)?.length ?? 0,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}

function QuickAddRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value);
        setValue("");
      }}
    >
      <input
        className="w-full text-sm outline-none placeholder:text-gray-400"
        placeholder="+ Add task"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
