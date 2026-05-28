import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'orange' | 'accent' | 'neutral'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants: Record<BadgeVariant, { cls: string; dot: string }> = {
  success: { cls: 'bg-success/10 text-success border-success/20',   dot: 'bg-success' },
  warning: { cls: 'bg-warning/10 text-warning border-warning/20',   dot: 'bg-warning' },
  danger:  { cls: 'bg-danger/10  text-danger  border-danger/20',    dot: 'bg-danger' },
  orange:  { cls: 'bg-orange/10  text-orange  border-orange/20',    dot: 'bg-orange' },
  accent:  { cls: 'bg-accent/10  text-accent  border-accent/20',    dot: 'bg-accent' },
  neutral: { cls: 'bg-black/5    text-text-secondary border-border', dot: 'bg-text-muted' },
}

export function Badge({ variant, children, className, dot = false }: BadgeProps) {
  const v = variants[variant]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
      v.cls,
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', v.dot)} />}
      {children}
    </span>
  )
}
