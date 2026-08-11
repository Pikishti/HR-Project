import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Goal, InfractionCategory, Kpi, KpiSet, StrikeRecord, StrikeTier } from "../types";

const KPI_SETS_KEY = ["kpiSets"];
const GOALS_KEY = ["goals"];
const CATEGORIES_KEY = ["infractionCategories"];
const RECORDS_KEY = ["strikeRecords"];

export function useKpiSets() {
  return useQuery({ queryKey: KPI_SETS_KEY, queryFn: () => api.get<KpiSet[]>("/kpi-sets") });
}

export function useCreateKpiSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<KpiSet>) => api.post<KpiSet>("/kpi-sets", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KPI_SETS_KEY }),
  });
}

export function useDeleteKpiSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/kpi-sets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KPI_SETS_KEY }),
  });
}

export function useCreateKpi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Kpi>) => api.post<Kpi>("/kpis", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KPI_SETS_KEY }),
  });
}

export function useUpdateKpi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Kpi> }) => api.put<Kpi>(`/kpis/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KPI_SETS_KEY }),
  });
}

export function useDeleteKpi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/kpis/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KPI_SETS_KEY }),
  });
}

export function useGoals(ownerId?: string) {
  const qs = ownerId ? `?ownerId=${ownerId}` : "";
  return useQuery({
    queryKey: [...GOALS_KEY, ownerId ?? "all"],
    queryFn: () => api.get<Goal[]>(`/goals${qs}`),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Goal>) => api.post<Goal>("/goals", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) => api.put<Goal>(`/goals/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useInfractionCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => api.get<InfractionCategory[]>("/infraction-categories"),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<InfractionCategory>("/infraction-categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/infraction-categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useCreateTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: Partial<StrikeTier> }) =>
      api.post<StrikeTier>(`/infraction-categories/${categoryId}/tiers`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/infraction-categories/tiers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useStrikeRecords(filter?: { personId?: string; categoryId?: string }) {
  const params = new URLSearchParams();
  if (filter?.personId) params.set("personId", filter.personId);
  if (filter?.categoryId) params.set("categoryId", filter.categoryId);
  const qs = params.toString();
  return useQuery({
    queryKey: [...RECORDS_KEY, filter ?? {}],
    queryFn: () => api.get<StrikeRecord[]>(`/strike-records${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateStrikeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StrikeRecord>) => api.post<StrikeRecord>("/strike-records", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });
}

export function useDeleteStrikeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/strike-records/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });
}
