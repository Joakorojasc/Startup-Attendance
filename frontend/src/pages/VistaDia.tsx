import { PageLoader } from '@/components/ui/PageLoader'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, AlertTriangle, Clock, Users, UserX, Timer, LogIn, LogOut, Zap, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { useWorkers, useAttendanceDay, useMark, useSimulateDay } from '@/lib/hooks'
import { formatDateSpanish, isoDate, cn } from '@/lib/utils'
import type { Worker, AttendanceRecord } from '@/lib/types'

function prevWeekday(d: Date): Date {
  const p = new Date(d)
  do { p.setDate(p.getDate() - 1) } while (p.getDay() === 0 || p.getDay() === 6)
  return p
}

function nextWeekday(d: Date): Date | null {
  const n = new Date(d)
  do { n.setDate(n.getDate() + 1) } while (n.getDay() === 0 || n.getDay() === 6)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return n > today ? null : n
}

function hoursWorked(entry: string | null, exit: string | null): string {
  if (!entry) return '—'
  if (!exit) return 'En curso'
  const [eh, em] = entry.split(':').map(Number)
  const [xh, xm] = exit.split(':').map(Number)
  const total = (xh * 60 + xm) - (eh * 60 + em)
  return `${Math.floor(total / 60)}h ${total % 60}m`
}

function isWeekday(d: Date) {
  return d.getDay() !== 0 && d.getDay() !== 6
}

function nowHHMM(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

interface MarkModalProps {
  worker: Worker
  type: 'entry' | 'exit'
  dateStr: string
  onClose: () => void
}

function MarkModal({ worker, type, dateStr, onClose }: MarkModalProps) {
  const [time, setTime] = useState(nowHHMM)
  const mark = useMark()

  async function handleSubmit() {
    await mark.mutateAsync({ workerId: worker.id, type, date: dateStr, time })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-surface border border-border rounded-xl shadow-elevated w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="text-sm font-semibold text-text-primary">
              Registrar {type === 'entry' ? 'entrada' : 'salida'}
            </div>
            <div className="text-xs text-text-muted mt-0.5">{worker.name}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Hora</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary font-mono focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {mark.isError && (
            <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded px-3 py-2">
              Error al registrar. Intenta nuevamente.
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={mark.isPending}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-60">
              {mark.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RowActionsProps {
  worker: Worker
  record?: AttendanceRecord
  dateStr: string
  onMark: (worker: Worker, type: 'entry' | 'exit') => void
}

function RowActions({ worker, record, dateStr, onMark }: RowActionsProps) {
  const isToday = dateStr === isoDate(new Date())
  if (!isToday) return null

  if (!record?.entryTime) {
    return (
      <button
        onClick={() => onMark(worker, 'entry')}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 rounded transition-colors"
      >
        <LogIn size={11} /> Registrar entrada
      </button>
    )
  }
  if (!record.exitTime) {
    return (
      <button
        onClick={() => onMark(worker, 'exit')}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-text-secondary border border-border bg-bg-elevated hover:bg-bg-hover rounded transition-colors"
      >
        <LogOut size={11} /> Registrar salida
      </button>
    )
  }
  return null
}

export function VistaDia() {
  const [current, setCurrent] = useState(() => {
    const today = new Date()
    if (!isWeekday(today)) return prevWeekday(today)
    return today
  })
  const [markTarget, setMarkTarget] = useState<{ worker: Worker; type: 'entry' | 'exit' } | null>(null)

  const dateStr = isoDate(current)
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers()
  const { data: records = [], isLoading: loadingRecords } = useAttendanceDay(dateStr)
  const simulateDay = useSimulateDay()

  if (loadingWorkers || loadingRecords) {
    return <PageLoader />
  }

  const activeWorkers = workers.filter((w) => w.status === 'active')
  const present = records.filter((r) => r.entryTime)
  const late = records.filter((r) => r.lateMinutes > 0)
  const absent = activeWorkers.length - present.length

  const totalMins = present
    .filter((r) => r.exitTime)
    .reduce((sum, r) => {
      const [eh, em] = r.entryTime!.split(':').map(Number)
      const [xh, xm] = r.exitTime!.split(':').map(Number)
      return sum + (xh * 60 + xm) - (eh * 60 + em)
    }, 0)
  const finishedCount = present.filter((r) => r.exitTime).length
  const avgMins = finishedCount > 0 ? Math.round(totalMins / finishedCount) : 0

  const rows = activeWorkers.map((w) => ({ worker: w, record: records.find((r) => r.workerId === w.id) }))

  const prev = prevWeekday(current)
  const next = nextWeekday(current)
  const isToday = dateStr === isoDate(new Date())
  const canSimulate = isToday && absent > 0

  return (
    <>
      {markTarget && (
        <MarkModal
          worker={markTarget.worker}
          type={markTarget.type}
          dateStr={dateStr}
          onClose={() => setMarkTarget(null)}
        />
      )}

      <div className="p-6 space-y-6 max-w-[1100px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Vista del Día</h1>
            <p className="text-sm text-text-muted mt-0.5">Registro de asistencia diaria</p>
          </div>
          <div className="flex items-center gap-2">
            {canSimulate && (
              <button
                onClick={() => simulateDay.mutate(dateStr)}
                disabled={simulateDay.isPending}
                title="Simula entradas y salidas realistas para todos los ausentes (modo desarrollo)"
                className="flex items-center gap-2 px-3 py-2 bg-warning/10 hover:bg-warning/15 border border-warning/30 text-warning text-sm font-medium rounded transition-colors duration-100 disabled:opacity-60"
              >
                <Zap size={13} />
                {simulateDay.isPending ? 'Simulando...' : 'Simular día'}
              </button>
            )}
            <button className="flex items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-hover border border-border text-sm font-medium text-text-secondary rounded transition-colors duration-100">
              <Download size={13} />
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrent(prev)}
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm font-semibold text-text-primary min-w-[160px] text-center capitalize">
            {formatDateSpanish(current)} · {current.getFullYear()}
            <div className="text-[10px] font-normal text-text-muted mt-0.5">* No incluye feriados chilenos</div>
          </div>
          <button
            onClick={() => { if (next) setCurrent(next) }}
            disabled={!next}
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Presentes" value={present.length} icon={Users} iconColor="text-success" valueColor="text-success" sub={`de ${activeWorkers.length} trabajadores`} />
          <StatCard label="Atrasos" value={late.length} icon={Clock} iconColor={late.length > 0 ? 'text-danger' : 'text-text-muted'} valueColor={late.length > 0 ? 'text-danger' : undefined} />
          <StatCard label="Horas promedio" value={avgMins > 0 ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m` : '—'} icon={Timer} iconColor="text-accent" />
          <StatCard label="Ausentes" value={absent} icon={UserX} iconColor={absent > 0 ? 'text-warning' : 'text-text-muted'} valueColor={absent > 0 ? 'text-warning' : undefined} />
        </div>

        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Trabajador', 'Cargo', 'Entrada', 'Salida', 'Horas', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
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
                    <td className="px-4 py-3">
                      <RowActions
                        worker={worker}
                        record={record}
                        dateStr={dateStr}
                        onMark={(w, type) => setMarkTarget({ worker: w, type })}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">Sin registros para este día</div>
          )}
        </div>
      </div>
    </>
  )
}
