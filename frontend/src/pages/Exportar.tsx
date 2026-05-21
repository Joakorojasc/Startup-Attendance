import { FileSpreadsheet, FileText, Download, CalendarDays, BarChart3, Users, ExternalLink, Workflow } from 'lucide-react'

const DRIVE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SdJdC1UbRd1IfyPZY3DhJJQE_FqHU8mZacAHfmWXchM/edit'
import { useWorkers } from '@/lib/hooks'

interface ExportOption {
  title: string
  description: string
  icon: typeof FileSpreadsheet
  formats: string[]
  tag?: string
}

const OPTIONS: ExportOption[] = [
  { title: 'Reporte mensual', description: 'Resumen de asistencia, horas y puntualidad por trabajador para un mes específico.', icon: BarChart3, formats: ['Excel', 'PDF'], tag: 'Popular' },
  { title: 'Registro diario', description: 'Detalle de entradas y salidas de un día o rango de fechas.', icon: CalendarDays, formats: ['Excel', 'PDF'] },
  { title: 'Listado de trabajadores', description: 'Información de todos los trabajadores: cargo, horario, estado y huella registrada.', icon: Users, formats: ['Excel'] },
  { title: 'Historial de atrasos', description: 'Log completo de llegadas tardías con fecha, trabajador y minutos de atraso.', icon: FileText, formats: ['Excel', 'PDF'] },
]

export function Exportar() {
  const { data: workers = [] } = useWorkers('active')
  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastDayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Exportar</h1>
        <p className="text-sm text-text-muted mt-0.5">Descarga reportes en Excel o PDF</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <div key={opt.title} className="bg-bg-surface border border-border rounded-lg p-5 hover:border-border-strong transition-colors duration-150 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-bg-elevated border border-border rounded flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors duration-150">
                  <opt.icon size={16} className="text-text-muted group-hover:text-accent transition-colors duration-150" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{opt.title}</div>
                  {opt.tag && (
                    <span className="text-[10px] font-medium text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                      {opt.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-4">{opt.description}</p>
            <div className="flex items-center gap-2">
              {opt.formats.map((fmt) => (
                <button key={fmt}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors duration-100 border ${
                    fmt === 'Excel' ? 'bg-success/10 hover:bg-success/15 text-success border-success/20' : 'bg-bg-elevated hover:bg-bg-hover text-text-secondary border-border'
                  }`}
                >
                  <Download size={11} />
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Drive template */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileSpreadsheet size={14} className="text-success" />
              <h2 className="text-sm font-semibold text-text-primary">Plantilla oficial — Google Sheets</h2>
            </div>
            <p className="text-xs text-text-muted">
              Documento base en Drive con el formato del Libro de Asistencia (Art. 33 Código del Trabajo).
            </p>
          </div>
          <a
            href={DRIVE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-success/10 hover:bg-success/15 border border-success/20 text-success text-xs font-medium rounded-lg transition-colors shrink-0 ml-4"
          >
            <ExternalLink size={12} />
            Abrir en Drive
          </a>
        </div>
        <div className="px-5 py-4 flex items-start gap-3 bg-accent/3 border-b border-border">
          <Workflow size={14} className="text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-text-primary mb-0.5">Integración futura con n8n</div>
            <p className="text-xs text-text-muted leading-relaxed">
              La plantilla incluye una hoja con el flujo n8n completo: trigger mensual → API AsistenTrack → poblar Sheet → exportar PDF → enviar por email/WhatsApp. Consulta la pestaña <span className="font-medium text-text-secondary">INTEGRACIÓN FUTURA — n8n</span> dentro del documento.
            </p>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center gap-4 text-xs text-text-muted">
          <span>Estructura: Registro diario · Resumen mensual · Firmas</span>
          <span className="text-border">|</span>
          <span>Formato compatible Dirección del Trabajo</span>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet size={14} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Exportación personalizada</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Desde</label>
            <input type="date" defaultValue={firstDay}
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Hasta</label>
            <input type="date" defaultValue={lastDayStr}
              className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Trabajador</label>
            <select className="w-full px-3 py-2 bg-bg-elevated border border-border rounded text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors">
              <option value="">Todos</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-success/10 hover:bg-success/15 border border-success/20 text-success text-sm font-medium rounded transition-colors duration-100">
            <Download size={13} />
            Exportar Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-hover border border-border text-text-secondary text-sm font-medium rounded transition-colors duration-100">
            <Download size={13} />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
