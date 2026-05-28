import * as XLSX from 'xlsx'
import type { Worker, Schedule, AttendanceRecord, MonthlyWorkerStats } from './types'

export const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const STATUS_ES: Record<string, string> = {
  punctual: 'Puntual',
  late: 'Atraso',
  absent: 'Ausente',
  day_off: 'Día libre',
  in_progress: 'En curso',
}

function workerMap(workers: Worker[]) {
  return Object.fromEntries(workers.map(w => [w.id, w]))
}

function calcHours(entry: string | null, exit: string | null): string {
  if (!entry || !exit) return '—'
  const [eh, em] = entry.split(':').map(Number)
  const [xh, xm] = exit.split(':').map(Number)
  const mins = xh * 60 + xm - (eh * 60 + em)
  return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '—'
}

// ── Monthly report ─────────────────────────────────────────────────

export function exportMonthlyExcel(
  stats: MonthlyWorkerStats[],
  workers: Worker[],
  year: number,
  month: number // 0-indexed
) {
  const wMap = workerMap(workers)
  const label = `${MONTHS_ES[month]} ${year}`
  const header = ['Trabajador', 'Cargo', 'Días presentes', 'Días hábiles', 'Horas trabajadas', 'Atrasos', '% Puntualidad']
  const rows = stats.map(s => [
    s.workerName,
    wMap[s.workerId]?.role ?? '',
    s.daysPresent,
    s.totalWorkingDays,
    `${s.totalHours}h`,
    s.lateCount,
    `${s.punctualityPct}%`,
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    [`Reporte de Asistencia — ${label}`],
    [`Generado: ${new Date().toLocaleDateString('es-CL')}`],
    [],
    header,
    ...rows,
  ])
  ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 15 }]
  ws['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:6} }, { s:{r:1,c:0}, e:{r:1,c:6} }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, label)
  XLSX.writeFile(wb, `reporte-${MONTHS_ES[month].toLowerCase()}-${year}.xlsx`)
}

export function printMonthlyReport(stats: MonthlyWorkerStats[], workers: Worker[], year: number, month: number) {
  const wMap = workerMap(workers)
  const label = `${MONTHS_ES[month]} ${year}`
  const rows = stats.map(s => `
    <tr>
      <td>${s.workerName}</td><td>${wMap[s.workerId]?.role ?? ''}</td>
      <td>${s.daysPresent}</td><td>${s.totalWorkingDays}</td>
      <td>${s.totalHours}h</td><td>${s.lateCount}</td><td>${s.punctualityPct}%</td>
    </tr>`).join('')

  openPrint(`Reporte de Asistencia — ${label}`, `
    <table>
      <thead><tr>
        <th>Trabajador</th><th>Cargo</th><th>Días presentes</th>
        <th>Días hábiles</th><th>Horas</th><th>Atrasos</th><th>Puntualidad</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`)
}

// ── Range (asistencia / atrasos) ───────────────────────────────────

export function exportRangeExcel(
  records: AttendanceRecord[],
  workers: Worker[],
  dateFrom: string,
  dateTo: string,
  lateOnly = false
) {
  const wMap = workerMap(workers)
  const data = (lateOnly ? records.filter(r => r.status === 'late') : records)
    .sort((a, b) => a.date.localeCompare(b.date))

  const label = dateFrom === dateTo ? dateFrom : `${dateFrom} al ${dateTo}`
  const title = lateOnly ? `Historial de Atrasos — ${label}` : `Registro de Asistencia — ${label}`

  const header = lateOnly
    ? ['Fecha', 'Trabajador', 'Cargo', 'Hora entrada', 'Min. atraso']
    : ['Fecha', 'Trabajador', 'Cargo', 'Entrada', 'Salida', 'Horas trabajadas', 'Estado', 'Min. atraso']

  const rows = data.map(r => lateOnly
    ? [r.date, wMap[r.workerId]?.name ?? '', wMap[r.workerId]?.role ?? '', r.entryTime ?? '—', r.lateMinutes]
    : [r.date, wMap[r.workerId]?.name ?? '', wMap[r.workerId]?.role ?? '', r.entryTime ?? '—', r.exitTime ?? '—', calcHours(r.entryTime, r.exitTime), STATUS_ES[r.status] ?? r.status, r.lateMinutes > 0 ? r.lateMinutes : '—']
  )

  const ws = XLSX.utils.aoa_to_sheet([[title], [], header, ...rows])
  ws['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:header.length-1} }]
  ws['!cols'] = lateOnly
    ? [{ wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 14 }]
    : [{ wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, lateOnly ? 'Atrasos' : 'Registro')
  XLSX.writeFile(wb, lateOnly ? `atrasos-${dateFrom}-${dateTo}.xlsx` : `registro-${dateFrom}-${dateTo}.xlsx`)
}

export function printRangeReport(
  records: AttendanceRecord[],
  workers: Worker[],
  dateFrom: string,
  dateTo: string,
  lateOnly = false
) {
  const wMap = workerMap(workers)
  const data = (lateOnly ? records.filter(r => r.status === 'late') : records)
    .sort((a, b) => a.date.localeCompare(b.date))
  const label = dateFrom === dateTo ? dateFrom : `${dateFrom} al ${dateTo}`
  const title = lateOnly ? `Historial de Atrasos — ${label}` : `Registro de Asistencia — ${label}`

  const headers = lateOnly
    ? '<th>Fecha</th><th>Trabajador</th><th>Cargo</th><th>Entrada</th><th>Atraso</th>'
    : '<th>Fecha</th><th>Trabajador</th><th>Cargo</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Atraso</th>'

  const rows = data.map(r => lateOnly ? `
    <tr><td>${r.date}</td><td>${wMap[r.workerId]?.name ?? ''}</td><td>${wMap[r.workerId]?.role ?? ''}</td>
    <td>${r.entryTime ?? '—'}</td><td>${r.lateMinutes} min</td></tr>` : `
    <tr><td>${r.date}</td><td>${wMap[r.workerId]?.name ?? ''}</td><td>${wMap[r.workerId]?.role ?? ''}</td>
    <td>${r.entryTime ?? '—'}</td><td>${r.exitTime ?? '—'}</td><td>${calcHours(r.entryTime, r.exitTime)}</td>
    <td>${STATUS_ES[r.status] ?? r.status}</td><td>${r.lateMinutes > 0 ? r.lateMinutes + ' min' : '—'}</td></tr>`
  ).join('')

  openPrint(title, `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`, !lateOnly)
}

// ── Workers list ──────────────────────────────────────────────────

export function exportWorkersExcel(workers: Worker[], schedules: Schedule[]) {
  const schedMap = Object.fromEntries(schedules.map(s => [s.id, s.name]))
  const header = ['Nombre', 'Cargo', 'Teléfono', 'Estado', 'Horario', 'Huella registrada']
  const rows = workers.map(w => [
    w.name, w.role, w.phone || '—',
    w.status === 'active' ? 'Activo' : 'Inactivo',
    schedMap[w.scheduleId] ?? '—',
    w.fingerprintRegistered ? 'Sí' : 'No',
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    ['Listado de Trabajadores'],
    [`Generado: ${new Date().toLocaleDateString('es-CL')}`],
    [],
    header,
    ...rows,
  ])
  ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 10 }, { wch: 20 }, { wch: 16 }]
  ws['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:5} }, { s:{r:1,c:0}, e:{r:1,c:5} }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trabajadores')
  XLSX.writeFile(wb, `trabajadores-${new Date().toISOString().slice(0,10)}.xlsx`)
}

// ── Print helper ──────────────────────────────────────────────────

function openPrint(title: string, tableHtml: string, landscape = false) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { size: ${landscape ? 'A4 landscape' : 'A4'}; margin: 18mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; }
    h1 { font-size: 15px; margin: 0 0 3px; }
    .sub { color: #64748b; font-size: 10px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #6366f1; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 600; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 18px; font-size: 9px; color: #94a3b8; text-align: right; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="sub">Generado por Vexa · ${new Date().toLocaleDateString('es-CL', {day:'2-digit',month:'long',year:'numeric'})}</p>
  ${tableHtml}
  <p class="footer">Vexa Control Biométrico — Documento generado automáticamente</p>
  <script>window.onload = () => { window.focus(); window.print(); }<\/script>
</body></html>`)
  w.document.close()
}
