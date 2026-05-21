import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, Table2, Clock, CheckCircle2, CalendarDays, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/ui/StatCard'
import { useMonthlyStats, useWorkers } from '@/lib/hooks'
import { formatMonthSpanish, addMonths, punctualityTextColor, cn } from '@/lib/utils'

function PunctualityBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : pct >= 60 ? '#f97316' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={cn('text-xs font-medium w-9 text-right tabular-nums', punctualityTextColor(pct))}>
        {pct}%
      </span>
    </div>
  )
}

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
}

export function ReporteMensual() {
  const [date, setDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const year = date.getFullYear()
  const month = date.getMonth()

  const { data: stats = [], isLoading: loadingStats } = useMonthlyStats(year, month)
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers('active')

  const now = new Date()
  const canGoNext = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w]))

  const totalHours = stats.reduce((s, r) => s + r.totalHours, 0)
  const avgPunctuality = stats.length > 0
    ? Math.round(stats.reduce((s, r) => s + r.punctualityPct, 0) / stats.length)
    : 0
  const totalLate = stats.reduce((s, r) => s + r.lateCount, 0)
  const workingDays = stats[0]?.totalWorkingDays ?? 0

  const chartData = stats.map((s) => ({
    name: s.workerName.split(' ')[0],
    horas: s.totalHours,
    color: workerMap[s.workerId]?.avatarColor ?? '#6366f1',
  }))

  if (loadingStats || loadingWorkers) {
    return <div className="p-6 text-sm text-text-muted">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Reporte Mensual</h1>
          <p className="text-sm text-text-muted mt-0.5">Horas trabajadas y puntualidad</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-hover border border-border text-sm font-medium text-text-secondary rounded transition-colors duration-100">
            <FileText size={13} />
            PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors duration-100">
            <Table2 size={13} />
            Excel
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDate(addMonths(date, -1))}
          className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-text-primary min-w-[160px] text-center capitalize">
          {formatMonthSpanish(year, month)}
        </div>
        <button
          onClick={() => setDate(addMonths(date, 1))}
          disabled={!canGoNext}
          className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {stats.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-text-muted text-sm">Sin datos para este mes</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Total horas mes" value={`${totalHours}h`} icon={Clock} iconColor="text-accent" sub="total del equipo" />
            <StatCard
              label="Puntualidad prom."
              value={`${avgPunctuality}%`}
              icon={CheckCircle2}
              iconColor={avgPunctuality >= 80 ? 'text-success' : 'text-warning'}
              valueColor={avgPunctuality >= 80 ? 'text-success' : 'text-warning'}
              sub="promedio del equipo"
            />
            <StatCard label="Días trabajados" value={workingDays} icon={CalendarDays} iconColor="text-text-secondary" sub={`días hábiles* en ${formatMonthSpanish(year, month).split(' ')[0].toLowerCase()}`} />
            <StatCard
              label="Total atrasos"
              value={totalLate}
              icon={AlertCircle}
              iconColor={totalLate > 0 ? 'text-danger' : 'text-text-muted'}
              valueColor={totalLate > 0 ? 'text-danger' : undefined}
              sub="en todo el mes"
            />
          </div>

          <div className="bg-bg-surface border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Horas por trabajador</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(val) => [`${val}h`, 'Horas']} />
                <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Resumen por trabajador — {formatMonthSpanish(year, month)}</h2>
              <span className="text-xs text-text-muted">{workingDays} días hábiles*</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Trabajador', 'Días presentes', 'Total horas', 'Horas extra', 'Atrasos', 'Puntualidad'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.map((s) => {
                  const worker = workerMap[s.workerId]
                  return (
                    <tr key={s.workerId} className="hover:bg-bg-hover transition-colors duration-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.workerName} color={worker?.avatarColor ?? '#6366f1'} size="sm" />
                          <span className="font-medium text-text-primary">{s.workerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary tabular-nums">{s.daysPresent} / {s.totalWorkingDays}</td>
                      <td className="px-4 py-3"><span className="text-accent font-medium tabular-nums">{s.totalHours}h</span></td>
                      <td className="px-4 py-3 text-text-muted tabular-nums">+{s.extraHours}h</td>
                      <td className="px-4 py-3 text-text-secondary tabular-nums">{s.lateCount}</td>
                      <td className="px-4 py-3 w-40"><PunctualityBar pct={s.punctualityPct} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
