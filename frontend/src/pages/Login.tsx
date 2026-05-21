import { useState, type FormEvent } from 'react'
import { Fingerprint, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const err = await login(email, password)
    if (err) setError('Correo o contraseña incorrectos')
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors'

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
            <Fingerprint size={18} className="text-accent" />
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary leading-none">AsistenTrack</div>
            <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Control Biométrico</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-border">
            <h1 className="text-sm font-semibold text-text-primary">Iniciar sesión</h1>
            <p className="text-xs text-text-muted mt-0.5">Accede a tu panel de asistencia</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@empresa.cl"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  className={inputCls + ' pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors duration-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          ¿Problemas para acceder? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  )
}
