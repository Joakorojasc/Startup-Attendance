import { useState } from 'react'
import { Plus, Pencil, Clock, Users, Trash2, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/PageLoader'
import { useSchedules, useWorkers, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from '@/lib/hooks'
import type { Schedule } from '@/lib/types'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DEFAULT_FORM = { name: '', startTime: '09:00', endTime: '18:00', workDays: [1, 2, 3, 4, 5] }

type FormState = typeof DEFAULT_FORM

function dailyHours(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60
}

function ScheduleModal({
  editing,
  onClose,
  assignedCount,
}: {
  editing: Schedule | null
  onClose: () => void
  assignedCount: number
}) {
  const createMut = useCreateSchedule()
  const updateMut = useUpdateSchedule()
  const deleteMut = useDeleteSchedule()

  const [form, setForm] = useState<FormState>(
    editing
      ? { name: editing.name, startTime: editing.startTime, endTime: editing.endTime, workDays: [...editing.workDays] }
      : DEFAULT_FORM
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending
  const hours = dailyHours(form.startTime, form.endTime)
  const valid = form.name.trim() && form.workDays.length > 0 && hours > 0

  function toggleDay(d: number) {
    setForm(f => ({
      ...f,
      workDays: f.workDays.includes(d)
        ? f.workDays.filter(x => x !== d)
        : [...f.workDays, d].sort(),
    }))
  }

  async function save() {
    if (!valid) return
    const data = { name: form.name.trim(), startTime: form.startTime, endTime: form.endTime, workDays: form.workDays }
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, data })
    } else {
      await createMut.mutateAsync(data)
    }
    onClose()
  }

  async function handleDelete() {
    if (!editing) return
    try {
      await deleteMut.mutateAsync(editing.id)
      onClose()
    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : String(e)
      setDeleteError(msg.includes('assigned') ? 'Reasigna los trabajadores antes de eliminar.' : 'Error al eliminar.')
      setConfirmDelete(false)
    }
  }

  const saveError = (createMut.error || updateMut.error) as Error | null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-surface border border-border rounded-2xl w-full max-w-[440px] shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">
            {editing ? 'Editar horario' : 'Nuevo horario'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-hover text-text-muted transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Nombre del turno *</label>
            <input
              type="text"
              placeholder="Ej: Turno mañana"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Hora entrada</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Hora salida</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>
          {hours > 0 && (
            <p className="text-xs text-text-muted -mt-2">{hours}h diarias</p>
          )}
          {hours <= 0 && form.startTime && form.endTime && (
            <p className="text-xs text-red-500 -mt-2">La hora de salida debe ser posterior a la entrada.</p>
          )}

          {/* Work days */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Días laborales *</label>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map(d => {
                const on = form.workDays.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-all ${
                      on
                        ? 'bg-accent/15 text-accent border-accent/40'
                        : 'bg-bg-elevated text-text-muted border-border hover:border-accent/30'
                    }`}
                  >
                    {DAY_LABELS[d]}
                  </button>
                )
              })}
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-red-500">{saveError.message}</p>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t border-border flex items-center ${editing ? 'justify-between' : 'justify-end'}`}>
          {/* Delete section */}
          {editing && (
            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-xs text-text-muted">¿Confirmar?</span>
                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="text-xs font-semibold text-danger hover:underline disabled:opacity-40"
                  >
                    {deleteMut.isPending ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-text-muted hover:underline">
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setDeleteError(null); setConfirmDelete(true) }}
                  disabled={assignedCount > 0}
                  title={assignedCount > 0 ? `${assignedCount} trabajador(es) asignado(s)` : undefined}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <Trash2 size={12} />
                  Eliminar
                  {assignedCount > 0 && <span className="text-[10px]">({assignedCount} asignado{assignedCount !== 1 ? 's' : ''})</span>}
                </button>
              )}
              {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={!valid || busy}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              {busy ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear horario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Horarios() {
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules()
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)

  if (loadingSchedules || loadingWorkers) return <PageLoader />

  const selected = schedules.find(s => s.id === (selectedId ?? schedules[0]?.id)) ?? schedules[0]
  const assignedToSelected = selected
    ? workers.filter(w => w.scheduleId === selected.id && w.status === 'active').length
    : 0

  return (
    <>
      <div className="p-6 space-y-6 max-w-[1100px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Horarios</h1>
            <p className="text-sm text-text-muted mt-0.5">Configuración de turnos y horarios</p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            <Plus size={13} />
            Nuevo horario
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-bg-surface border border-border rounded-xl p-16 text-center">
            <Clock size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-text-primary mb-1">No hay horarios configurados</p>
            <p className="text-xs text-text-muted mb-4">Crea un turno para poder asignarlo a los trabajadores.</p>
            <button
              onClick={() => setModal('create')}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              Crear primer horario
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[260px_1fr] gap-4">
            {/* Sidebar */}
            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden h-fit">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Turnos</span>
              </div>
              <div className="p-2 space-y-0.5">
                {schedules.map(s => {
                  const count = workers.filter(w => w.scheduleId === s.id && w.status === 'active').length
                  const isActive = selected?.id === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive ? 'bg-accent/10 text-accent' : 'hover:bg-bg-hover text-text-secondary'
                      }`}
                    >
                      <Clock size={13} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-xs opacity-70 font-mono">{s.startTime} – {s.endTime}</div>
                      </div>
                      <span className="text-xs opacity-60 shrink-0">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detail */}
            {selected && (
              <div className="space-y-4">
                <div className="bg-bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">{selected.name}</h2>
                      <p className="text-sm text-text-muted mt-0.5">
                        {dailyHours(selected.startTime, selected.endTime)}h diarias
                      </p>
                    </div>
                    <button
                      onClick={() => setModal('edit')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-elevated hover:bg-bg-hover border border-border text-xs font-medium text-text-secondary rounded-lg transition-colors"
                    >
                      <Pencil size={11} />
                      Editar
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Entrada', value: selected.startTime },
                      { label: 'Salida', value: selected.endTime },
                      { label: 'Horas/día', value: `${dailyHours(selected.startTime, selected.endTime)}h` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-bg-elevated rounded-lg p-3">
                        <div className="text-xs text-text-muted mb-1">{label}</div>
                        <div className="text-lg font-semibold text-text-primary font-mono">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Días laborales</div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6].map(d => {
                        const active = selected.workDays.includes(d as never)
                        return (
                          <div key={d}
                            className={`w-10 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                              active ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-bg-elevated text-text-muted border border-border'
                            }`}>
                            {DAY_LABELS[d]}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Assigned workers */}
                <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <Users size={13} className="text-text-muted" />
                    <h3 className="text-sm font-semibold text-text-primary">Trabajadores asignados</h3>
                    <span className="text-xs text-text-muted ml-auto">{assignedToSelected}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {assignedToSelected === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-text-muted">
                        Ningún trabajador en este horario
                      </div>
                    ) : (
                      workers
                        .filter(w => w.scheduleId === selected.id && w.status === 'active')
                        .map(w => (
                          <div key={w.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors">
                            <Avatar name={w.name} color={w.avatarColor} size="sm" />
                            <div>
                              <div className="text-sm font-medium text-text-primary">{w.name}</div>
                              <div className="text-xs text-text-muted">{w.role}</div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <ScheduleModal
          editing={modal === 'edit' ? (selected ?? null) : null}
          assignedCount={modal === 'edit' ? assignedToSelected : 0}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
