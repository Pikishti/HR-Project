import { useState } from "react";
import { Modal } from "../../components/Modal";
import { useCreatePerson, useDeletePerson, useUpdatePerson } from "../../api/people";
import type { Person } from "../../types";

const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

export function PersonFormModal({
  person,
  people,
  defaultManagerId,
  onClose,
}: {
  person?: Person;
  people: Person[];
  defaultManagerId?: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(person?.name ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [title, setTitle] = useState(person?.title ?? "");
  const [department, setDepartment] = useState(person?.department ?? "");
  const [managerId, setManagerId] = useState(person?.managerId ?? defaultManagerId ?? "");
  const [color, setColor] = useState(person?.avatarColor ?? COLORS[0]);
  const [status, setStatus] = useState<"active" | "inactive">(person?.status ?? "active");

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const data = {
      name,
      email,
      title: title || null,
      department: department || null,
      managerId: managerId || null,
      avatarColor: color,
      status,
    };
    if (person) {
      updatePerson.mutate({ id: person.id, data }, { onSuccess: onClose });
    } else {
      createPerson.mutate(data, { onSuccess: onClose });
    }
  }

  const managerOptions = people.filter((p) => p.id !== person?.id);

  return (
    <Modal title={person ? "Edit person" : "Add person"} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              autoFocus
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Department</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Manager</label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">No manager (top level)</option>
            {managerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
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
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {person ? (
            <button
              type="button"
              className="text-sm text-red-500 hover:text-red-700"
              onClick={() => {
                if (confirm(`Remove ${person.name} from the org chart?`)) {
                  deletePerson.mutate(person.id, { onSuccess: onClose });
                }
              }}
            >
              Delete person
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {person ? "Save changes" : "Add person"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
