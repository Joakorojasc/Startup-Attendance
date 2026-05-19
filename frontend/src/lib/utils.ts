import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10
}

export function punctualityColor(pct: number): string {
  if (pct >= 90) return 'bg-success'
  if (pct >= 70) return 'bg-warning'
  if (pct >= 60) return 'bg-orange'
  return 'bg-danger'
}

export function punctualityTextColor(pct: number): string {
  if (pct >= 90) return 'text-success'
  if (pct >= 70) return 'text-warning'
  if (pct >= 60) return 'text-orange'
  return 'text-danger'
}

export function formatTime(time: string | null): string {
  if (!time) return '—'
  return time
}

export function lateLabel(minutes: number): string {
  if (minutes <= 0) return 'Puntual'
  return `Atraso +${minutes}min`
}

const SPANISH_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const SPANISH_MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function formatDateSpanish(date: Date): string {
  return `${SPANISH_DAYS[date.getDay()]} ${date.getDate()} ${SPANISH_MONTHS_SHORT[date.getMonth()]}`
}

export function formatMonthSpanish(year: number, month: number): string {
  return `${SPANISH_MONTHS[month]} ${year}`
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function workingDaysInMonth(year: number, month: number): number {
  let count = 0
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}
