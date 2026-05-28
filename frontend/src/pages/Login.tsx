import { useState, type FormEvent, useEffect, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

/* ── Particle config ─────────────────────────────────────── */
const MAX_P        = 280
const MIN_SPEED    = 0.4
const MAX_SPEED    = 1.4
const MAX_LIFE     = 900    // frames
const FRICTION_K   = 0.975
const REPEL_R      = 120
const SPAWN_STAGGER = 7     // frames between initial activations

interface P {
  x: number; y: number; vx: number; vy: number
  r: number; baseAlpha: number; t: number
  life: number; delay: number; active: boolean
}

const PC = [
  (a: number) => `rgba(99,102,241,${a})`,
  (a: number) => `rgba(124,58,237,${a})`,
  (a: number) => `rgba(167,139,250,${a})`,
  (a: number) => `rgba(196,181,253,${a})`,
  (a: number) => `rgba(79,70,229,${a})`,
]

function newParticle(sx: number, sy: number, delay = 0): P {
  const angle = Math.random() * Math.PI * 2
  const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)
  return {
    x: sx, y: sy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: Math.random() * 2.2 + 0.5,
    baseAlpha: Math.random() * 0.45 + 0.15,
    t: Math.floor(Math.random() * PC.length),
    life: MAX_LIFE,
    delay,
    active: delay === 0,
  }
}

/* ── Component ───────────────────────────────────────────── */
export function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [hov, setHov]           = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const auroraRef = useRef<HTMLDivElement>(null)
  const iconRef   = useRef<HTMLDivElement>(null)
  const mouse     = useRef({ x: -999, y: -999 })
  const aPos      = useRef({ x: -999, y: -999 })
  const spawn     = useRef({ x: 0, y: 0 })
  const ps        = useRef<P[]>([])
  const raf       = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    const updateSpawn = () => {
      if (!iconRef.current) return
      const r = iconRef.current.getBoundingClientRect()
      spawn.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      updateSpawn()
      const { x: sx, y: sy } = spawn.current
      ps.current = Array.from({ length: MAX_P }, (_, i) =>
        newParticle(sx, sy, i * SPAWN_STAGGER)
      )
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouse.current
      const { x: sx, y: sy } = spawn.current

      /* Aurora follows mouse */
      aPos.current.x += (mx - aPos.current.x) * 0.05
      aPos.current.y += (my - aPos.current.y) * 0.05
      if (auroraRef.current)
        auroraRef.current.style.transform =
          `translate(${aPos.current.x - 350}px, ${aPos.current.y - 350}px)`

      /* Particles */
      const alive: P[] = []
      for (const p of ps.current) {
        if (!p.active) {
          if (--p.delay <= 0) p.active = true
          alive.push(p)
          continue
        }

        p.life--

        if (p.life <= 0) {
          // Respawn from icon with random stagger
          const fresh = newParticle(sx, sy, Math.floor(Math.random() * 60 + 5))
          alive.push(fresh)
          continue
        }

        /* Repulsion */
        const dx = p.x - mx, dy = p.y - my
        const d  = Math.hypot(dx, dy)
        if (d < REPEL_R && d > 0) {
          const f = ((REPEL_R - d) / REPEL_R) ** 2 * 1.9
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }

        p.vx += (Math.random() - 0.5) * 0.025
        p.vy += (Math.random() - 0.5) * 0.025
        p.vx *= FRICTION_K; p.vy *= FRICTION_K
        p.x  += p.vx;       p.y  += p.vy

        /* Alpha fade-in / fade-out */
        const progress = 1 - p.life / MAX_LIFE          // 0=birth, 1=death
        const fadeIn   = Math.min(1, progress * 12)
        const fadeOut  = Math.min(1, (1 - progress) * 8)
        const alpha    = p.baseAlpha * Math.min(fadeIn, fadeOut)

        /* Wrap — but only gently: don't hard-wrap, let them drift off */
        const pad = 60
        if (p.x < -pad || p.x > canvas.width + pad ||
            p.y < -pad || p.y > canvas.height + pad) {
          const fresh = newParticle(sx, sy, Math.floor(Math.random() * 40))
          alive.push(fresh)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = PC[p.t](alpha)
        ctx.fill()

        alive.push(p)
      }
      ps.current = alive

      /* Connection lines between close active particles */
      const visible = alive.filter(p => p.active && p.life < MAX_LIFE - 30)
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i], b = visible[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(99,102,241,${0.14 * (1 - d / 100)})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      raf.current = requestAnimationFrame(tick)
    }

    tick()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf.current) }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError(null)
    const err = await login(email, password)
    if (err) setError('Correo o contraseña incorrectos')
    setLoading(false)
  }

  async function quickLogin(e: string, p: string) {
    setLoading(true); setError(null)
    const err = await login(e, p)
    if (err) setError('Error: ' + err)
    setLoading(false)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    fontSize: 14, color: '#0f172a', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', outline: 'none', transition: 'all 0.18s',
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: '#fafbff' }}
      onMouseMove={e => {
        mouse.current = { x: e.clientX, y: e.clientY }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Corner glows */}
      <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)' }} />
      <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)' }} />

      {/* Mouse aurora */}
      <div ref={auroraRef} className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.03) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

      <div className="relative z-10 w-full max-w-[370px]">

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div ref={iconRef} className="relative">
            <div className="absolute inset-0 rounded-[18px] blur-2xl opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }} />
            <div className="relative w-[58px] h-[58px] rounded-[18px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                boxShadow: '0 8px 28px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <path d="M14 4C8.477 4 4 8.477 4 14"    stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
                <path d="M14 7C10.134 7 7 10.134 7 14"   stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M14 10C11.791 10 10 11.791 10 14c0 2 1 3.5 1 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
                <path d="M14 13c-.552 0-1 .448-1 1 0 3 2 4.5 2 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 14c0-1.657-1.343-3-3-3"     stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
                <path d="M20 14c0-3.314-2.686-6-6-6"     stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M23 14c0-4.971-4.029-9-9-9"     stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
              </svg>
            </div>
          </div>

          <div className="text-center">
            <span className="name-ird text-[40px] font-black tracking-[-2px] leading-none">
              Vexa
            </span>
            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase mt-1"
              style={{ color: 'rgba(99,102,241,0.45)' }}>
              Control Biométrico
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(99,102,241,0.11)',
          boxShadow: '0 2px 4px rgba(99,102,241,0.03), 0 16px 40px rgba(99,102,241,0.08)',
        }}>
          <div className="h-[2px]" style={{
            background: 'linear-gradient(90deg, transparent, #6366f1 30%, #7c3aed 70%, transparent)'
          }} />
          <div className="px-8 py-5 border-b border-slate-100">
            <div className="text-sm font-bold text-slate-900 tracking-tight">Iniciar sesión</div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">Bienvenido de vuelta</div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 transition-all duration-200 select-none ${hov === 'email' ? 'label-ird' : 'text-slate-500'}`}
                onMouseEnter={() => setHov('email')}
                onMouseLeave={() => setHov(null)}
              >
                Correo electrónico
              </label>
              <input
                type="email" autoComplete="email" placeholder="admin@empresa.cl"
                value={email} onChange={e => { setEmail(e.target.value); setError(null) }}
                style={inputBase}
                onFocus={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)' }}
                onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none' }}
                required
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 transition-all duration-200 select-none ${hov === 'pw' ? 'label-ird' : 'text-slate-500'}`}
                onMouseEnter={() => setHov('pw')}
                onMouseLeave={() => setHov(null)}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setError(null) }}
                  style={{ ...inputBase, paddingRight: 40 }}
                  onFocus={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)' }}
                  onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none' }}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-[11px] text-sm font-semibold rounded-xl text-white transition-all duration-150 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                boxShadow: (!loading && email && password)
                  ? '0 4px 16px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
              }}
              onMouseEnter={e => {
                if (!loading && email && password) {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.12)'
                  el.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = (!loading && email && password)
                  ? '0 4px 16px rgba(99,102,241,0.38), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none'
                el.style.transform = 'translateY(0)'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar a Vexa'}
            </button>
          </form>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4">
            <div className="text-[10px] text-slate-300 text-center mb-2 font-semibold uppercase tracking-widest">
              Acceso rápido · dev
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Dueño', email: 'owner@vexa.cl', pw: 'owner1234' },
                { label: 'Admin', email: 'admin@vexa.cl', pw: 'admin1234' },
                { label: 'Viewer', email: 'viewer@vexa.cl', pw: 'viewer1234' },
              ].map(u => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => quickLogin(u.email, u.pw)}
                  disabled={loading}
                  className="py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all disabled:opacity-40"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-300 mt-5 font-medium">
          ¿Problemas para acceder? Contacta al administrador.
        </p>
      </div>
    </div>
  )
}
