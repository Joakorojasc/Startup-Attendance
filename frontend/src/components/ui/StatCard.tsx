import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
  sub?: string
}

const ACCENT_MAP: Record<string, { hex: string; bg: string; glow: string }> = {
  'text-accent':          { hex: '#6366f1', bg: 'rgba(99,102,241,0.12)',  glow: 'rgba(99,102,241,0.3)' },
  'text-danger':          { hex: '#ef4444', bg: 'rgba(239,68,68,0.10)',   glow: 'rgba(239,68,68,0.25)' },
  'text-warning':         { hex: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  glow: 'rgba(245,158,11,0.25)' },
  'text-success':         { hex: '#10b981', bg: 'rgba(16,185,129,0.10)',  glow: 'rgba(16,185,129,0.25)' },
  'text-text-muted':      { hex: '#94a3b8', bg: 'rgba(148,163,184,0.10)', glow: 'rgba(148,163,184,0.2)' },
  'text-text-secondary':  { hex: '#64748b', bg: 'rgba(100,116,139,0.10)', glow: 'rgba(100,116,139,0.2)' },
}

export function StatCard({ label, value, icon: Icon, iconColor = 'text-text-muted', valueColor, sub }: StatCardProps) {
  const accent = ACCENT_MAP[iconColor] ?? ACCENT_MAP['text-text-muted']

  return (
    <div className="relative bg-bg-surface rounded-xl overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
      style={{ border: '1px solid rgba(203,213,225,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent.hex} 40%, ${accent.hex} 60%, transparent 100%)` }} />

      <div className="p-4 pt-5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
          style={{ background: accent.bg, boxShadow: `0 2px 8px ${accent.glow}` }}>
          <Icon size={18} className={iconColor} />
        </div>

        {/* Value */}
        <div className={cn('text-[28px] font-bold tracking-tight leading-none mb-1', valueColor ?? 'text-text-primary')}>
          {value}
        </div>

        {/* Label */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </div>

        {sub && <div className="text-[11px] text-text-disabled mt-1">{sub}</div>}
      </div>
    </div>
  )
}
