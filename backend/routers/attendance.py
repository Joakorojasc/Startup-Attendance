from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_supabase
from models.schemas import AttendanceRecord, AttendanceRecordCreate, AttendanceRecordUpdate, DailyStats, MonthlyWorkerStats
from datetime import date
import calendar

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/today", response_model=list[AttendanceRecord])
async def get_today(db: Client = Depends(get_supabase)):
    today = date.today().isoformat()
    result = db.table("attendance").select("*").eq("date", today).execute()
    return result.data


@router.get("/day/{date_str}", response_model=list[AttendanceRecord])
async def get_day(date_str: str, db: Client = Depends(get_supabase)):
    result = db.table("attendance").select("*").eq("date", date_str).execute()
    return result.data


@router.get("/day/{date_str}/stats", response_model=DailyStats)
async def get_day_stats(date_str: str, db: Client = Depends(get_supabase)):
    records = db.table("attendance").select("*").eq("date", date_str).execute().data
    workers = db.table("workers").select("id").eq("status", "active").execute().data

    present = sum(1 for r in records if r.get("entry_time"))
    late = sum(1 for r in records if r.get("late_minutes", 0) > 0 and r.get("entry_time"))
    total = len(workers)
    absent = total - present

    def mins_worked(r: dict) -> int:
        if not r.get("entry_time") or not r.get("exit_time"):
            return 0
        eh, em = map(int, r["entry_time"].split(":"))
        xh, xm = map(int, r["exit_time"].split(":"))
        return (xh * 60 + xm) - (eh * 60 + em)

    finished = [r for r in records if r.get("exit_time")]
    avg_hours = (sum(mins_worked(r) for r in finished) / len(finished) / 60) if finished else 0.0

    return DailyStats(
        date=date_str,  # type: ignore[arg-type]
        present=present,
        late=late,
        absent=absent,
        total_workers=total,
        avg_hours=round(avg_hours, 1),
    )


@router.get("/month/{year}/{month}", response_model=list[MonthlyWorkerStats])
async def get_month_stats(year: int, month: int, db: Client = Depends(get_supabase)):
    month_str = f"{year}-{month:02d}"
    records = db.table("attendance").select("*").like("date", f"{month_str}%").execute().data
    workers = db.table("workers").select("*, schedules(start_time, end_time)").eq("status", "active").execute().data

    _, days_in_month = calendar.monthrange(year, month)
    working_days = sum(
        1 for d in range(1, days_in_month + 1)
        if date(year, month, d).weekday() < 5
    )

    stats = []
    for w in workers:
        w_records = [r for r in records if r["worker_id"] == w["id"]]
        days_present = sum(1 for r in w_records if r.get("entry_time"))
        late_count = sum(1 for r in w_records if r.get("late_minutes", 0) > 0 and r.get("entry_time"))

        schedule = w.get("schedules") or {}
        sh, sm = map(int, schedule.get("start_time", "09:00").split(":"))
        eh, em = map(int, schedule.get("end_time", "18:00").split(":"))
        daily_hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60
        total_hours = round(days_present * daily_hours)

        punctual_days = sum(1 for r in w_records if r.get("entry_time") and r.get("late_minutes", 0) == 0)
        punctuality_pct = round(punctual_days / working_days * 100) if working_days else 0

        stats.append(MonthlyWorkerStats(
            worker_id=w["id"],
            worker_name=w["name"],
            days_present=days_present,
            total_working_days=working_days,
            total_hours=total_hours,
            extra_hours=0,
            late_count=late_count,
            punctuality_pct=punctuality_pct,
        ))

    return stats


@router.post("/", response_model=AttendanceRecord, status_code=201)
async def create_record(record: AttendanceRecordCreate, db: Client = Depends(get_supabase)):
    data = record.model_dump()
    data["date"] = data["date"].isoformat()
    result = db.table("attendance").insert(data).execute()
    return result.data[0]


@router.patch("/{record_id}", response_model=AttendanceRecord)
async def update_record(record_id: str, updates: AttendanceRecordUpdate, db: Client = Depends(get_supabase)):
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = db.table("attendance").update(data).eq("id", record_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Record not found")
    return result.data[0]


# Called by ZKTeco integration layer
@router.post("/mark", response_model=AttendanceRecord, status_code=201)
async def mark_attendance(worker_id: str, db: Client = Depends(get_supabase)):
    from datetime import datetime
    now = datetime.now()
    today = now.date().isoformat()
    time_str = now.strftime("%H:%M")

    existing = db.table("attendance").select("*").eq("worker_id", worker_id).eq("date", today).execute().data
    if existing:
        record = existing[0]
        if not record.get("exit_time"):
            result = db.table("attendance").update({"exit_time": time_str}).eq("id", record["id"]).execute()
            return result.data[0]
        return record

    worker = db.table("workers").select("*, schedules(start_time)").eq("id", worker_id).single().execute().data
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    schedule_start = (worker.get("schedules") or {}).get("start_time", "09:00")
    sh, sm = map(int, schedule_start.split(":"))
    nh, nm = now.hour, now.minute
    late_minutes = max(0, (nh * 60 + nm) - (sh * 60 + sm))
    status = "late" if late_minutes > 0 else "punctual"

    result = db.table("attendance").insert({
        "worker_id": worker_id,
        "date": today,
        "entry_time": time_str,
        "status": status,
        "late_minutes": late_minutes,
    }).execute()
    return result.data[0]
