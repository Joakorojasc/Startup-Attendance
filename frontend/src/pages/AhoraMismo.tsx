import { PageLoader } from '@/components/ui/PageLoader'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Clock, Users, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { useWorkers, useAttendanceToday } from '@/lib/hooks'
import { lateLabel } from '@/lib/utils'

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-success uppercase tracking-widest">En vivo</span>
      </div>
      <span className="text-xs text-text-muted">
        {dayNames[time.getDay()]}, {time.getDate()} {monthNames[time.getMonth()]} · {time.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  )
}

export function AhoraMismo() {
  const navigate = useNavigate()
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers()
  const { data: records = [], isLoading: loadingRecords } = useAttendanceToday()

  if (loadingWorkers || loadingRecords) {
    return <PageLoader />
  }

  const activeWorkers = workers.filter((w) => w.status === 'active')
  const inside = records.filter((r) => r.entryTime && !r.exitTime)
  const lateToday = records.filter((r) => r.lateMinutes > 0 && r.entryTime)
  const notRegistered = activeWorkers.filter((w) => !records.find((r) => r.workerId === w.id && r.entryTime))
  const present = records.filter((r) => r.entryTime)
  const punctualPct = present.length > 0
    ? Math.round((present.filter((r) => r.lateMinutes === 0).length / present.length) * 100)
    : 0

  const alerts = [
    ...lateToday.map((r) => {
      const worker = workers.find((w) => w.id === r.workerId)
      return { id: r.id, message: `${worker?.name ?? '?'} llegó ${r.lateMinutes} min tarde (${r.entryTime})`, time: r.entryTime!, type: 'late' as const }
    }),
    ...notRegistered.map((w) => ({
      id: w.id, message: `${w.name} no ha marcado hoy`, time: '—', type: 'absent' as const,
    })),
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Ahora mismo</h1>
          <div className="mt-1.5">
            <LiveClock />
          </div>
        </div>
        <button
          onClick={() => navigate('/trabajadores')}
          className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100"
        >
          <UserPlus size={14} />
          Agregar trabajador
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Dentro del local" value={`${inside.length} de ${activeWorkers.length}`} icon={Users} iconColor="text-accent" />
        <StatCard label="Con atraso hoy" value={lateToday.length} icon={Clock} iconColor={lateToday.length > 0 ? 'text-danger' : 'text-text-muted'} valueColor={lateToday.length > 0 ? 'text-danger' : undefined} />
        <StatCard label="Sin registrar" value={notRegistered.length} icon={XCircle} iconColor={notRegistered.length > 0 ? 'text-warning' : 'text-text-muted'} valueColor={notRegistered.length > 0 ? 'text-warning' : undefined} />
        <StatCard label="Puntualidad hoy" value={`${punctualPct}%`} icon={CheckCircle2} iconColor={punctualPct >= 80 ? 'text-success' : 'text-warning'} valueColor={punctualPct >= 80 ? 'text-success' : 'text-warning'} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Dentro del local</h2>
              <span className="text-xs text-text-muted">{inside.length} personas</span>
            </div>
            <div className="divide-y divide-border">
              {inside.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-text-muted">Nadie dentro del local</div>
              )}
              {inside.map((record) => {
                const worker = workers.find((w) => w.id === record.workerId)
                if (!worker) return null
                return (
                  <div key={record.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors duration-100">
                    <Avatar name={worker.name} color={worker.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{worker.name}</div>
                      <div className="text-xs text-text-muted">{worker.role}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium text-text-secondary">{record.entryTime}</div>
                      <div className="mt-0.5">
                        {record.lateMinutes > 0 ? (
                          <Badge variant="danger">{lateLabel(record.lateMinutes)}</Badge>
                        ) : (
                          <Badge variant="success">Adentro</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Sin registrar</h2>
              <span className="text-xs text-text-muted">{notRegistered.length} personas</span>
            </div>
            <div className="divide-y divide-border">
              {notRegistered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-text-muted">Todos han marcado hoy</div>
              )}
              {notRegistered.map((worker) => (
                <div key={worker.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors duration-100">
                  <Avatar name={worker.name} color={worker.avatarColor} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{worker.name}</div>
                    <div className="text-xs text-text-muted">{worker.role}</div>
                  </div>
                  <Badge variant="neutral">Ausente</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <AlertTriangle size={13} className="text-warning" />
            <h2 className="text-sm font-semibold text-text-primary">Alertas recientes</h2>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-4 py-3 hover:bg-bg-hover transition-colors duration-100">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${alert.type === 'absent' ? 'bg-warning' : 'bg-danger'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] text-text-muted mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-text-muted">Sin alertas</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
