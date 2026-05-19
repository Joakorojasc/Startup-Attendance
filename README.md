# AsistenTrack — Control Biométrico

Sistema de control de asistencia para pymes chilenas.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS v3 |
| UI | shadcn/ui (Radix primitives) + Recharts + lucide-react |
| State | TanStack Query |
| Backend | Python + FastAPI |
| Base de datos | Supabase (PostgreSQL + Realtime) |
| Automatizaciones | n8n (self-hosted) |

## Estructura del proyecto

```
Startup-Attendance/
├── frontend/          # Panel web React
│   └── src/
│       ├── components/
│       │   ├── layout/   # Sidebar, Layout
│       │   └── ui/       # Avatar, Badge, StatCard
│       ├── pages/        # 6 vistas del panel
│       └── lib/          # types, mockData, utils
└── backend/           # API FastAPI
    ├── main.py
    ├── routers/       # workers, attendance, schedules
    ├── models/        # Pydantic schemas
    ├── supabase_schema.sql
    └── requirements.txt
```

## Inicio rápido

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env         # agrega aquí las credenciales de tu base de datos
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

// Nota: No es obligatorio usar venv, pero es recomendable para aislar dependencias.  
// El proyecto usa Supabase como base de datos por facilidad y hosting gratuito.  
// Puedes cambiar a PostgreSQL normal u otra base, pero tendrías que ajustar la conexión en el backend.

### Base de datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `backend/supabase_schema.sql` en el SQL Editor
3. Copiar URL y claves al `.env`

## Vistas del panel

| Ruta | Vista |
|------|-------|
| `/` | Ahora mismo — estado en vivo |
| `/dia` | Vista del Día — registro diario |
| `/mes` | Reporte Mensual — horas y puntualidad |
| `/trabajadores` | Gestión de trabajadores |
| `/horarios` | Configuración de turnos |
| `/exportar` | Exportar Excel / PDF |

## API endpoints

```
GET  /api/v1/workers/
POST /api/v1/workers/
PATCH /api/v1/workers/{id}

GET  /api/v1/attendance/today
GET  /api/v1/attendance/day/{date}
POST /api/v1/attendance/mark?worker_id=...
GET  /api/v1/attendance/month/{year}/{month}

GET  /api/v1/schedules/
POST /api/v1/schedules/
```
