from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import workers, attendance, schedules

app = FastAPI(
    title="AsistenTrack API",
    description="Control biométrico de asistencia para pymes",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workers.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(schedules.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AsistenTrack API"}
