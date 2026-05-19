import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, AlertTriangle, Clock, Users, UserX, Timer } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { WORKERS, ATTENDANCE_RECORDS } from '@/lib/mockData'
import { formatDateSpanish, isoDate, cn } from '@/lib/utils'

const WORKING_DAYS_SORTED = [
  '2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08',
  '2026-05-11','2026-05-12','2026-05-13','2026-05-14','2026-05-15',
  '2026-05-18','2026-05-19','2026-05-20','2026-05-21','2026-05-22',
  '2026-05-25','2026-05-26','2026-05-27','2026-05-28','2026-05-29',
]
const WORKING_DAYS = new Set(WORKING_DAYS_SORTED)

function prevWorkDay(d: Date): Date | null {
  const idx = WORKING_DAYS_SORTED.indexOf(isoDate(d))
  if (idx <= 0) return null
  return new Date(WORKING_DAYS_SORTED[idx - 1] + 'T12:00:00')
}
function nextWorkDay(d: Date): Date | null {
  const idx = WORKING_DAYS_SORTED.indexOf(isoDate(d))
  if (idx === -1 || idx >= WORKING_DAYS_SORTED.length - 1) return null
  return new Date(WORKING_DAYS_SORTED[idx + 1] + 'T12:00:00')
}

function hoursWorked(entry: string | null, exit: string | null): string {
  if (!entry) return '—'
  if (!exit) return 'En curso'
  const [eh, em] = entry.split(':').map(Number)
  const [xh, xm] = exit.split(':').map(Number)
  const total = (xh * 60 + xm) - (eh * 60 + em)
  return `${Math.floor(total / 60)}h ${total % 60}m`
}

export function VistaDia() {
  const [current, setCurrent] = useState(new Date('2026-05-18'))
  const dateStr = isoDate(current)
  const isWorking = WORKING_DAYS.has(dateStr)

  const records = ATTENDANCE_RECORDS.filter((r) => r.date === dateStr)
  const activeWorkers = WORKERS.filter((w) => w.status === 'active')

  const present = records.filter((r) => r.entryTime)
  const late = records.filter((r) => r.lateMinutes > 0)
  const absent = activeWorkers.length - present.length

  // avg hours
  const totalMins = present
    .filter((r) => r.exitTime)
    .reduce((sum, r) => {
      const [eh, em] = r.entryTime!.split(':').map(Number)
      const [xh, xm] = r.exitTime!.split(':').map(Number)
      return sum + (xh * 60 + xm) - (eh * 60 + em)
    }, 0)
  const avgMins = present.filter((r) => r.exitTime).length > 0
    ? Math.round(totalMins / present.filter((r) => r.exitTime).length)
    : 0

  const rows = activeWorkers.map((w) => {
    const rec = records.find((r) => r.workerId === w.id)
    return { worker: w, record: rec }
  })

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Vista del Día</h1>
          <p className="text-sm text-text-muted mt-0.5">Registro de asistencia diaria</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-hover border border-border text-sm font-medium text-text-secondary rounded transition-colors duration-100">
          <Download size={13} />
          Exportar Excel
        </button>
      </div>

      {/* Date nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { const d = prevWorkDay(current); if (d) setCurrent(d) }}
          disabled={!prevWorkDay(current)}
          className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-text-primary min-w-[160px] text-center capitalize">
          {formatDateSpanish(current)} · {current.getFullYear()}
        </div>
        <button
          onClick={() => { const d = nextWorkDay(current); if (d) setCurrent(d) }}
          disabled={!nextWorkDay(current)}
          className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {!isWorking ? (
        <div className="bg-bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-text-muted text-sm">Día no hábil — sin registros</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Presentes" value={present.length} icon={Users} iconColor="text-success" valueColor="text-success" sub={`de ${activeWorkers.length} trabajadores`} />
            <StatCard label="Atrasos" value={late.length} icon={Clock} iconColor={late.length > 0 ? 'text-danger' : 'text-text-muted'} valueColor={late.length > 0 ? 'text-danger' : undefined} />
            <StatCard
              label="Horas promedio"
              value={avgMins > 0 ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m` : '—'}
              icon={Timer}
              iconColor="text-accent"
            />
            <StatCard label="Ausentes" value={absent} icon={UserX} iconColor={absent > 0 ? 'text-warning' : 'text-text-muted'} valueColor={absent > 0 ? 'text-warning' : undefined} />
          </div>

          {/* Table */}
          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Trabajador</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Entrada</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Salida</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Horas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ worker, record }) => {
                  const isLate = (record?.lateMinutes ?? 0) > 0
                  const isAbsent = !record?.entryTime
                  return (
                    <tr key={worker.id} className="hover:bg-bg-hover transition-colors duration-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={worker.name} color={worker.avatarColor} size="sm" />
                          <span className="font-medium text-text-primary">{worker.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{worker.role}</td>
                      <td className="px-4 py-3">
                        {isAbsent ? (
                          <span className="text-text-muted">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isLate && <AlertTriangle size={12} className="text-danger shrink-0" />}
                            <span className={cn('font-medium', isLate ? 'text-danger' : 'text-text-primary')}>
                              {record?.entryTime}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {record?.exitTime ?? (record?.entryTime ? <span className="text-text-muted italic text-xs">en curso</span> : '—')}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {record ? hoursWorked(record.entryTime, record.exitTime) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isAbsent ? (
                          <Badge variant="neutral">Ausente</Badge>
                        ) : isLate ? (
                          <Badge variant="danger">Atraso +{record!.lateMinutes}min</Badge>
                        ) : (
                          <Badge variant="success">Puntual</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
