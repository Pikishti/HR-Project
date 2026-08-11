import { useMemo, useState } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import { usePeople, useReassignManager } from "../../api/people";
import { PersonAvatar } from "../../components/PersonAvatar";
import { PersonFormModal } from "./PersonFormModal";
import type { Person } from "../../types";

type TreeDatum = { person: Person | null; children: TreeDatum[] };

const NODE_W = 176;
const NODE_H = 84;
const H_GAP = 32;
const V_GAP = 70;

export function OrgChartPage() {
  const { data: people } = usePeople();
  const reassignManager = useReassignManager();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showNew, setShowNew] = useState<{ managerId: string | null } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const layout = useMemo(() => {
    if (!people || people.length === 0) return null;
    const byManager = new Map<string | null, Person[]>();
    for (const p of people) {
      const key = p.managerId ?? null;
      if (!byManager.has(key)) byManager.set(key, []);
      byManager.get(key)!.push(p);
    }
    function build(person: Person | null): TreeDatum {
      const children = person ? byManager.get(person.id) ?? [] : byManager.get(null) ?? [];
      return { person, children: children.map((c) => build(c)) };
    }
    const root = hierarchy(build(null), (d) => d.children);
    const treeLayout = tree<TreeDatum>().nodeSize([NODE_W + H_GAP, NODE_H + V_GAP]);
    treeLayout(root);

    const nodes = root.descendants().filter((d) => d.data.person);
    const links = root.links().filter((l) => l.source.data.person);

    const xs = nodes.map((n) => n.x!);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, 0);
    const maxY = Math.max(...nodes.map((n) => n.y!), 0);

    return {
      nodes,
      links,
      offsetX: -minX + NODE_W / 2,
      width: maxX - minX + NODE_W,
      height: maxY + NODE_H + 40,
    };
  }, [people]);

  if (!people) return <p className="text-gray-500 text-sm">Loading org chart...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Org Chart</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="w-7 h-7 text-sm rounded-md hover:bg-white">
              −
            </button>
            <span className="text-xs w-10 text-center text-gray-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="w-7 h-7 text-sm rounded-md hover:bg-white">
              +
            </button>
          </div>
          <button
            onClick={() => setShowNew({ managerId: null })}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add person
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">Drag a card onto another to reassign their manager.</p>

      {people.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          No one on the chart yet. Add your first person to get started.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl bg-white overflow-auto" style={{ maxHeight: "70vh" }}>
          <div
            className="relative"
            style={{
              width: (layout?.width ?? 0) * zoom,
              height: (layout?.height ?? 0) * zoom,
              margin: "24px auto",
            }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: layout?.width, height: layout?.height }}>
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={layout?.width}
                height={layout?.height}
              >
                {layout?.links.map((link, i) => {
                  const sx = link.source.x! + layout.offsetX;
                  const sy = link.source.y! + NODE_H;
                  const tx = link.target.x! + layout.offsetX;
                  const ty = link.target.y!;
                  const midY = (sy + ty) / 2;
                  return (
                    <path
                      key={i}
                      d={`M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>

              {layout?.nodes.map((node) => {
                const person = node.data.person!;
                const x = node.x! + layout.offsetX - NODE_W / 2;
                const y = node.y!;
                const isDropTarget = dragOverId === person.id;
                return (
                  <div
                    key={person.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/personId", person.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(person.id);
                    }}
                    onDragLeave={() => setDragOverId((id) => (id === person.id ? null : id))}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverId(null);
                      const draggedId = e.dataTransfer.getData("text/personId");
                      if (!draggedId || draggedId === person.id) return;
                      reassignManager.mutate({ id: draggedId, managerId: person.id });
                    }}
                    onClick={() => setEditingPerson(person)}
                    className={`absolute rounded-xl border bg-white shadow-sm p-3 cursor-pointer transition-colors ${
                      isDropTarget ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200 hover:shadow-md"
                    }`}
                    style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
                  >
                    <div className="flex items-center gap-2">
                      <PersonAvatar person={person} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{person.name}</p>
                        <p className="text-xs text-gray-500 truncate">{person.title ?? "—"}</p>
                      </div>
                    </div>
                    {person.department && (
                      <p className="text-[11px] text-gray-400 mt-1.5 truncate">{person.department}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div
        className="mt-3 border border-dashed border-gray-300 rounded-lg px-4 py-2 text-xs text-gray-400 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData("text/personId");
          if (draggedId) reassignManager.mutate({ id: draggedId, managerId: null });
        }}
      >
        Drop here to remove a manager (make top-level)
      </div>

      {editingPerson && (
        <PersonFormModal person={editingPerson} people={people} onClose={() => setEditingPerson(null)} />
      )}
      {showNew && (
        <PersonFormModal
          people={people}
          defaultManagerId={showNew.managerId}
          onClose={() => setShowNew(null)}
        />
      )}
    </div>
  );
}
