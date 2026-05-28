# Guía para levantar el servidor

## 1. Requisitos (instalar una sola vez en tu vida)

- **Node.js**: https://nodejs.org → descargá la versión LTS (el botón verde grande)
- **Python 3.11+**: https://www.python.org/downloads → marcá "Add Python to PATH" durante la instalación o después llorás

Verificá que quedaron bien:
```bash
node --version    # debe mostrar algo como v20.x.x
python --version  # debe mostrar Python 3.11.x o superior
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/Joakorojasc/Startup-Attendance.git
cd Startup-Attendance
```

---

## 3. Crear los archivos .env (credenciales)

Estos archivos **no están en el repo** por seguridad. Tenés que crearlos a mano.

### `backend/.env`
Creá un archivo llamado `.env` dentro de la carpeta `backend/` con este contenido exacto:

```
SUPABASE_URL=https://baaqqplouzgcysqblgii.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXFxcGxvdXpnY3lzcWJsZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzkzMzEsImV4cCI6MjA5NDcxNTMzMX0.r4QsWR6k7MeI91yUxMKa5mFmo49GhbuwFe-6aM3qzgQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXFxcGxvdXpnY3lzcWJsZ2lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzOTMzMSwiZXhwIjoyMDk0NzE1MzMxfQ.lEiL9Bct6cRWmyjNLHWC4r7JroCmNg95nitAsZWvdxU
SUPABASE_JWT_SECRET=28bC/PKrvvRxOXW98xJNoZUOTrLBkE7NGIoINECV1sOe3+OMmFWgMCHzIyy8VIbh6JTphRIL1PbdEy+nfEOwaQ==
SECRET_KEY=dev-secret-key-change-in-production-xd
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
Creá un archivo llamado `.env` dentro de la carpeta `frontend/` con este contenido:

```
VITE_SUPABASE_URL=https://baaqqplouzgcysqblgii.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXFxcGxvdXpnY3lzcWJsZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzkzMzEsImV4cCI6MjA5NDcxNTMzMX0.r4QsWR6k7MeI91yUxMKa5mFmo49GhbuwFe-6aM3qzgQ
```

---

## 4. Instalar dependencias

Abrí **dos terminales**. Una para el backend, otra para el frontend. Sí, dos. No una.

### Terminal 1 — Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

> Si `venv\Scripts\activate` no funciona, probá con `source venv/bin/activate` (Linux/Mac).
> Si da error de permisos en Windows, ejecutá PowerShell como administrador y corré: `Set-ExecutionPolicy RemoteSigned`

### Terminal 2 — Frontend
```bash
cd frontend
npm install
```

---

## 5. Levantar el servidor

Cada vez que quieras usar el proyecto hacés esto (con las dos terminales):

### Terminal 1 — Backend
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```
Tiene que aparecer: `Application startup complete.` Si no aparece, algo salió mal y probablemente es tu culpa.

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```
Tiene que aparecer una URL tipo `http://localhost:5173`

---

## 6. Abrir la app

Abrí el navegador y entrá a: **http://localhost:5173**

La primera carga puede demorar hasta 1 minuto (la base de datos se despierta).
Después de eso todo va rápido. Sé paciente, Sebastián.

---

## Problemas frecuentes

**"vite no se reconoce"**
→ Corriste `npm install` en la carpeta incorrecta. Tenés que estar dentro de `frontend/`, no en la raíz del proyecto.

**"python no se reconoce"**
→ No marcaste "Add Python to PATH" durante la instalación. Reinstalá Python y esta vez leé lo que dice el instalador.

**"uvicorn no se reconoce"**
→ No activaste el entorno virtual. Corré `venv\Scripts\activate` primero.

**La página sale en blanco**
→ Revisá que creaste los dos archivos `.env` con el contenido exacto de arriba.

**"No puedo hacer nada, está todo roto"**
→ Llamá a Joaquín.

---

> ⚠️ Este archivo contiene credenciales. No lo subas a ningún repositorio público ni lo compartas con nadie más.
