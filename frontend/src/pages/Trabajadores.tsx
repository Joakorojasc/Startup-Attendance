import { useState, type ChangeEvent } from 'react'
import { Search, UserPlus, Pencil, RotateCcw, Fingerprint, FingerprintIcon, X, Wand2, UserMinus } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useWorkers, useSchedules, useMonthlyStats, useCreateWorker, useUpdateWorker, useDeactivateWorker, useReactivateWorker } from '@/lib/hooks'
import { punctualityTextColor, cn } from '@/lib/utils'
import type { Worker, MonthlyWorkerStats } from '@/lib/types'

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#ef4444','#22c55e','#06b6d4']

const SAMPLE_WORKERS = [
  { name: 'Sandra Riquelme', rut: '12.345.678-5', role: 'Vendedora',   phone: '+56 9 8123 4567' },
  { name: 'Carlos Aravena',  rut: '15.678.234-3', role: 'Bodeguero',   phone: '+56 9 5456 7890' },
  { name: 'Valeria Fuentes', rut: '9.876.543-3',  role: 'Cajera',      phone: '+56 9 6345 6789' },
  { name: 'Pedro Soto',      rut: '11.111.111-1', role: 'Vendedor',    phone: '+56 9 2789 0123' },
]

function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 8 || clean.length > 9) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rem = sum % 11
  const expected = rem === 0 ? '0' : rem === 1 ? 'K' : String(11 - rem)
  return dv === expected
}

function validatePhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{8,15}$/.test(phone)
}

interface AddWorkerModalProps {
  onClose: () => void
  schedules: { id: string; name: string; startTime: string; endTime: string }[]
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-[11px] text-danger mt-1">{msg}</p>
}

function AddWorkerModal({ onClose, schedules }: AddWorkerModalProps) {
  const createWorker = useCreateWorker()
  const [form, setForm] = useState({ name: '', rut: '', role: '', phone: '', scheduleId: schedules[0]?.id ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleRut(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9kK]/g, '')
    setForm((f) => ({ ...f, rut: formatRut(raw) }))
    setErrors((e) => ({ ...e, rut: '' }))
  }

  function autoFill() {
    const sample = SAMPLE_WORKERS[Math.floor(Math.random() * SAMPLE_WORKERS.length)]
    setForm((f) => ({ ...f, ...sample, scheduleId: schedules[Math.floor(Math.random() * schedules.length)]?.id ?? f.scheduleId }))
    setErrors({})
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Nombre requerido (mín. 3 caracteres)'
    if (form.rut && !validateRut(form.rut)) e.rut = 'RUT inválido — verifica el dígito verificador'
    if (!form.role.trim()) e.role = 'Cargo requerido'
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Teléfono inválido'
    if (!form.scheduleId) e.scheduleId = 'Selecciona un horario'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validate()) return
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    await createWorker.mutateAsync({ name: form.name.trim(), role: form.role.trim(), phone: form.phone.trim(), scheduleId: form.scheduleId, avatarColor: color })
    onClose()
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2 bg-bg-elevated border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors ${errors[field] ? 'border-danger' : 'border-border focus:border-accent'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-surface border border-border rounded-xl shadow-elevated w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Agregar trabajador</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={autoFill}
              title="Llenar con datos de prueba"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/10 rounded transition-colors border border-border hover:border-accent/30"
            >
              <Wand2 size={12} />
              Datos de prueba
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-text-muted block mb-1.5">Nombre completo <span className="text-danger">*</span></label>
            <input type="text" placeholder="Ej: María González" value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: '' })) }}
              className={inputCls('name')} />
            <FieldError msg={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">RUT</label>
              <input type="text" placeholder="12.345.678-9" value={form.rut} onChange={handleRut} maxLength={12}
                className={inputCls('rut') + ' font-mono'} />
              <FieldError msg={errors.rut} />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Teléfono</label>
              <input type="text" placeholder="+56 9 1234 5678" value={form.phone}
                onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: '' })) }}
                className={inputCls('phone')} />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Cargo <span className="text-danger">*</span></label>
            <input type="text" placeholder="Ej: Vendedor, Cajero..." value={form.role}
              onChange={(e) => { setForm((f) => ({ ...f, role: e.target.value })); setErrors((er) => ({ ...er, role: '' })) }}
              className={inputCls('role')} />
            <FieldError msg={errors.role} />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Horario <span className="text-danger">*</span></label>
            <select value={form.scheduleId} onChange={(e) => { setForm((f) => ({ ...f, scheduleId: e.target.value })); setErrors((er) => ({ ...er, scheduleId: '' })) }}
              className={inputCls('scheduleId')}>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.startTime}–{s.endTime}</option>
              ))}
            </select>
            <FieldError msg={errors.scheduleId} />
          </div>

          {createWorker.isError && (
            <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded px-3 py-2">Error al guardar. Intenta nuevamente.</p>
          )}

          <p className="text-[11px] text-text-muted pt-1">La huella se registra desde el lector biométrico. El color del avatar se asigna automáticamente.</p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors duration-100">
              Cancelar
            </button>
            <button type="submit" disabled={createWorker.isPending}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100 disabled:opacity-60">
              {createWorker.isPending ? 'Guardando...' : 'Guardar trabajador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditWorkerModalProps {
  worker: Worker
  onClose: () => void
  schedules: { id: string; name: string; startTime: string; endTime: string }[]
}

function EditWorkerModal({ worker, onClose, schedules }: EditWorkerModalProps) {
  const updateWorker = useUpdateWorker()
  const deactivateWorker = useDeactivateWorker()
  const [form, setForm] = useState({
    name: worker.name,
    rut: '',
    role: worker.role,
    phone: worker.phone,
    scheduleId: worker.scheduleId,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Nombre requerido (mín. 3 caracteres)'
    if (!form.role.trim()) e.role = 'Cargo requerido'
    if (form.phone && !validatePhone(form.phone)) e.phone = 'Teléfono inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validate()) return
    await updateWorker.mutateAsync({
      id: worker.id,
      data: { name: form.name.trim(), role: form.role.trim(), phone: form.phone.trim(), scheduleId: form.scheduleId },
    })
    onClose()
  }

  async function handleDeactivate() {
    await deactivateWorker.mutateAsync(worker.id)
    onClose()
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2 bg-bg-elevated border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors ${errors[field] ? 'border-danger' : 'border-border focus:border-accent'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-surface border border-border rounded-xl shadow-elevated w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Editar trabajador</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Nombre completo <span className="text-danger">*</span></label>
            <input type="text" value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: '' })) }}
              className={inputCls('name')} />
            <FieldError msg={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Cargo <span className="text-danger">*</span></label>
              <input type="text" value={form.role}
                onChange={(e) => { setForm((f) => ({ ...f, role: e.target.value })); setErrors((er) => ({ ...er, role: '' })) }}
                className={inputCls('role')} />
              <FieldError msg={errors.role} />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Teléfono</label>
              <input type="text" value={form.phone}
                onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: '' })) }}
                className={inputCls('phone')} />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Horario <span className="text-danger">*</span></label>
            <select value={form.scheduleId} onChange={(e) => setForm((f) => ({ ...f, scheduleId: e.target.value }))}
              className={inputCls('scheduleId')}>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.startTime}–{s.endTime}</option>
              ))}
            </select>
          </div>

          {updateWorker.isError && (
            <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded px-3 py-2">Error al guardar. Intenta nuevamente.</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {!confirming ? (
              <button type="button" onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/5 border border-danger/20 rounded transition-colors">
                <UserMinus size={12} /> Desactivar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">¿Confirmar?</span>
                <button type="button" onClick={handleDeactivate} disabled={deactivateWorker.isPending}
                  className="px-2.5 py-1.5 text-xs font-medium text-white bg-danger hover:bg-danger-muted rounded transition-colors disabled:opacity-60">
                  Sí, desactivar
                </button>
                <button type="button" onClick={() => setConfirming(false)}
                  className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-hover rounded transition-colors">
                  Cancelar
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={updateWorker.isPending}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-60">
                {updateWorker.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function WorkerRow({
  worker, stats, schedules, onEdit, onReactivate,
}: {
  worker: Worker
  stats: MonthlyWorkerStats[]
  schedules: { id: string; startTime: string; endTime: string }[]
  onEdit: (w: Worker) => void
  onReactivate: (id: string) => void
}) {
  const pct = stats.find((s) => s.workerId === worker.id)?.punctualityPct ?? null
  const schedule = schedules.find((s) => s.id === worker.scheduleId)
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
          <div className="flex items-center gap-1.5 text-success text-xs"><Fingerprint size={13} /><span>Registrada</span></div>
        ) : (
          <div className="flex items-center gap-1.5 text-text-muted text-xs"><FingerprintIcon size={13} /><span>Sin huella</span></div>
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
          <button
            onClick={() => onEdit(worker)}
            className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors duration-100"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          {worker.status === 'inactive' && (
            <button
              onClick={() => onReactivate(worker.id)}
              className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-success transition-colors duration-100"
              title="Reactivar"
            >
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
  const [editTarget, setEditTarget] = useState<Worker | null>(null)

  const now = new Date()
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers()
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules()
  const { data: stats = [] } = useMonthlyStats(now.getFullYear(), now.getMonth())
  const reactivateWorker = useReactivateWorker()

  if (loadingWorkers || loadingSchedules) {
    return <div className="p-6 text-sm text-text-muted">Cargando...</div>
  }

  const filtered = workers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase())
  )

  const active = filtered.filter((w) => w.status === 'active')
  const inactive = filtered.filter((w) => w.status === 'inactive')
  const activeCount = workers.filter((w) => w.status === 'active').length
  const inactiveCount = workers.filter((w) => w.status === 'inactive').length

  return (
    <>
      {showModal && <AddWorkerModal onClose={() => setShowModal(false)} schedules={schedules} />}
      {editTarget && (
        <EditWorkerModal
          worker={editTarget}
          onClose={() => setEditTarget(null)}
          schedules={schedules}
        />
      )}

      <div className="p-6 space-y-5 max-w-[1100px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Trabajadores</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {activeCount} activos · {inactiveCount} inactivos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Buscar trabajador..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors w-52" />
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100">
              <UserPlus size={13} />
              Agregar
            </button>
          </div>
        </div>

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
              {active.map((w) => (
                <WorkerRow key={w.id} worker={w} stats={stats} schedules={schedules}
                  onEdit={setEditTarget}
                  onReactivate={(id) => reactivateWorker.mutate(id)}
                />
              ))}
            </tbody>
          </table>
          {active.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">Sin resultados</div>
          )}
        </div>

        {inactive.length > 0 && (
          <div>
            <button onClick={() => setShowInactive((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-secondary mb-3 transition-colors">
              <span>{showInactive ? '▾' : '▸'}</span>
              Trabajadores inactivos ({inactive.length})
            </button>
            {showInactive && (
              <div className="bg-bg-surface border border-border rounded-lg overflow-hidden opacity-70">
                <table className="w-full text-sm">
                  <tbody>
                    {inactive.map((w) => (
                      <WorkerRow key={w.id} worker={w} stats={stats} schedules={schedules}
                        onEdit={setEditTarget}
                        onReactivate={(id) => reactivateWorker.mutate(id)}
                      />
                    ))}
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
