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
│   │       ├── api.ts               # Cliente HTTP tipado: auth header + snake_case→camelCase
│   │       ├── hooks.ts             # Hooks React Query para datos y mutaciones
│   │       ├── supabase.ts          # Cliente Supabase para autenticación
│   │       ├── AuthContext.tsx      # Contexto global de sesión: login, logout, estado
│   │       ├── mockData.ts          # Datos de prueba (referencia, ya no se usa)
│   │       ├── types.ts             # Tipos TypeScript del proyecto
│   │       └── utils.ts             # Funciones auxiliares: fechas, RUT, horas, colores
│   ├── pages/
│   │   └── Login.tsx                # Página de inicio de sesión con Supabase Auth
│   ├── public/
│   │   ├── favicon.svg              # Ícono de la pestaña del navegador
│   │   └── icons.svg                # Sprite de íconos SVG
│   ├── package.json                 # Dependencias del frontend
│   ├── .env.local                   # Variables de entorno frontend (Supabase URL y anon key)
│   ├── tailwind.config.js           # Colores y tokens del sistema de diseño
│   ├── vite.config.ts               # Configuración del servidor de desarrollo
│   └── tsconfig.json                # Configuración de TypeScript
│
├── backend/                         # API REST (Python + FastAPI)
│   ├── main.py                      # Punto de entrada del servidor, CORS, rutas
│   ├── config.py                    # Variables de entorno (Supabase URL, keys, JWT secret)
│   ├── database.py                  # Conexión con Supabase
│   ├── .env                         # Credenciales privadas (no se sube a git)
│   ├── models/
│   │   ├── schemas.py               # Modelos de datos para la API (Pydantic)
│   │   └── __init__.py
│   ├── dependencies/
│   │   ├── auth.py                  # Middleware JWT: valida token Supabase en cada request
│   │   └── __init__.py
│   ├── routers/
│   │   ├── workers.py               # Endpoints de trabajadores (CRUD completo)
│   │   ├── attendance.py            # Endpoints de asistencia, mark manual y simulate-day
│   │   ├── schedules.py             # Endpoints de horarios
│   │   ├── auth.py                  # Endpoint /me para verificar sesión
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
| `lib/api.ts` | Cliente HTTP tipado que conecta con el backend. Convierte respuestas de snake_case a camelCase automáticamente |
| `lib/hooks.ts` | Hooks de React Query para cargar datos de la API: trabajadores, horarios, asistencia, estadísticas |
| `lib/mockData.ts` | Datos de prueba (mayo 2026). Ya no se usa en producción, se conserva como referencia |
| `pages/Soporte.tsx` | Página de soporte con botón WhatsApp, correo, y preguntas frecuentes |
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

- Sistema de diseño completo: modo claro, colores, tipografía Inter, tokens Tailwind
- 7 páginas funcionales conectadas al backend real (Soporte incluida)
- Sidebar con navegación activa, badge de alertas dinámico y cerrar sesión
- Dashboard "Ahora mismo" conectado a API
- Vista Día: registro manual de entrada/salida + botón "Simular día" (dev)
- Reporte Mensual: navega por mes, gráfico y tabla desde la API
- Trabajadores: agregar, editar, desactivar, reactivar — todo conectado a API
- Horarios: turnos y trabajadores desde la API
- Exportar: plantilla base en Google Drive + nota de integración n8n
- Soporte: WhatsApp (+56991717490), correo, FAQ accordion
- Backend FastAPI: routers workers, attendance, schedules, auth
- `/api/v1/attendance/mark`: registro manual con hora y fecha customizables
- `/api/v1/attendance/simulate-day`: simula jornada completa con tiempos realistas
- Autenticación con Supabase Auth + JWT (modo dev: sin restricción si JWT secret no configurado)
- Backend: middleware JWT en todos los routers vía `dependencies/auth.py`
- Frontend: AuthContext + Login page + rutas protegidas + logout en sidebar

### 🔒 Auth — Cómo activar en producción

Requiere 3 pasos:

1. **Crear usuario admin** en Supabase Dashboard → Authentication → Users → "Invite user" (pon tu correo y contraseña)

2. **Backend** — agregar al `.env`:
   ```
   SUPABASE_JWT_SECRET=[JWT Secret de Supabase Dashboard → Settings → API → JWT Settings]
   ```

3. **Frontend** — completar `frontend/.env.local`:
   ```
   VITE_SUPABASE_URL=[mismo que SUPABASE_URL del backend .env]
   VITE_SUPABASE_ANON_KEY=[mismo que SUPABASE_KEY del backend .env]
   ```

Mientras esas variables no estén configuradas, la app funciona en **modo dev sin login** (ambos extremos bypass).

### 🔄 Pendiente / Siguiente

- Exportación real de Excel/PDF (actualmente los botones no descargan nada)
- Integración con lector biométrico ZKTeco ZK4500
- Automatización mensual con n8n (poblar Google Sheet + PDF + email)
- Feriados legales chilenos en el cálculo de días hábiles
- Pruebas con datos reales de un negocio piloto

---

## Últimos cambios

| Fecha | Cambio |
|-------|--------|
| 2026-05-21 | Auth completa: Supabase JWT backend + Login page + rutas protegidas frontend |
| 2026-05-21 | VistaDia: registro manual entrada/salida + botón "Simular día" |
| 2026-05-21 | Trabajadores: modal editar + desactivar + reactivar conectados a API |
| 2026-05-21 | Exportar: plantilla Google Drive creada + sección n8n documentada |
| 2026-05-21 | `/api/v1/attendance/mark` acepta body con tipo, fecha y hora custom |
| 2026-05-21 | `/api/v1/attendance/simulate-day` genera jornada realista para todos los ausentes |
| 2026-05-21 | Modo claro, validaciones de formulario, autofill de prueba, página de Soporte |
| 2026-05-20 | Integración frontend ↔ backend completa: todas las páginas usan API real |
| 2026-05-20 | Creado `src/lib/api.ts` y `src/lib/hooks.ts` |
| 2026-05-18 | MVP inicial: 6 páginas con mockData, backend FastAPI, schema Supabase |
