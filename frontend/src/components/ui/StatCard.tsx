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

export function StatCard({ label, value, icon: Icon, iconColor = 'text-text-secondary', valueColor, sub }: StatCardProps) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        <Icon size={15} className={cn('shrink-0', iconColor)} />
      </div>
      <div>
        <div className={cn('text-3xl font-semibold tracking-tight', valueColor ?? 'text-text-primary')}>
          {value}
        </div>
        {sub && <div className="text-xs text-text-muted mt-1">{sub}</div>}
      </div>
    </div>
  )
}
