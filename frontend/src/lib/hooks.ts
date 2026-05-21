import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type WorkerCreatePayload, type WorkerUpdatePayload } from './api'

export function useWorkers(status?: string) {
  return useQuery({
    queryKey: ['workers', status ?? 'all'],
    queryFn: () => api.workers.list(status),
  })
}

export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: api.schedules.list,
  })
}

export function useAttendanceToday() {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: api.attendance.today,
    refetchInterval: 60_000,
  })
}

export function useAttendanceDay(date: string) {
  return useQuery({
    queryKey: ['attendance', 'day', date],
    queryFn: () => api.attendance.day(date),
  })
}

// month: 0-indexed (JS Date convention)
export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: ['attendance', 'monthly', year, month],
    queryFn: () => api.attendance.monthlyStats(year, month + 1),
  })
}

export function useCreateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkerCreatePayload) => api.workers.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

export function useUpdateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkerUpdatePayload }) => api.workers.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

export function useDeactivateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.workers.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

export function useReactivateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.workers.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

export function useMark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { workerId: string; type?: 'entry' | 'exit' | 'auto'; date?: string; time?: string }) =>
      api.attendance.mark(args.workerId, { type: args.type, date: args.date, time: args.time }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

export function useSimulateDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dateStr?: string) => api.attendance.simulateDay(dateStr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}
