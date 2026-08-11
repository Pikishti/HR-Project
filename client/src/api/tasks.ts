import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Comment, Tag, Task } from "../types";

const KEY = ["tasks"];
const PROJECTS_KEY = ["projects"];

export function useTasks(filter?: { projectId?: string; assigneeId?: string; completed?: boolean }) {
  const params = new URLSearchParams();
  if (filter?.projectId) params.set("projectId", filter.projectId);
  if (filter?.assigneeId) params.set("assigneeId", filter.assigneeId);
  if (filter?.completed !== undefined) params.set("completed", String(filter.completed));
  const qs = params.toString();
  return useQuery({
    queryKey: [...KEY, filter ?? {}],
    queryFn: () => api.get<Task[]>(`/tasks${qs ? `?${qs}` : ""}`),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  });
}

function invalidateTaskState(qc: ReturnType<typeof useQueryClient>, projectId?: string) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: PROJECTS_KEY });
  if (projectId) qc.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId] });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => api.post<Task>("/tasks", data),
    onSuccess: (task) => invalidateTaskState(qc, task.projectId),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      api.put<Task>(`/tasks/${id}`, data),
    onSuccess: (task) => invalidateTaskState(qc, task.projectId),
  });
}

export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sectionId, order }: { id: string; sectionId: string | null; order: number }) =>
      api.patch<Task>(`/tasks/${id}/move`, { sectionId, order }),
    onSuccess: (task) => invalidateTaskState(qc, task.projectId),
  });
}

export function useDeleteTask(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/tasks/${id}`),
    onSuccess: () => invalidateTaskState(qc, projectId),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, authorId, body }: { taskId: string; authorId: string; body: string }) =>
      api.post<Comment>(`/tasks/${taskId}/comments`, { authorId, body }),
    onSuccess: (_c, vars) => qc.invalidateQueries({ queryKey: [...KEY, vars.taskId] }),
  });
}

export function useTags() {
  return useQuery({ queryKey: ["tags"], queryFn: () => api.get<Tag[]>("/tags") });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => api.post<Tag>("/tags", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useAddTagToTask(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      api.post<Task>(`/tasks/${taskId}/tags`, { tagId }),
    onSuccess: () => invalidateTaskState(qc, projectId),
  });
}

export function useRemoveTagFromTask(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      api.delete<void>(`/tasks/${taskId}/tags/${tagId}`),
    onSuccess: () => invalidateTaskState(qc, projectId),
  });
}
