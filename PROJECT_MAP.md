# PROJECT_MAP — AsistenTrack

## Estructura del proyecto

```
Startup-Attendance/
├── frontend/                        # Aplicación web (React)
│   ├── src/
│   │   ├── App.tsx                  # Raíz de la app, define rutas
│   │   ├── main.tsx                 # Punto de entrada de React
│   │   ├── App.css                  # Estilos base mínimos
│   │   ├── pages/
│   │   │   ├── AhoraMismo.tsx       # Página principal: quién está adentro ahora
│   │   │   ├── VistaDia.tsx         # Registro de asistencia de un día específico
│   │   │   ├── ReporteMensual.tsx   # Reporte del mes con gráfico y tabla
│   │   │   ├── Trabajadores.tsx     # Lista y gestión de trabajadores
│   │   │   ├── Horarios.tsx         # Configuración de turnos
│   │   │   └── Exportar.tsx         # Descarga de reportes Excel/PDF
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx       # Contenedor general con sidebar
│   │   │   │   └── Sidebar.tsx      # Menú lateral de navegación
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx       # Foto/iniciales del trabajador
│   │   │       ├── Badge.tsx        # Etiqueta de estado (Puntual, Atraso, etc.)
│   │   │       └── StatCard.tsx     # Tarjeta de estadística con ícono y valor
│   │   └── lib/
│   │       ├── mockData.ts          # Datos de prueba: trabajadores, asistencia, alertas
│   │       ├── types.ts             # Definición de tipos TypeScript del proyecto
│   │       └── utils.ts             # Funciones auxiliares: fechas, RUT, horas, colores
│   ├── public/
│   │   ├── favicon.svg              # Ícono de la pestaña del navegador
│   │   └── icons.svg                # Sprite de íconos SVG
│   ├── package.json                 # Dependencias del frontend
│   ├── tailwind.config.js           # Colores y tokens del sistema de diseño
│   ├── vite.config.ts               # Configuración del servidor de desarrollo
│   └── tsconfig.json                # Configuración de TypeScript
│
├── backend/                         # API REST (Python + FastAPI)
│   ├── main.py                      # Punto de entrada del servidor, CORS, rutas
│   ├── config.py                    # Variables de entorno (Supabase URL y key)
│   ├── database.py                  # Conexión con Supabase
│   ├── .env                         # Credenciales privadas (no se sube a git)
│   ├── models/
│   │   ├── schemas.py               # Modelos de datos para la API (Pydantic)
│   │   └── __init__.py
│   ├── routers/
│   │   ├── workers.py               # Endpoints de trabajadores (CRUD)
│   │   ├── attendance.py            # Endpoints de asistencia y marcajes
│   │   ├── schedules.py             # Endpoints de horarios
│   │   └── __init__.py
│   └── supabase_schema.sql          # Estructura de las tablas en la base de datos
│
├── PROJECT_MAP.md                   # Este archivo
├── CLAUDE.md                        # Instrucciones de trabajo para la IA
└── README.md                        # Descripción general del proyecto
```

---

## Qué hace cada archivo

### Frontend — Páginas

| Archivo | Qué hace |
|---------|----------|
| `pages/AhoraMismo.tsx` | Pantalla principal con reloj en vivo, quién está adentro ahora, quiénes no han marcado, y alertas recientes de atrasos |
| `pages/VistaDia.tsx` | Muestra la asistencia de un día: entrada, salida, horas trabajadas y estado de cada trabajador. Navega entre días hábiles |
| `pages/ReporteMensual.tsx` | Resumen del mes: total de horas, puntualidad, atrasos, y gráfico de barras por trabajador |
| `pages/Trabajadores.tsx` | Lista de trabajadores con búsqueda, estado de huella, puntualidad del mes. Incluye modal para agregar nuevos |
| `pages/Horarios.tsx` | Muestra los turnos configurados y qué trabajadores tienen cada horario |
| `pages/Exportar.tsx` | Tarjetas para descargar reportes en Excel o PDF, con opción de rango de fechas personalizado |

### Frontend — Componentes

| Archivo | Qué hace |
|---------|----------|
| `layout/Layout.tsx` | Envuelve todas las páginas con el sidebar lateral y el área de contenido principal |
| `layout/Sidebar.tsx` | Menú de navegación izquierdo con logo, secciones Principal/Gestión, y usuario activo |
| `ui/Avatar.tsx` | Muestra las iniciales del trabajador en un círculo de color único por persona |
| `ui/Badge.tsx` | Pequeña etiqueta de color para mostrar estados: Puntual, Atraso, Ausente, Activo, etc. |
| `ui/StatCard.tsx` | Tarjeta con ícono, número grande y etiqueta. Se usa en los dashboards de cada página |

### Frontend — Librería

| Archivo | Qué hace |
|---------|----------|
| `lib/mockData.ts` | Contiene los datos de prueba del mes de mayo 2026: 8 trabajadores, registros de asistencia, alertas. Reemplazará a la API cuando esté conectada |
| `lib/types.ts` | Define las estructuras de datos TypeScript: Worker, Schedule, AttendanceRecord, etc. |
| `lib/utils.ts` | Funciones de uso general: formatear fechas en español, calcular horas, colorear puntualidad, formatear RUT chileno |

### Backend — API

| Archivo | Qué hace |
|---------|----------|
| `backend/main.py` | Inicia el servidor FastAPI, configura CORS para que el frontend pueda conectarse, y registra los routers |
| `backend/config.py` | Lee las variables de entorno del archivo `.env` (URL y clave de Supabase) |
| `backend/database.py` | Crea el cliente de Supabase que usan los routers para leer y escribir en la base de datos |
| `backend/models/schemas.py` | Define los formatos de datos que acepta y devuelve la API (validación con Pydantic) |
| `backend/routers/workers.py` | Endpoints para listar, crear, editar y desactivar trabajadores |
| `backend/routers/attendance.py` | Endpoints para registrar marcajes de entrada/salida y consultar asistencia |
| `backend/routers/schedules.py` | Endpoints para consultar y configurar horarios de trabajo |
| `backend/supabase_schema.sql` | Script SQL con la estructura de las tablas: workers, attendance_records, schedules |

---

## Estado actual del proyecto

### ✅ Completado

- Sistema de diseño completo: dark mode, colores, tipografía Inter, tokens Tailwind
- 6 páginas funcionales con datos de prueba (mayo 2026)
- Sidebar con navegación activa y badge de alertas
- Dashboard "Ahora mismo" con reloj en vivo, stats y lista de dentro/sin registrar
- Vista Día con navegación entre días hábiles y tabla completa de asistencia
- Reporte Mensual con gráfico de barras (Recharts) y tabla por trabajador
- Página Trabajadores con búsqueda, tabla, sección colapsable de inactivos, **modal "Agregar trabajador"** con formateo de RUT chileno
- Página Horarios: lista de turnos + detalle con días activos y trabajadores asignados
- Página Exportar: tarjetas de descarga + sección de exportación personalizada con selector de trabajadores
- Backend FastAPI con estructura de routers y conexión a Supabase lista
- Schema SQL de Supabase definido

### 🔄 Pendiente / En progreso

- Conectar frontend con la API del backend (actualmente usa `mockData.ts`)
- Implementar autenticación de usuario (login)
- Guardar trabajador nuevo desde el modal (POST a la API)
- Integración con lector biométrico ZKTeco ZK4500 (futuro)
- Alertas automáticas por WhatsApp/email via n8n (futuro)
- Pruebas con datos reales de un negocio piloto

---

## Últimos cambios

| Fecha | Cambio |
|-------|--------|
| 2026-05-18 | Modal "Agregar trabajador" en página Trabajadores con RUT chileno, nombre, cargo, teléfono, horario |
| 2026-05-18 | Fix bug crítico: loop infinito al navegar días en VistaDia — reemplazado por índice en array |
| 2026-05-18 | Botones de navegación deshabilitados en bordes del calendario (primer y último día hábil) |
| 2026-05-18 | Botón "Agregar trabajador" en AhoraMismo navega a `/trabajadores` |
| 2026-05-18 | Select de trabajador en Exportar poblado con trabajadores activos del sistema |
| 2026-05-18 | ReporteMensual: flecha adelante deshabilitada cuando no hay datos para el mes siguiente |
| 2026-05-18 | WorkerRow movido fuera del componente Trabajadores (anti-patrón React corregido) |
| 2026-05-18 | Proyecto inicializado: stack React + Tailwind v3 + FastAPI + Supabase |
