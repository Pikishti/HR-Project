import { useState } from "react";
import { Modal } from "../../components/Modal";
import { PersonAvatar } from "../../components/PersonAvatar";
import { TagPill } from "../../components/Badges";
import { usePeople } from "../../api/people";
import {
  useAddComment,
  useAddTagToTask,
  useCreateTag,
  useCreateTask,
  useDeleteTask,
  useRemoveTagFromTask,
  useTags,
  useTask,
  useUpdateTask,
} from "../../api/tasks";
import { useCurrentUser } from "../../context/CurrentUser";
import type { Priority } from "../../types";

export function TaskDetailModal({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { data: task } = useTask(taskId);
  const { data: people } = usePeople();
  const { data: tags } = useTags();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask(task?.projectId);
  const addComment = useAddComment();
  const addTag = useAddTagToTask(task?.projectId);
  const removeTag = useRemoveTagFromTask(task?.projectId);
  const createTag = useCreateTag();
  const createTask = useCreateTask();
  const { currentUserId } = useCurrentUser();

  const [commentBody, setCommentBody] = useState("");
  const [subtaskName, setSubtaskName] = useState("");
  const [descDraft, setDescDraft] = useState<string | null>(null);

  if (!task) return null;

  const description = descDraft ?? task.description ?? "";
  const appliedTagIds = new Set(task.tags?.map((t) => t.tagId));

  return (
    <Modal title="" onClose={onClose} width={640}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <input
            className="text-lg font-semibold text-gray-900 flex-1 outline-none border-b border-transparent focus:border-gray-200 pb-1"
            value={task.name}
            onChange={(e) => updateTask.mutate({ id: task.id, data: { name: e.target.value } })}
          />
          <button
            onClick={() => {
              if (confirm("Delete this task?")) {
                deleteTask.mutate(task.id, { onSuccess: onClose });
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 shrink-0"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Assignee</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5"
              value={task.assigneeId ?? ""}
              onChange={(e) =>
                updateTask.mutate({ id: task.id, data: { assigneeId: e.target.value || null } })
              }
            >
              <option value="">Unassigned</option>
              {people?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Due date</label>
            <input
              type="date"
              className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                updateTask.mutate({
                  id: task.id,
                  data: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null },
                })
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5"
              value={task.priority}
              onChange={(e) =>
                updateTask.mutate({ id: task.id, data: { priority: e.target.value as Priority } })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => updateTask.mutate({ id: task.id, data: { completed: e.target.checked } })}
              />
              Completed
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
          <textarea
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={() => {
              if (descDraft !== null) updateTask.mutate({ id: task.id, data: { description: descDraft } });
            }}
            placeholder="Add a description..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Tags</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {task.tags?.map((t) => (
              <button key={t.tagId} onClick={() => removeTag.mutate({ taskId: task.id, tagId: t.tagId })}>
                <TagPill name={`${t.tag.name} ×`} color={t.tag.color} />
              </button>
            ))}
            <select
              className="text-xs border border-gray-200 rounded-full px-2 py-1"
              value=""
              onChange={(e) => {
                if (e.target.value) addTag.mutate({ taskId: task.id, tagId: e.target.value });
              }}
            >
              <option value="">+ Add tag</option>
              {tags?.filter((t) => !appliedTagIds.has(t.id)).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="text-xs text-gray-400 hover:text-gray-700"
              onClick={() => {
                const name = prompt("New tag name");
                if (name) createTag.mutate({ name });
              }}
            >
              + New tag
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">
            Subtasks {task.subtasks && task.subtasks.length > 0 ? `(${task.subtasks.length})` : ""}
          </label>
          <div className="mt-1 flex flex-col gap-1">
            {task.subtasks?.map((st) => (
              <label key={st.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={(e) =>
                    updateTask.mutate({ id: st.id, data: { completed: e.target.checked } })
                  }
                />
                <span className={st.completed ? "line-through text-gray-400" : ""}>{st.name}</span>
              </label>
            ))}
            <form
              className="flex gap-2 mt-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (!subtaskName.trim()) return;
                createTask.mutate(
                  { projectId: task.projectId, parentTaskId: task.id, name: subtaskName, sectionId: null },
                  { onSuccess: () => setSubtaskName("") }
                );
              }}
            >
              <input
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                placeholder="Add subtask..."
                value={subtaskName}
                onChange={(e) => setSubtaskName(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Comments</label>
          <div className="mt-2 flex flex-col gap-3 max-h-48 overflow-y-auto">
            {task.comments?.map((c) => (
              <div key={c.id} className="flex gap-2">
                <PersonAvatar person={c.author} size={24} />
                <div>
                  <p className="text-xs font-medium text-gray-700">{c.author?.name}</p>
                  <p className="text-sm text-gray-600">{c.body}</p>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <p className="text-sm text-gray-400">No comments yet.</p>
            )}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentBody.trim() || !currentUserId) return;
              addComment.mutate(
                { taskId: task.id, authorId: currentUserId, body: commentBody },
                { onSuccess: () => setCommentBody("") }
              );
            }}
          >
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Write a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button
              type="submit"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              disabled={!currentUserId}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
