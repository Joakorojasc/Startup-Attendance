import { useState } from 'react'
import { Plus, Trash2, X, Copy, Check } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AppRole } from '@/lib/types'
import { Avatar } from '@/components/ui/Avatar'

const ROLE_LABELS: Record<AppRole, string> = {
  owner: 'Dueño',
  admin: 'Administrador',
  viewer: 'Supervisor',
}

const ROLE_COLORS: Record<AppRole, string> = {
  owner: '#7c3aed',
  admin: '#6366f1',
  viewer: '#64748b',
}

const ROLE_DESC: Record<'admin' | 'viewer', string> = {
  admin: 'Acceso completo: trabajadores, horarios, reportes.',
  viewer: 'Solo lectura: ve reportes y asistencia, no puede modificar nada.',
}

export function Equipo() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'viewer'>('admin')
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['app-users'],
    queryFn: api.users.list,
  })

  const createMut = useMutation({
    mutationFn: () => api.users.create(email, role, name || undefined),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['app-users'] })
      setCreated({ email: data.email, tempPassword: data.tempPassword })
      setEmail(''); setName(''); setRole('admin'); setShowForm(false)
    },
  })

  const deleteMut = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-users'] }),
  })

  async function copyCredentials() {
    if (!created) return
    await navigator.clipboard.writeText(`${created.email} / ${created.tempPassword}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Equipo</h1>
          <p className="text-xs text-text-muted mt-0.5">Gestiona quién tiene acceso a Vexa</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setCreated(null) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancelar' : 'Agregar usuario'}
        </button>
      </div>

      {/* Banner de usuario creado */}
      {created && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-800 mb-0.5">Usuario creado</div>
              <div className="text-xs text-emerald-700 mb-2">{created.email}</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white border border-emerald-200 px-2 py-1 rounded-lg font-mono text-emerald-900">
                  {created.tempPassword}
                </code>
                <button onClick={copyCredentials}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1.5">
                Comparte el correo y contraseña temporal con el usuario.
              </p>
            </div>
            <button onClick={() => setCreated(null)} className="text-emerald-400 hover:text-emerald-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-bg-surface">
          <div className="text-sm font-semibold text-text-primary mb-3">Nuevo usuario</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Email *</label>
              <input
                type="email"
                placeholder="nombre@empresa.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Nombre (opcional)</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-base text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-text-muted mb-2">Rol</label>
            <div className="flex gap-2 mb-1.5">
              {(['admin', 'viewer'] as const).map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    role === r
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/40'
                  }`}>
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted">{ROLE_DESC[role]}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={!email || createMut.isPending}
              onClick={() => createMut.mutate()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              {createMut.isPending ? 'Creando...' : 'Crear usuario'}
            </button>
            {createMut.isError && (
              <p className="text-xs text-red-500">{(createMut.error as Error).message}</p>
            )}
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      {isLoading ? (
        <div className="text-sm text-text-muted py-4">Cargando...</div>
      ) : isError ? (
        <div className="text-sm text-red-500 py-4">Error al cargar usuarios. ¿Está corriendo el backend?</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-bg-surface">
          {users.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-text-muted">No hay usuarios</div>
          ) : users.map((u, i) => (
            <div key={u.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < users.length - 1 ? 'border-b border-border' : ''}`}>
              <Avatar name={u.name ?? u.email} color={ROLE_COLORS[u.role]} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate capitalize">
                  {u.name ?? u.email.split('@')[0]}
                </div>
                <div className="text-xs text-text-muted truncate">{u.email}</div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: ROLE_COLORS[u.role] + '20', color: ROLE_COLORS[u.role] }}>
                {ROLE_LABELS[u.role]}
              </span>
              {u.role !== 'owner' && (
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar a ${u.email}?`)) deleteMut.mutate(u.id)
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
