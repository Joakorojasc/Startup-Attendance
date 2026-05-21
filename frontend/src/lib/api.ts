import type { Worker, Schedule, AttendanceRecord, MonthlyWorkerStats } from './types'
import { supabase } from './supabase'

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [toCamel(k), transformKeys(v)])
    )
  }
  return obj
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeader() })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return transformKeys(await res.json()) as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeader() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return transformKeys(await res.json()) as T
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...await authHeader() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return transformKeys(await res.json()) as T
}

async function del(path: string): Promise<void> {
  const res = await fetch(path, { method: 'DELETE', headers: await authHeader() })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
}

export interface WorkerCreatePayload {
  name: string
  role: string
  phone: string
  scheduleId: string
  avatarColor?: string
}

export interface WorkerUpdatePayload {
  name?: string
  role?: string
  phone?: string
  scheduleId?: string
}

export const api = {
  workers: {
    list: (status?: string) =>
      get<Worker[]>(`/api/v1/workers/${status ? `?status=${status}` : ''}`),
    create: (w: WorkerCreatePayload) =>
      post<Worker>('/api/v1/workers/', {
        name: w.name,
        role: w.role,
        phone: w.phone,
        schedule_id: w.scheduleId,
        avatar_color: w.avatarColor ?? '#6366f1',
      }),
    update: (id: string, w: WorkerUpdatePayload) =>
      patch<Worker>(`/api/v1/workers/${id}`, {
        name: w.name,
        role: w.role,
        phone: w.phone,
        schedule_id: w.scheduleId,
      }),
    deactivate: (id: string) => del(`/api/v1/workers/${id}`),
    reactivate: (id: string) => patch<Worker>(`/api/v1/workers/${id}`, { status: 'active' }),
  },
  schedules: {
    list: () => get<Schedule[]>('/api/v1/schedules/'),
  },
  attendance: {
    today: () => get<AttendanceRecord[]>('/api/v1/attendance/today'),
    day: (date: string) => get<AttendanceRecord[]>(`/api/v1/attendance/day/${date}`),
    monthlyStats: (year: number, month1: number) =>
      get<MonthlyWorkerStats[]>(`/api/v1/attendance/month/${year}/${month1}`),
    mark: (workerId: string, opts?: { type?: 'entry' | 'exit' | 'auto'; date?: string; time?: string }) =>
      post<AttendanceRecord>('/api/v1/attendance/mark', {
        worker_id: workerId,
        type: opts?.type ?? 'auto',
        date: opts?.date,
        time: opts?.time,
      }),
    simulateDay: (dateStr?: string) =>
      post<AttendanceRecord[]>(
        `/api/v1/attendance/simulate-day${dateStr ? `?date_str=${dateStr}` : ''}`,
        {}
      ),
  },
}
