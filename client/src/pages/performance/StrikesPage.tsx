import { useMemo, useState } from "react";
import {
  useCreateCategory,
  useCreateStrikeRecord,
  useCreateTier,
  useDeleteCategory,
  useDeleteStrikeRecord,
  useDeleteTier,
  useInfractionCategories,
  useStrikeRecords,
} from "../../api/performance";
import { usePeople } from "../../api/people";
import { useCurrentUser } from "../../context/CurrentUser";
import { PersonAvatar } from "../../components/PersonAvatar";
import { Modal } from "../../components/Modal";

function NewCategoryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createCategory = useCreateCategory();
  return (
    <Modal title="New infraction category" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createCategory.mutate({ name, description: description || undefined }, { onSuccess: onClose });
        }}
      >
        <div>
          <label className="text-sm font-medium text-gray-700">Category name</label>
          <input
            autoFocus
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Attendance, Conduct, Quality"
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
        <button className="self-end bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700">
          Create category
        </button>
      </form>
    </Modal>
  );
}

function AddTierForm({ categoryId, nextLevel }: { categoryId: string; nextLevel: number }) {
  const [name, setName] = useState("");
  const [consequence, setConsequence] = useState("");
  const createTier = useCreateTier();
  return (
    <form
      className="flex flex-col gap-2 mt-2 border-t border-gray-100 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        createTier.mutate(
          { categoryId, data: { name, level: nextLevel, consequenceDescription: consequence || undefined } },
          { onSuccess: () => { setName(""); setConsequence(""); } }
        );
      }}
    >
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
          placeholder={`Tier ${nextLevel} name (e.g. Written Warning)`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="text-xs text-indigo-600 font-medium px-2">+ Add tier</button>
      </div>
      <input
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
        placeholder="Consequence (optional)"
        value={consequence}
        onChange={(e) => setConsequence(e.target.value)}
      />
    </form>
  );
}

function LogStrikeForm() {
  const { data: people } = usePeople();
  const { data: categories } = useInfractionCategories();
  const { currentUserId } = useCurrentUser();
  const [personId, setPersonId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tierId, setTierId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const createRecord = useCreateStrikeRecord();

  const category = categories?.find((c) => c.id === categoryId);

  return (
    <form
      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!personId || !categoryId || !tierId || !reason.trim()) return;
        createRecord.mutate(
          { personId, categoryId, tierId, reason, notes: notes || null, issuedById: currentUserId },
          {
            onSuccess: () => {
              setReason("");
              setNotes("");
            },
          }
        );
      }}
    >
      <h3 className="font-semibold text-gray-900">Log a strike</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Person</label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            <option value="">Select person...</option>
            {people?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setTierId("");
            }}
          >
            <option value="">Select category...</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Tier reached</label>
          <select
            className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
            disabled={!category}
          >
            <option value="">Select tier...</option>
            {category?.tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.level}. {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase">Reason</label>
        <input
          className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What happened?"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase">Notes (optional)</label>
        <textarea
          className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button className="self-end bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700">
        Log strike
      </button>
    </form>
  );
}

export function StrikesPage() {
  const { data: categories } = useInfractionCategories();
  const { data: records } = useStrikeRecords();
  const { data: people } = usePeople();
  const deleteCategory = useDeleteCategory();
  const deleteTier = useDeleteTier();
  const deleteRecord = useDeleteStrikeRecord();
  const [showNewCategory, setShowNewCategory] = useState(false);

  const ladderStatus = useMemo(() => {
    if (!records || !categories) return [];
    const key = (personId: string, categoryId: string) => `${personId}::${categoryId}`;
    const best = new Map<string, { level: number; tierName: string; count: number }>();
    for (const r of records) {
      if (r.expiresAt && new Date(r.expiresAt) < new Date()) continue;
      const k = key(r.personId, r.categoryId);
      const level = r.tier?.level ?? 0;
      const existing = best.get(k);
      if (!existing || level > existing.level) {
        best.set(k, { level, tierName: r.tier?.name ?? "", count: (existing?.count ?? 0) + 1 });
      } else {
        best.set(k, { ...existing, count: existing.count + 1 });
      }
    }
    return Array.from(best.entries()).map(([k, v]) => {
      const [personId, categoryId] = k.split("::");
      const person = people?.find((p) => p.id === personId);
      const cat = categories.find((c) => c.id === categoryId);
      return { person, category: cat, ...v, totalTiers: cat?.tiers.length ?? 0 };
    });
  }, [records, categories, people]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Infraction categories & tiers</h2>
          <button
            onClick={() => setShowNewCategory(true)}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
          >
            + New category
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Each category has its own ordered ladder of tiers — define custom tiers and consequences per category.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                </div>
                <button
                  onClick={() => confirm(`Delete category "${cat.name}"?`) && deleteCategory.mutate(cat.id)}
                  className="text-xs text-gray-300 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <ol className="mt-3 flex flex-col gap-1.5">
                {cat.tiers.map((tier) => (
                  <li key={tier.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center shrink-0">
                      {tier.level}
                    </span>
                    <span className="font-medium text-gray-700">{tier.name}</span>
                    {tier.consequenceDescription && (
                      <span className="text-xs text-gray-400">— {tier.consequenceDescription}</span>
                    )}
                    <button
                      onClick={() => deleteTier.mutate(tier.id)}
                      className="ml-auto text-gray-300 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
              <AddTierForm categoryId={cat.id} nextLevel={(cat.tiers.at(-1)?.level ?? 0) + 1} />
            </div>
          ))}
        </div>
      </div>

      {ladderStatus.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Current ladder standing</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium">Person</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Current tier</th>
                  <th className="px-4 py-2 font-medium">Strikes on record</th>
                </tr>
              </thead>
              <tbody>
                {ladderStatus.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <PersonAvatar person={row.person} size={22} />
                        {row.person?.name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{row.category?.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {row.level}. {row.tierName}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">of {row.totalTiers}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <LogStrikeForm />
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 font-semibold text-gray-900 text-sm">Strike history</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2 font-medium">Person</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Tier</th>
                <th className="px-4 py-2 font-medium">Reason</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records?.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <PersonAvatar person={r.person} size={20} />
                      {r.person?.name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{r.category?.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.tier?.name}</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">
                    {new Date(r.dateIssued).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => deleteRecord.mutate(r.id)} className="text-xs text-gray-300 hover:text-red-500">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {(!records || records.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                    No strikes logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewCategory && <NewCategoryModal onClose={() => setShowNewCategory(false)} />}
    </div>
  );
}
