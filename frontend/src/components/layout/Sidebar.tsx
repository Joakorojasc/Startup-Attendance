import { NavLink } from 'react-router-dom'
import {
  Fingerprint, Radio, CalendarDays, BarChart3,
  Users, Clock, Download, LifeBuoy, LogOut, UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAttendanceToday } from '@/lib/hooks'
import { useAuth } from '@/lib/AuthContext'

const ROLE_LABELS = { owner: 'Dueño', admin: 'Administrador', viewer: 'Supervisor' }

const SIDEBAR_BG    = '#0b0f1a'
const BORDER_COLOR  = 'rgba(255,255,255,0.06)'
const NAV_MUTED     = '#4a5568'

const navMain = [
  { to: '/',     label: 'Ahora mismo',    icon: Radio },
  { to: '/dia',  label: 'Vista del Día',  icon: CalendarDays },
  { to: '/mes',  label: 'Reporte Mensual',icon: BarChart3 },
]

const navGestion = [
  { to: '/trabajadores', label: 'Trabajadores', icon: Users },
  { to: '/horarios',     label: 'Horarios',     icon: Clock },
  { to: '/exportar',     label: 'Exportar',     icon: Download },
]

function NavItem({
  to, label, icon: Icon, badge,
}: {
  to: string
  label: string
  icon: typeof Radio
  badge?: number
}) {
  return (
    <NavLink to={to} end={to === '/'} className="block">
      {({ isActive }) => (
        <div className={cn(
          'relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 select-none cursor-pointer group',
          isActive
            ? 'text-indigo-300'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
        )}>
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/[0.18] to-indigo-500/0 pointer-events-none" />
              <div className="absolute left-0 top-[18%] bottom-[18%] w-[2px] rounded-r-full pointer-events-none" style={{ background: '#818cf8' }} />
            </>
          )}
          <Icon
            size={14}
            className={cn(
              'shrink-0 relative transition-colors',
              isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
            )}
          />
          <span className="flex-1 truncate relative">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="relative min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1"
              style={{ background: '#ef4444', color: '#fff' }}>
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.13em]" style={{ color: NAV_MUTED }}>
        {label}
      </div>
      <div className="space-y-px">{children}</div>
    </div>
  )
}

export function Sidebar() {
  const { data: todayRecords = [] } = useAttendanceToday()
  const alertCount = todayRecords.filter(r => r.lateMinutes > 0 && r.entryTime).length
  const { session, authConfigured, logout, role } = useAuth()
  const userEmail = session?.user?.email ?? ''
  const userName  = session?.user?.user_metadata?.name ?? userEmail.split('@')[0]
  const canManage = role === 'owner' || role === 'admin'

  return (
    <aside
      className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}
    >
      {/* Logo */}
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-[10px] blur-xl opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }} />
            <div className="relative w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
              <Fingerprint size={13} className="text-white" />
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold leading-none" style={{ color: '#f1f5f9' }}>Vexa</div>
            <div className="text-[9.5px] mt-0.5 font-semibold uppercase tracking-[0.14em]" style={{ color: NAV_MUTED }}>
              Control Biométrico
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <NavGroup label="Principal">
          {navMain.map(item => (
            <NavItem key={item.to} {...item} badge={item.to === '/' ? alertCount : undefined} />
          ))}
        </NavGroup>

        {canManage && (
          <NavGroup label="Gestión">
            {navGestion.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </NavGroup>
        )}

        {role === 'owner' && (
          <NavGroup label="Cuenta">
            <NavItem to="/equipo" label="Equipo" icon={UserCog} />
          </NavGroup>
        )}
      </nav>

      {/* Soporte */}
      <div className="px-2 pb-2">
        <NavItem to="/soporte" label="Soporte" icon={LifeBuoy} />
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: BORDER_COLOR }} />

      {/* User */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER_COLOR}` }}>
          <Avatar name={userName || 'U'} color="#6366f1" size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate capitalize" style={{ color: '#e2e8f0' }}>
              {userName}
            </div>
            <div className="inline-flex mt-0.5 items-center rounded-full px-1.5 text-[10px] font-semibold"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              {ROLE_LABELS[role]}
            </div>
          </div>
          {authConfigured && (
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 group"
              style={{ color: NAV_MUTED }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = NAV_MUTED)}
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
