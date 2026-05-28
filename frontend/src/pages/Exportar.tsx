import { useState } from 'react'
import { FileSpreadsheet, Download, Printer, ChevronLeft, ChevronRight, ExternalLink, Workflow, Users, BarChart3, CalendarDays, FileText } from 'lucide-react'
import { useWorkers, useSchedules, useMonthlyStats } from '@/lib/hooks'
import { api } from '@/lib/api'
import {
  MONTHS_ES,
  exportMonthlyExcel, printMonthlyReport,
  exportRangeExcel, printRangeReport,
  exportWorkersExcel,
} from '@/lib/exportUtils'

const DRIVE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SdJdC1UbRd1IfyPZY3DhJJQE_FqHU8mZacAHfmWXchM/edit'

function today() {
  return new Date().toISOString().slice(0, 10)
}
function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function lastOfMonth() {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.toISOString().slice(0, 10)
}

function ExportBtn({
  label, icon: Icon, onClick, loading, variant = 'excel',
}: {
  label: string
  icon: typeof Download
  onClick: () => void
  loading: boolean
  variant?: 'excel' | 'print'
}) {
  const cls = variant === 'excel'
    ? 'bg-success/10 hover:bg-success/15 text-success border-success/20'
    : 'bg-bg-elevated hover:bg-bg-hover text-text-secondary border-border'
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 ${cls}`}
    >
      {loading ? (
        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={12} />
      )}
      {label}
    </button>
  )
}

export function Exportar() {
  const now = new Date()
  const [monthState, setMonthState] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [rangeFrom, setRangeFrom] = useState(firstOfMonth())
  const [rangeTo, setRangeTo] = useState(lastOfMonth())
  const [workerId, setWorkerId] = useState('')
  const [lateOnly, setLateOnly] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const { data: workers = [] } = useWorkers()
  const { data: schedules = [] } = useSchedules()
  const { data: monthStats = [], isLoading: statsLoading } = useMonthlyStats(monthState.year, monthState.month)

  const isCurrentMonth = monthState.year === now.getFullYear() && monthState.month === now.getMonth()

  function prevMonth() {
    setMonthState(m => m.month === 0
      ? { year: m.year - 1, month: 11 }
      : { year: m.year, month: m.month - 1 })
  }
  function nextMonth() {
    if (isCurrentMonth) return
    setMonthState(m => m.month === 11
      ? { year: m.year + 1, month: 0 }
      : { year: m.year, month: m.month + 1 })
  }

  async function run(key: string, fn: () => void | Promise<void>) {
    setBusy(key)
    try { await fn() } catch { /* errors are UI-silent for now */ }
    setBusy(null)
  }

  async function rangeExport(format: 'excel' | 'print') {
    const records = await api.attendance.range(rangeFrom, rangeTo, workerId || undefined)
    if (format === 'excel') exportRangeExcel(records, workers, rangeFrom, rangeTo, lateOnly)
    else printRangeReport(records, workers, rangeFrom, rangeTo, lateOnly)
  }

  return (
    <div className="p-6 space-y-5 max-w-[860px]">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Exportar</h1>
        <p className="text-sm text-text-muted mt-0.5">Descarga reportes en Excel o imprímelos como PDF</p>
      </div>

      {/* ── Top row: Monthly + Workers ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Reporte mensual */}
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Reporte mensual</div>
              <div className="text-xs text-text-muted">Resumen por trabajador</div>
            </div>
          </div>

          {/* Month picker */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted transition-colors">
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {MONTHS_ES[monthState.month]} {monthState.year}
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted transition-colors disabled:opacity-25">
              <ChevronRight size={15} />
            </button>
          </div>

          {statsLoading ? (
            <p className="text-xs text-text-muted mb-4">Cargando datos...</p>
          ) : (
            <p className="text-xs text-text-muted mb-4">
              {monthStats.length} trabajador{monthStats.length !== 1 ? 'es' : ''} en este período
            </p>
          )}

          <div className="flex gap-2">
            <ExportBtn label="Excel" icon={Download} variant="excel"
              loading={busy === 'monthly-excel'}
              onClick={() => run('monthly-excel', () => exportMonthlyExcel(monthStats, workers, monthState.year, monthState.month))} />
            <ExportBtn label="Imprimir / PDF" icon={Printer} variant="print"
              loading={busy === 'monthly-print'}
              onClick={() => run('monthly-print', () => printMonthlyReport(monthStats, workers, monthState.year, monthState.month))} />
          </div>
        </div>

        {/* Listado trabajadores */}
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Listado de trabajadores</div>
              <div className="text-xs text-text-muted">Nómina con horarios y estado</div>
            </div>
          </div>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Nombre, cargo, teléfono, horario asignado y estado de huella biométrica de todos los trabajadores.
          </p>
          <ExportBtn label="Excel" icon={Download} variant="excel"
            loading={busy === 'workers-excel'}
            onClick={() => run('workers-excel', () => exportWorkersExcel(workers, schedules))} />
        </div>
      </div>

      {/* ── Range export: Registro + Atrasos ───────────────────────── */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <CalendarDays size={15} className="text-text-muted" />
            <span className="text-sm font-semibold text-text-primary">Exportar por rango de fechas</span>
          </div>
          <p className="text-xs text-text-muted">Registro completo de asistencia o solo los atrasos del período</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Desde</label>
              <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)}
                max={today()}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Hasta</label>
              <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)}
                max={today()}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">Trabajador</label>
              <select value={workerId} onChange={e => setWorkerId(e.target.value)}
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent transition-colors">
                <option value="">Todos</option>
                {workers.filter(w => w.status === 'active').map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type toggle + buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-bg-elevated border border-border rounded-lg">
              <button
                onClick={() => setLateOnly(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${!lateOnly ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <CalendarDays size={12} />
                Asistencia completa
              </button>
              <button
                onClick={() => setLateOnly(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${lateOnly ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <FileText size={12} />
                Solo atrasos
              </button>
            </div>

            <div className="flex gap-2">
              <ExportBtn label="Excel" icon={Download} variant="excel"
                loading={busy === 'range-excel'}
                onClick={() => run('range-excel', () => rangeExport('excel'))} />
              <ExportBtn label="Imprimir / PDF" icon={Printer} variant="print"
                loading={busy === 'range-print'}
                onClick={() => run('range-print', () => rangeExport('print'))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Drive template ──────────────────────────────────────────── */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileSpreadsheet size={14} className="text-success" />
              <h2 className="text-sm font-semibold text-text-primary">Plantilla oficial — Google Sheets</h2>
            </div>
            <p className="text-xs text-text-muted">
              Libro de Asistencia formato Dirección del Trabajo (Art. 33 Código del Trabajo).
            </p>
          </div>
          <a href={DRIVE_SHEET_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-success/10 hover:bg-success/15 border border-success/20 text-success text-xs font-medium rounded-lg transition-colors shrink-0 ml-4">
            <ExternalLink size={12} />
            Abrir en Drive
          </a>
        </div>
        <div className="px-5 py-3 flex items-start gap-3 bg-accent/[0.03]">
          <Workflow size={13} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            Incluye flujo n8n: trigger mensual → API Vexa → poblar Sheet → exportar PDF → enviar por email/WhatsApp.
            Ver pestaña <span className="font-medium text-text-secondary">INTEGRACIÓN FUTURA — n8n</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
