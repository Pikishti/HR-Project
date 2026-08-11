import { useMemo, useState } from "react";
import { useCurrentUser } from "../../context/CurrentUser";
import { useTasks } from "../../api/tasks";
import { useUpdateTask } from "../../api/tasks";
import { PriorityBadge, TagPill } from "../../components/Badges";
import { TaskDetailModal } from "./TaskDetailModal";
import type { Task } from "../../types";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function bucketFor(task: Task): string {
  if (task.completed) return "Completed";
  if (!task.dueDate) return "No due date";
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(task.dueDate));
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays <= 7) return "This week";
  return "Later";
}

const BUCKET_ORDER = ["Overdue", "Today", "This week", "Later", "No due date", "Completed"];

function Row({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
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
      <span className="text-xs text-gray-400">{task.project?.name}</span>
      <div className="flex items-center gap-1.5">
        {task.tags?.map((t) => <TagPill key={t.tagId} name={t.tag.name} color={t.tag.color} />)}
      </div>
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

export function MyTasksPage() {
  const { currentUserId } = useCurrentUser();
  const { data: tasks } = useTasks(currentUserId ? { assigneeId: currentUserId } : undefined);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const bucket of BUCKET_ORDER) map.set(bucket, []);
    for (const task of tasks ?? []) {
      map.get(bucketFor(task))?.push(task);
    }
    return map;
  }, [tasks]);

  if (!currentUserId) {
    return <p className="text-gray-500 text-sm">Choose a person from "Acting as" in the top bar to see their tasks.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tasks</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {BUCKET_ORDER.map((bucket) => {
          const items = grouped.get(bucket) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={bucket}>
              <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                {bucket} <span className="text-xs text-gray-400 font-normal">({items.length})</span>
              </div>
              {items.map((task) => (
                <Row key={task.id} task={task} onOpen={setOpenTaskId} />
              ))}
            </div>
          );
        })}
        {(tasks?.length ?? 0) === 0 && (
          <p className="text-sm text-gray-400 p-6 text-center">No tasks assigned. 🎉</p>
        )}
      </div>
      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}
