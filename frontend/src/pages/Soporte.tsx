import { MessageCircle, Mail, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const WA_NUMBER = '56991717490'
const WA_MSG = encodeURIComponent('Hola, necesito ayuda con AsistenTrack 👋')

const FAQS = [
  {
    q: '¿Cómo agrego un trabajador nuevo?',
    a: 'Ve a la sección Trabajadores y haz click en el botón "Agregar". Completa nombre, cargo, teléfono y horario. La huella se registra desde el lector biométrico.',
  },
  {
    q: '¿Cómo registro una entrada o salida manualmente?',
    a: 'Por ahora el registro manual está en desarrollo. Próximamente podrás hacerlo desde la Vista del Día. Mientras tanto, usa el lector biométrico o contáctanos.',
  },
  {
    q: '¿Por qué no aparecen los feriados?',
    a: 'El sistema actualmente calcula días hábiles como lunes a viernes. El soporte de feriados chilenos oficiales está en desarrollo (*próxima versión).',
  },
  {
    q: '¿Puedo exportar el libro de asistencia?',
    a: 'Sí. Ve a la sección Exportar y elige el formato Excel o PDF. El libro de asistencia cumple con los requisitos de la Dirección del Trabajo.',
  },
  {
    q: '¿Cómo conecto el lector biométrico ZKTeco?',
    a: 'La integración con el lector ZKTeco ZK4500 está en la hoja de ruta. Contáctanos para coordinar la instalación y configuración.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-bg-hover transition-colors duration-100"
      >
        <span className="text-sm font-medium text-text-primary">{q}</span>
        {open ? <ChevronUp size={15} className="text-text-muted shrink-0" /> : <ChevronDown size={15} className="text-text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export function Soporte() {
  return (
    <div className="p-6 space-y-6 max-w-[780px]">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Soporte</h1>
        <p className="text-sm text-text-muted mt-0.5">¿Necesitas ayuda? Estamos disponibles para ti.</p>
      </div>

      {/* Contact cards */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="text-sm font-semibold text-text-primary">Canales de contacto</div>
          <div className="text-xs text-text-muted mt-0.5">Elige cómo prefieres comunicarte</div>
        </div>

        {/* WhatsApp row */}
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-6 py-5 border-b border-border hover:bg-bg-hover transition-colors duration-100 group"
        >
          <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
            <MessageCircle size={17} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary">WhatsApp</div>
            <div className="text-xs text-text-muted mt-0.5">+56 9 9171 7490 · Lun–Vie, 9:00–18:00</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium bg-success/8 border border-success/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Respuesta rápida
            </span>
          </div>
        </a>

        {/* Email row */}
        <a
          href="mailto:soporte@asistentrack.cl"
          className="flex items-center gap-4 px-6 py-5 hover:bg-bg-hover transition-colors duration-100 group"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Mail size={17} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary">Correo electrónico</div>
            <div className="text-xs text-text-muted mt-0.5">soporte@asistentrack.cl</div>
          </div>
          <div className="shrink-0">
            <span className="text-xs text-text-muted bg-bg-elevated border border-border px-3 py-1.5 rounded-full">
              Respuesta en 24h
            </span>
          </div>
        </a>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        * Los feriados legales chilenos (18 sep, 1 ene, 1 may, etc.) no están integrados aún en el cálculo de días hábiles. Próxima versión.
      </p>
    </div>
  )
}
