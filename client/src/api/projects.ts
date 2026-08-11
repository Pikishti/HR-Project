import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Project, Section } from "../types";

const KEY = ["projects"];

export function useProjects() {
  return useQuery({ queryKey: KEY, queryFn: () => api.get<Project[]>("/projects") });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.post<Project>("/projects", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api.put<Project>(`/projects/${id}`, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateSection(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Section>) => api.post<Section>(`/projects/${projectId}/sections`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, projectId] }),
  });
}

export function useUpdateSection(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Section> }) =>
      api.put<Section>(`/projects/sections/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, projectId] }),
  });
}

export function useDeleteSection(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/projects/sections/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, projectId] }),
  });
}
