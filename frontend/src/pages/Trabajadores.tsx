import { useState, type ChangeEvent } from 'react'
import { Search, UserPlus, Pencil, RotateCcw, Fingerprint, FingerprintIcon, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { WORKERS, SCHEDULES, getMonthlyStats } from '@/lib/mockData'
import { punctualityTextColor, cn } from '@/lib/utils'

const stats = getMonthlyStats(2026, 4)

function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

interface AddWorkerModalProps {
  onClose: () => void
}

function AddWorkerModal({ onClose }: AddWorkerModalProps) {
  const [form, setForm] = useState({
    name: '',
    rut: '',
    role: '',
    phone: '',
    scheduleId: SCHEDULES[0]?.id ?? '',
  })

  function handleRut(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9kK]/g, '')
    setForm((f) => ({ ...f, rut: formatRut(raw) }))
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Agregar trabajador</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-text-muted block mb-1.5">Nombre completo</label>
              <input
                type="text"
                placeholder="Ej: María González"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">RUT</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={form.rut}
                onChange={handleRut}
                maxLength={12}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Teléfono</label>
              <input
                type="text"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-text-muted block mb-1.5">Cargo</label>
              <input
                type="text"
                placeholder="Ej: Vendedor, Cajero..."
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-text-muted block mb-1.5">Horario</label>
              <select
                value={form.scheduleId}
                onChange={(e) => setForm((f) => ({ ...f, scheduleId: e.target.value }))}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
              >
                {SCHEDULES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.startTime}–{s.endTime}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-text-muted">Todos los campos son opcionales. La huella se registra desde el lector biométrico.</p>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors duration-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100"
            >
              Guardar trabajador
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function WorkerRow({ worker }: { worker: typeof WORKERS[0] }) {
  const pct = stats.find((s) => s.workerId === worker.id)?.punctualityPct ?? null
  const schedule = SCHEDULES.find((s) => s.id === worker.scheduleId)
  return (
    <tr className="border-b border-border hover:bg-bg-hover transition-colors duration-100 group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={worker.name} color={worker.avatarColor} />
          <div>
            <div className="text-sm font-medium text-text-primary">{worker.name}</div>
            <div className="text-xs text-text-muted">{worker.phone}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{worker.role}</td>
      <td className="px-4 py-3 text-sm text-text-secondary font-mono tabular-nums">
        {schedule ? `${schedule.startTime}–${schedule.endTime}` : '—'}
      </td>
      <td className="px-4 py-3">
        {worker.fingerprintRegistered ? (
          <div className="flex items-center gap-1.5 text-success text-xs">
            <Fingerprint size={13} />
            <span>Registrada</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <FingerprintIcon size={13} />
            <span>Sin huella</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {pct !== null ? (
          <span className={cn('text-sm font-medium tabular-nums', punctualityTextColor(pct))}>{pct}%</span>
        ) : (
          <span className="text-text-muted text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={worker.status === 'active' ? 'success' : 'neutral'}>
          {worker.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          <button className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors duration-100" title="Editar">
            <Pencil size={13} />
          </button>
          {worker.status === 'inactive' && (
            <button className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-success transition-colors duration-100" title="Reactivar">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export function Trabajadores() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const filtered = WORKERS.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter((w) => w.status === 'active')
  const inactive = filtered.filter((w) => w.status === 'inactive')

  return (
    <>
      {showModal && <AddWorkerModal onClose={() => setShowModal(false)} />}

      <div className="p-6 space-y-5 max-w-[1100px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Trabajadores</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {WORKERS.filter((w) => w.status === 'active').length} activos · {WORKERS.filter((w) => w.status === 'inactive').length} inactivos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar trabajador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors w-52"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100"
            >
              <UserPlus size={13} />
              Agregar
            </button>
          </div>
        </div>

        {/* Active workers table */}
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Nombre', 'Cargo', 'Horario', 'Huella', 'Puntualidad mes', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map((w) => <WorkerRow key={w.id} worker={w} />)}
            </tbody>
          </table>
          {active.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">Sin resultados</div>
          )}
        </div>

        {/* Inactive */}
        {inactive.length > 0 && (
          <div>
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary mb-3 transition-colors"
            >
              <span>{showInactive ? '▾' : '▸'}</span>
              Trabajadores inactivos ({inactive.length})
            </button>
            {showInactive && (
              <div className="bg-bg-surface border border-border rounded-lg overflow-hidden opacity-70">
                <table className="w-full text-sm">
                  <tbody>
                    {inactive.map((w) => <WorkerRow key={w.id} worker={w} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
