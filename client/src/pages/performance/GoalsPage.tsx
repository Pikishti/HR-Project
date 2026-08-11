import { useState } from "react";
import { useCreateGoal, useDeleteGoal, useGoals, useUpdateGoal } from "../../api/performance";
import { usePeople } from "../../api/people";
import { PersonAvatar } from "../../components/PersonAvatar";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusBadge } from "../../components/Badges";
import { Modal } from "../../components/Modal";
import type { MetricStatus } from "../../types";

function NewGoalModal({ onClose }: { onClose: () => void }) {
  const { data: people } = usePeople();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const createGoal = useCreateGoal();

  return (
    <Modal title="New goal" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !ownerId) return;
          createGoal.mutate(
            {
              title,
              description: description || null,
              ownerId,
              targetDate: targetDate ? new Date(targetDate).toISOString() : null,
            },
            { onSuccess: onClose }
          );
        }}
      >
        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            autoFocus
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ship v2 onboarding flow"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Owner</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">Select owner...</option>
              {people?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Target date</label>
            <input
              type="date"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>
        <button
          disabled={!ownerId}
          className="self-end bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Create goal
        </button>
      </form>
    </Modal>
  );
}

export function GoalsPage() {
  const { data: goals } = useGoals();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNew(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New goal
        </button>
      </div>

      {goals?.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          No goals yet. Set your first goal.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals?.map((goal) => (
          <div key={goal.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
              <button
                onClick={() => deleteGoal.mutate(goal.id)}
                className="text-xs text-gray-300 hover:text-red-500 shrink-0"
              >
                ✕
              </button>
            </div>
            {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
            <div className="flex items-center gap-2 mt-3">
              <PersonAvatar person={goal.owner} size={22} />
              <span className="text-sm text-gray-600">{goal.owner?.name}</span>
              {goal.targetDate && (
                <span className="text-xs text-gray-400 ml-auto">
                  Due {new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={goal.progress} />
              <input
                type="number"
                min={0}
                max={100}
                className="w-14 text-sm border border-gray-200 rounded-lg px-1.5 py-1"
                value={goal.progress}
                onChange={(e) =>
                  updateGoal.mutate({ id: goal.id, data: { progress: Number(e.target.value) } })
                }
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge status={goal.status} />
              <select
                className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                value={goal.status}
                onChange={(e) => updateGoal.mutate({ id: goal.id, data: { status: e.target.value as MetricStatus } })}
              >
                <option value="on-track">On track</option>
                <option value="at-risk">At risk</option>
                <option value="off-track">Off track</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {showNew && <NewGoalModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
