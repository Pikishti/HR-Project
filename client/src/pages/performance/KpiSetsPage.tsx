import { useState } from "react";
import {
  useCreateKpi,
  useCreateKpiSet,
  useDeleteKpi,
  useDeleteKpiSet,
  useKpiSets,
  useUpdateKpi,
} from "../../api/performance";
import { usePeople } from "../../api/people";
import { PersonAvatar } from "../../components/PersonAvatar";
import { ProgressBar } from "../../components/ProgressBar";
import { Modal } from "../../components/Modal";
import type { KpiPeriod, MetricStatus } from "../../types";

function NewSetModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createSet = useCreateKpiSet();
  return (
    <Modal title="New KPI set" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createSet.mutate({ name, description: description || null }, { onSuccess: onClose });
        }}
      >
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            autoFocus
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Engineering — Q3 KPIs"
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
          Create set
        </button>
      </form>
    </Modal>
  );
}

function NewKpiModal({ kpiSetId, onClose }: { kpiSetId: string; onClose: () => void }) {
  const { data: people } = usePeople();
  const [name, setName] = useState("");
  const [metricUnit, setMetricUnit] = useState("");
  const [targetValue, setTargetValue] = useState("100");
  const [currentValue, setCurrentValue] = useState("0");
  const [personId, setPersonId] = useState("");
  const [period, setPeriod] = useState<KpiPeriod>("quarterly");
  const [status, setStatus] = useState<MetricStatus>("on-track");
  const createKpi = useCreateKpi();

  return (
    <Modal title="New KPI" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createKpi.mutate(
            {
              kpiSetId,
              name,
              metricUnit: metricUnit || null,
              targetValue: Number(targetValue) || 0,
              currentValue: Number(currentValue) || 0,
              personId: personId || null,
              period,
              status,
            },
            { onSuccess: onClose }
          );
        }}
      >
        <div>
          <label className="text-sm font-medium text-gray-700">KPI name</label>
          <input
            autoFocus
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint velocity"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Target value</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Current value</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Unit</label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={metricUnit}
              onChange={(e) => setMetricUnit(e.target.value)}
              placeholder="e.g. %, pts, $"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Period</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as KpiPeriod)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Owner</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
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
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as MetricStatus)}
            >
              <option value="on-track">On track</option>
              <option value="at-risk">At risk</option>
              <option value="off-track">Off track</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <button className="self-end bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700">
          Add KPI
        </button>
      </form>
    </Modal>
  );
}

export function KpiSetsPage() {
  const { data: sets } = useKpiSets();
  const deleteSet = useDeleteKpiSet();
  const deleteKpi = useDeleteKpi();
  const updateKpi = useUpdateKpi();
  const [showNewSet, setShowNewSet] = useState(false);
  const [addingKpiTo, setAddingKpiTo] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNewSet(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New KPI set
        </button>
      </div>

      {sets?.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          No KPI sets yet. Create one to start tracking metrics.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {sets?.map((set) => (
          <div key={set.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">{set.name}</h3>
                {set.description && <p className="text-xs text-gray-500">{set.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddingKpiTo(set.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add KPI
                </button>
                <button
                  onClick={() => confirm(`Delete KPI set "${set.name}"?`) && deleteSet.mutate(set.id)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
            {set.kpis && set.kpis.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">KPI</th>
                    <th className="px-4 py-2 font-medium">Owner</th>
                    <th className="px-4 py-2 font-medium">Progress</th>
                    <th className="px-4 py-2 font-medium">Period</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {set.kpis.map((kpi) => {
                    const pct = kpi.targetValue ? Math.min(100, (kpi.currentValue / kpi.targetValue) * 100) : 0;
                    return (
                      <tr key={kpi.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{kpi.name}</td>
                        <td className="px-4 py-2.5">
                          <PersonAvatar person={kpi.person} size={22} />
                        </td>
                        <td className="px-4 py-2.5 w-48">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={pct} />
                            <span className="text-xs text-gray-500 shrink-0">
                              {kpi.currentValue}/{kpi.targetValue} {kpi.metricUnit}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 capitalize text-gray-500">{kpi.period}</td>
                        <td className="px-4 py-2.5">
                          <select
                            className="text-xs border-0 bg-transparent"
                            value={kpi.status}
                            onChange={(e) =>
                              updateKpi.mutate({ id: kpi.id, data: { status: e.target.value as MetricStatus } })
                            }
                          >
                            <option value="on-track">On track</option>
                            <option value="at-risk">At risk</option>
                            <option value="off-track">Off track</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => deleteKpi.mutate(kpi.id)}
                            className="text-xs text-gray-300 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 px-4 py-4">No KPIs in this set yet.</p>
            )}
          </div>
        ))}
      </div>

      {showNewSet && <NewSetModal onClose={() => setShowNewSet(false)} />}
      {addingKpiTo && <NewKpiModal kpiSetId={addingKpiTo} onClose={() => setAddingKpiTo(null)} />}
    </div>
  );
}
