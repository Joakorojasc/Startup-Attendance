export type AppRole = 'owner' | 'admin' | 'viewer'

export interface AppUser {
  id: string
  email: string
  role: AppRole
  name: string | null
  createdAt: string
}

export type WorkerStatus = 'active' | 'inactive'
export type AttendanceStatus = 'punctual' | 'late' | 'absent' | 'day_off' | 'in_progress'
export type WorkDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Schedule {
  id: string
  name: string
  startTime: string
  endTime: string
  workDays: WorkDay[]
}

export interface Worker {
  id: string
  name: string
  role: string
  phone: string
  scheduleId: string
  fingerprintRegistered: boolean
  status: WorkerStatus
  avatarColor: string
}

export interface AttendanceRecord {
  id: string
  workerId: string
  date: string
  entryTime: string | null
  exitTime: string | null
  status: AttendanceStatus
  lateMinutes: number
}

export interface DailyStats {
  present: number
  late: number
  absent: number
  avgHours: number
  total: number
}

export interface MonthlyWorkerStats {
  workerId: string
  workerName: string
  daysPresent: number
  totalWorkingDays: number
  totalHours: number
  extraHours: number
  lateCount: number
  punctualityPct: number
}
