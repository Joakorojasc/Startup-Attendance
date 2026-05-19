import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none`}
      style={{ backgroundColor: color + '33', border: `1px solid ${color}55`, color }}
    >
      {getInitials(name)}
    </div>
  )
}
