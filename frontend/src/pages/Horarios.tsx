import { useState } from 'react'
import { Plus, Pencil, Clock, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useSchedules, useWorkers } from '@/lib/hooks'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export function Horarios() {
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules()
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loadingSchedules || loadingWorkers) {
    return <div className="p-6 text-sm text-text-muted">Cargando...</div>
  }

  const selected = schedules.find((s) => s.id === (selectedId ?? schedules[0]?.id))
  if (!selected && schedules.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-[1100px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Horarios</h1>
            <p className="text-sm text-text-muted mt-0.5">Configuración de turnos y horarios</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100">
            <Plus size={13} />
            Nuevo horario
          </button>
        </div>
        <div className="bg-bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-text-muted text-sm">No hay horarios configurados</p>
        </div>
      </div>
    )
  }

  const currentSchedule = selected ?? schedules[0]
  const assignedWorkers = workers.filter((w) => w.scheduleId === currentSchedule.id && w.status === 'active')
  const [sh, sm] = currentSchedule.startTime.split(':').map(Number)
  const [eh, em] = currentSchedule.endTime.split(':').map(Number)
  const dailyHours = (eh * 60 + em - sh * 60 - sm) / 60

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Horarios</h1>
          <p className="text-sm text-text-muted mt-0.5">Configuración de turnos y horarios</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100">
          <Plus size={13} />
          Nuevo horario
        </button>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-4">
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Turnos</span>
          </div>
          <div className="p-2 space-y-0.5">
            {schedules.map((s) => {
              const count = workers.filter((w) => w.scheduleId === s.id && w.status === 'active').length
              const isActive = currentSchedule.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors duration-100 ${
                    isActive ? 'bg-accent/10 text-accent' : 'hover:bg-bg-hover text-text-secondary'
                  }`}
                >
                  <Clock size={13} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs opacity-70 font-mono">{s.startTime} – {s.endTime}</div>
                  </div>
                  <span className="text-xs opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-surface border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-text-primary">{currentSchedule.name}</h2>
                <p className="text-sm text-text-muted mt-0.5">Turno de {dailyHours}h diarias</p>
              </div>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-elevated hover:bg-bg-hover border border-border text-xs font-medium text-text-secondary rounded transition-colors duration-100">
                <Pencil size={11} />
                Editar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-bg-elevated rounded p-3">
                <div className="text-xs text-text-muted mb-1">Entrada</div>
                <div className="text-lg font-semibold text-text-primary font-mono">{currentSchedule.startTime}</div>
              </div>
              <div className="bg-bg-elevated rounded p-3">
                <div className="text-xs text-text-muted mb-1">Salida</div>
                <div className="text-lg font-semibold text-text-primary font-mono">{currentSchedule.endTime}</div>
              </div>
              <div className="bg-bg-elevated rounded p-3">
                <div className="text-xs text-text-muted mb-1">Horas/día</div>
                <div className="text-lg font-semibold text-text-primary">{dailyHours}h</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Días laborales</div>
              <div className="flex gap-1.5">
                {ALL_DAYS.map((d) => {
                  const active = currentSchedule.workDays.includes(d as 0)
                  return (
                    <div
                      key={d}
                      className={`w-9 h-9 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                        active ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-bg-elevated text-text-muted border border-border'
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Users size={13} className="text-text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Trabajadores asignados</h3>
              <span className="text-xs text-text-muted ml-auto">{assignedWorkers.length}</span>
            </div>
            <div className="divide-y divide-border">
              {assignedWorkers.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-text-muted">Ningún trabajador en este horario</div>
              )}
              {assignedWorkers.map((w) => (
                <div key={w.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors duration-100">
                  <Avatar name={w.name} color={w.avatarColor} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">{w.name}</div>
                    <div className="text-xs text-text-muted">{w.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
