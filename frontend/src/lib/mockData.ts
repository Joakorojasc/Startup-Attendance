import type { Worker, Schedule, AttendanceRecord } from './types'

export const SCHEDULES: Schedule[] = [
  {
    id: 'sch-1',
    name: 'Estándar',
    startTime: '09:00',
    endTime: '18:00',
    workDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'sch-2',
    name: 'Turno Tarde',
    startTime: '13:00',
    endTime: '22:00',
    workDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'sch-3',
    name: 'Medio Tiempo',
    startTime: '09:00',
    endTime: '13:00',
    workDays: [1, 2, 3, 4, 5],
  },
]

export const WORKERS: Worker[] = [
  { id: 'w1', name: 'Sandra Riquelme', role: 'Vendedora', phone: '+56 9 8123 4567', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#6366f1' },
  { id: 'w2', name: 'Lucía Pérez', role: 'Vendedora', phone: '+56 9 7234 5678', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#8b5cf6' },
  { id: 'w3', name: 'Valeria Fuentes', role: 'Cajera', phone: '+56 9 6345 6789', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#ec4899' },
  { id: 'w4', name: 'Carlos Aravena', role: 'Bodeguero', phone: '+56 9 5456 7890', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#14b8a6' },
  { id: 'w5', name: 'Bárbara Castro', role: 'Supervisora', phone: '+56 9 4567 8901', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#f59e0b' },
  { id: 'w6', name: 'Jorge Muñoz', role: 'Vendedor', phone: '+56 9 3678 9012', scheduleId: 'sch-1', fingerprintRegistered: false, status: 'active', avatarColor: '#ef4444' },
  { id: 'w7', name: 'Pedro Soto', role: 'Vendedor', phone: '+56 9 2789 0123', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'active', avatarColor: '#22c55e' },
  { id: 'w8', name: 'Ana Martínez', role: 'Cajera', phone: '+56 9 1890 1234', scheduleId: 'sch-2', fingerprintRegistered: true, status: 'active', avatarColor: '#06b6d4' },
  { id: 'w9', name: 'Roberto Díaz', role: 'Bodeguero', phone: '+56 9 9901 2345', scheduleId: 'sch-1', fingerprintRegistered: true, status: 'inactive', avatarColor: '#64748b' },
  { id: 'w10', name: 'Carmen López', role: 'Vendedora', phone: '+56 9 8012 3456', scheduleId: 'sch-3', fingerprintRegistered: false, status: 'inactive', avatarColor: '#a78bfa' },
]

// May 2026: working days Mon-Fri. Month has 31 days.
// Working days: 1,4,5,6,7,8, 11,12,13,14,15, 18,19,20,21,22, 25,26,27,28,29 = 20 days
// But let's say 17 working days up to and including May 22 (based on screenshot showing "17 días hábiles en mayo")
// Actually May 2026:
//   Week 1: 4(Mon),5,6,7,8
//   Week 2: 11,12,13,14,15
//   Week 3: 18,19,20,21,22
//   Week 4: 25,26,27,28,29
// Total = 20 working days. Let's use 20. The screenshot shows 17 which might be up to May 22.

type DayEntry = { entry: string | null; exit: string | null; late: number }

// Helper to generate records for each worker for each working day in May 2026
// active workers: w1-w8 (w9, w10 are inactive)

const MAY_WORKING_DAYS = [
  '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08',
  '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15',
  '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22',
  '2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29',
]

// Per-worker schedules for may (pattern: entry, exit, late minutes)
// absent days => null, null. late => late > 0.

const workerPatterns: Record<string, DayEntry[]> = {
  // Sandra: 20/20 days, 0 late - perfect attendance
  w1: MAY_WORKING_DAYS.map(() => ({ entry: '08:58', exit: '18:02', late: 0 })),

  // Lucía: 19/20, 2 late
  w2: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-27') return { entry: null, exit: null, late: 0 }
    if (d === '2026-05-08' || d === '2026-05-15') return { entry: '09:18', exit: '18:05', late: 18 }
    return { entry: '09:01', exit: '18:03', late: 0 }
  }),

  // Valeria: 20/20, 2 late
  w3: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-13' || d === '2026-05-20') return { entry: '09:15', exit: '18:00', late: 15 }
    return { entry: '09:00', exit: '18:01', late: 0 }
  }),

  // Carlos: 18/20, 3 late
  w4: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-07' || d === '2026-05-21') return { entry: null, exit: null, late: 0 }
    if (d === '2026-05-05' || d === '2026-05-12' || d === '2026-05-26') return { entry: '09:22', exit: '18:10', late: 22 }
    return { entry: '09:03', exit: '18:05', late: 0 }
  }),

  // Bárbara: 19/20, 3 late
  w5: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-14') return { entry: null, exit: null, late: 0 }
    if (d === '2026-05-06' || d === '2026-05-19' || d === '2026-05-28') return { entry: '09:20', exit: '18:00', late: 20 }
    return { entry: '09:00', exit: '18:02', late: 0 }
  }),

  // Jorge: 16/20, 7 late
  w6: MAY_WORKING_DAYS.map((d) => {
    if (['2026-05-07', '2026-05-14', '2026-05-21', '2026-05-28'].includes(d)) return { entry: null, exit: null, late: 0 }
    if (['2026-05-05', '2026-05-08', '2026-05-12', '2026-05-15', '2026-05-20', '2026-05-22', '2026-05-27'].includes(d))
      return { entry: '09:35', exit: '18:10', late: 35 }
    return { entry: '09:05', exit: '18:00', late: 0 }
  }),

  // Pedro: 18/20, 4 late
  w7: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-11' || d === '2026-05-25') return { entry: null, exit: null, late: 0 }
    if (['2026-05-06', '2026-05-13', '2026-05-26', '2026-05-29'].includes(d)) return { entry: '09:25', exit: '18:05', late: 25 }
    return { entry: '08:55', exit: '18:00', late: 0 }
  }),

  // Ana (turno tarde 13-22): 20/20, 1 late
  w8: MAY_WORKING_DAYS.map((d) => {
    if (d === '2026-05-18') return { entry: '13:22', exit: '22:05', late: 22 }
    return { entry: '13:00', exit: '22:02', late: 0 }
  }),
}

let recordId = 1

export const ATTENDANCE_RECORDS: AttendanceRecord[] = MAY_WORKING_DAYS.flatMap((date) =>
  ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'].map((wId) => {
    const pattern = workerPatterns[wId]
    const idx = MAY_WORKING_DAYS.indexOf(date)
    const { entry, exit, late } = pattern[idx]

    // For today (May 18), some workers haven't exited yet
    const isToday = date === '2026-05-18'

    let status: AttendanceRecord['status']
    if (!entry) {
      status = 'absent'
    } else if (late > 0) {
      status = isToday && !exit ? 'in_progress' : 'late'
    } else {
      status = isToday && !exit ? 'in_progress' : 'punctual'
    }

    return {
      id: `rec-${recordId++}`,
      workerId: wId,
      date,
      entryTime: entry,
      exitTime: isToday ? null : exit,
      status,
      lateMinutes: late,
    }
  })
)

// Today's "live" state (May 18, 2026)
export const TODAY = '2026-05-18'

export function getTodayRecords() {
  return ATTENDANCE_RECORDS.filter((r) => r.date === TODAY)
}

export function getWorkerById(id: string): Worker | undefined {
  return WORKERS.find((w) => w.id === id)
}

export function getScheduleById(id: string): Schedule | undefined {
  return SCHEDULES.find((s) => s.id === id)
}

export function getRecordsByDate(date: string) {
  return ATTENDANCE_RECORDS.filter((r) => r.date === date)
}

export function getMonthlyStats(year: number, month: number) {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const records = ATTENDANCE_RECORDS.filter((r) => r.date.startsWith(monthStr))

  const activeWorkers = WORKERS.filter((w) => w.status === 'active')

  return activeWorkers.map((worker) => {
    const wRecords = records.filter((r) => r.workerId === worker.id)
    const schedule = SCHEDULES.find((s) => s.id === worker.scheduleId)!
    const [sh, sm] = schedule.startTime.split(':').map(Number)
    const [eh, em] = schedule.endTime.split(':').map(Number)
    const dailyMinutes = (eh * 60 + em) - (sh * 60 + sm)

    const daysPresent = wRecords.filter((r) => r.entryTime !== null).length
    const totalWorkingDays = wRecords.length
    const totalMinutes = daysPresent * dailyMinutes
    const lateCount = wRecords.filter((r) => r.lateMinutes > 0).length
    const punctualDays = wRecords.filter((r) => r.entryTime && r.lateMinutes === 0).length
    const punctualityPct = totalWorkingDays > 0
      ? Math.round((punctualDays / totalWorkingDays) * 100)
      : 0

    return {
      workerId: worker.id,
      daysPresent,
      totalWorkingDays,
      totalHours: Math.round(totalMinutes / 60),
      extraHours: 0,
      lateCount,
      punctualityPct,
    }
  })
}

export const RECENT_ALERTS = [
  { id: 'a1', message: 'Jorge Muñoz no ha marcado desde apertura', time: '09:42', type: 'absent' as const },
  { id: 'a2', message: 'Valeria Fuentes llegó 15 min tarde (09:15 vs 09:00)', time: '09:15', type: 'late' as const },
  { id: 'a3', message: 'Ana Martínez llegó 22 min tarde (13:22 vs 13:00)', time: '13:22', type: 'late' as const },
]
