import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Person } from "../types";

const KEY = ["people"];

export function usePeople() {
  return useQuery({ queryKey: KEY, queryFn: () => api.get<Person[]>("/people") });
}

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => api.get<Person>(`/people/${id}`),
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Person>) => api.post<Person>("/people", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Person> }) =>
      api.put<Person>(`/people/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReassignManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, managerId }: { id: string; managerId: string | null }) =>
      api.patch<Person>(`/people/${id}/manager`, { managerId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/people/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
