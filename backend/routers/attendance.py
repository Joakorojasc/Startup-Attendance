from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_supabase
from models.schemas import AttendanceRecord, AttendanceRecordCreate, AttendanceRecordUpdate, AttendanceMarkRequest, DailyStats, MonthlyWorkerStats
from dependencies.auth import get_current_user
from datetime import date, datetime
from typing import Optional
import calendar
import random

router = APIRouter(prefix="/attendance", tags=["attendance"], dependencies=[Depends(get_current_user)])


@router.get("/today", response_model=list[AttendanceRecord])
def get_today(db: Client = Depends(get_supabase)):
    today = date.today().isoformat()
    result = db.table("attendance").select("*").eq("date", today).execute()
    return result.data


@router.get("/day/{date_str}", response_model=list[AttendanceRecord])
def get_day(date_str: str, db: Client = Depends(get_supabase)):
    result = db.table("attendance").select("*").eq("date", date_str).execute()
    return result.data


@router.get("/day/{date_str}/stats", response_model=DailyStats)
def get_day_stats(date_str: str, db: Client = Depends(get_supabase)):
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
def get_month_stats(year: int, month: int, db: Client = Depends(get_supabase)):
    _, last_day = calendar.monthrange(year, month)
    month_start = f"{year}-{month:02d}-01"
    month_end = f"{year}-{month:02d}-{last_day:02d}"
    records = db.table("attendance").select("*").gte("date", month_start).lte("date", month_end).execute().data
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


@router.get("/range")
def get_range(
    date_from: str,
    date_to: str,
    worker_id: Optional[str] = None,
    db: Client = Depends(get_supabase),
):
    query = db.table("attendance").select("*").gte("date", date_from).lte("date", date_to)
    if worker_id:
        query = query.eq("worker_id", worker_id)
    return query.order("date").execute().data


@router.post("/", response_model=AttendanceRecord, status_code=201)
def create_record(record: AttendanceRecordCreate, db: Client = Depends(get_supabase)):
    data = record.model_dump()
    data["date"] = data["date"].isoformat()
    result = db.table("attendance").insert(data).execute()
    return result.data[0]


@router.patch("/{record_id}", response_model=AttendanceRecord)
def update_record(record_id: str, updates: AttendanceRecordUpdate, db: Client = Depends(get_supabase)):
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = db.table("attendance").update(data).eq("id", record_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Record not found")
    return result.data[0]


# Called by ZKTeco integration layer and manual registration
@router.post("/mark", response_model=AttendanceRecord, status_code=201)
def mark_attendance(body: AttendanceMarkRequest, db: Client = Depends(get_supabase)):
    now = datetime.now()
    target_date = body.date or now.date().isoformat()
    time_str = body.time or now.strftime("%H:%M")

    existing = db.table("attendance").select("*").eq("worker_id", body.worker_id).eq("date", target_date).execute().data

    if existing:
        record = existing[0]
        if body.type == "entry":
            result = db.table("attendance").update({"entry_time": time_str}).eq("id", record["id"]).execute()
            return result.data[0]
        if body.type == "exit" or (body.type == "auto" and not record.get("exit_time")):
            result = db.table("attendance").update({"exit_time": time_str}).eq("id", record["id"]).execute()
            return result.data[0]
        return record

    if body.type == "exit":
        raise HTTPException(status_code=400, detail="No hay registro de entrada para este trabajador en esta fecha")

    worker = db.table("workers").select("*, schedules(start_time)").eq("id", body.worker_id).single().execute().data
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    schedule_start = (worker.get("schedules") or {}).get("start_time", "09:00")
    sh, sm = map(int, schedule_start.split(":"))
    th, tm = map(int, time_str.split(":"))
    late_minutes = max(0, (th * 60 + tm) - (sh * 60 + sm))
    status = "late" if late_minutes > 0 else "punctual"

    result = db.table("attendance").insert({
        "worker_id": body.worker_id,
        "date": target_date,
        "entry_time": time_str,
        "status": status,
        "late_minutes": late_minutes,
    }).execute()
    return result.data[0]


@router.post("/simulate-day", status_code=201)
def simulate_day(date_str: Optional[str] = None, db: Client = Depends(get_supabase)):
    target_date = date_str or date.today().isoformat()
    workers = db.table("workers").select("*, schedules(start_time, end_time)").eq("status", "active").execute().data
    existing_ids = {r["worker_id"] for r in db.table("attendance").select("worker_id").eq("date", target_date).execute().data}

    created = []
    for w in workers:
        if w["id"] in existing_ids:
            continue
        schedule = w.get("schedules") or {}
        sh, sm = map(int, schedule.get("start_time", "09:00").split(":"))
        eh, em = map(int, schedule.get("end_time", "18:00").split(":"))

        entry_offset = random.choices([-5, -3, 0, 5, 10, 15, 20], weights=[5, 10, 30, 20, 15, 10, 10])[0]
        entry_total = sh * 60 + sm + entry_offset
        entry_h, entry_m = divmod(max(0, entry_total), 60)
        entry_str = f"{entry_h:02d}:{entry_m:02d}"
        late_minutes = max(0, entry_offset)

        exit_total = eh * 60 + em + random.randint(-5, 15)
        exit_h, exit_m = divmod(max(0, exit_total), 60)
        exit_str = f"{exit_h:02d}:{exit_m:02d}"

        result = db.table("attendance").insert({
            "worker_id": w["id"],
            "date": target_date,
            "entry_time": entry_str,
            "exit_time": exit_str,
            "status": "late" if late_minutes > 0 else "punctual",
            "late_minutes": late_minutes,
        }).execute()
        created.extend(result.data)

    return created
