import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { wrap: 'w-7 h-7',   text: 'text-[11px]', ring: 'ring-1' },
  md: { wrap: 'w-8 h-8',   text: 'text-[12px]', ring: 'ring-1' },
  lg: { wrap: 'w-10 h-10', text: 'text-[14px]', ring: 'ring-2' },
}

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const s = sizes[size]
  return (
    <div
      className={`${s.wrap} ${s.text} ${s.ring} rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none transition-transform duration-150 hover:scale-105`}
      style={{
        backgroundColor: color,
        ringColor: color + '55',
        boxShadow: `0 1px 4px ${color}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
