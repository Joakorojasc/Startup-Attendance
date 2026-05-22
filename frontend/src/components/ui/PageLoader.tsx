import { useState, useEffect } from 'react'

export function PageLoader() {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="p-6 flex flex-col gap-1.5">
      <span className="text-sm text-text-muted">Cargando...</span>
      {showHint && (
        <span className="text-xs text-text-muted max-w-sm">
          La base de datos se está activando. La primera carga del día puede tomar hasta 1 minuto.
        </span>
      )}
    </div>
  )
}
