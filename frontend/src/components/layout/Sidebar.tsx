import { NavLink } from 'react-router-dom'
import {
  Fingerprint,
  Radio,
  CalendarDays,
  BarChart3,
  Users,
  Clock,
  Download,
  LifeBuoy,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAttendanceToday } from '@/lib/hooks'
import { useAuth } from '@/lib/AuthContext'

const navMain = [
  { to: '/', label: 'Ahora mismo', icon: Radio },
  { to: '/dia', label: 'Vista del Día', icon: CalendarDays },
  { to: '/mes', label: 'Reporte Mensual', icon: BarChart3 },
]

const navGestion = [
  { to: '/trabajadores', label: 'Trabajadores', icon: Users },
  { to: '/horarios', label: 'Horarios', icon: Clock },
  { to: '/exportar', label: 'Exportar', icon: Download },
]

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string
  label: string
  icon: typeof Radio
  badge?: number
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-100 group',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={15} className={cn('shrink-0', isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary')} />
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="bg-danger text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { data: todayRecords = [] } = useAttendanceToday()
  const alertCount = todayRecords.filter((r) => r.lateMinutes > 0 && r.entryTime).length
  const { session, authConfigured, logout } = useAuth()
  const userEmail = session?.user?.email ?? 'Administrador'
  const userName = session?.user?.user_metadata?.name ?? userEmail.split('@')[0]

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-bg-surface overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent/20 border border-accent/30 rounded flex items-center justify-center">
            <Fingerprint size={14} className="text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary leading-none">AsistenTrack</div>
            <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Control Biométrico</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div>
          <div className="px-3 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            Principal
          </div>
          <div className="space-y-0.5">
            {navMain.map((item) => (
              <NavItem key={item.to} {...item} badge={item.to === '/' ? alertCount : undefined} />
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            Gestión
          </div>
          <div className="space-y-0.5">
            {navGestion.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Soporte */}
      <div className="px-2 pb-2">
        <NavLink
          to="/soporte"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-all duration-100 group',
              isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LifeBuoy size={15} className={cn('shrink-0', isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary')} />
              <span>Soporte</span>
            </>
          )}
        </NavLink>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar name={userName} color="#6366f1" size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate capitalize">{userName}</div>
            <div className="text-[10px] text-text-muted">Administrador</div>
          </div>
          {authConfigured && (
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-danger transition-colors"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
