import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'orange' | 'accent' | 'neutral'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  orange: 'bg-orange/10 text-orange border-orange/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  neutral: 'bg-white/5 text-text-secondary border-border',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
