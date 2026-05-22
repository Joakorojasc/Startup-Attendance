from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_supabase
from models.schemas import Schedule, ScheduleCreate, ScheduleUpdate
from dependencies.auth import get_current_user

router = APIRouter(prefix="/schedules", tags=["schedules"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[Schedule])
def list_schedules(db: Client = Depends(get_supabase)):
    result = db.table("schedules").select("*").order("name").execute()
    return result.data


@router.get("/{schedule_id}", response_model=Schedule)
def get_schedule(schedule_id: str, db: Client = Depends(get_supabase)):
    result = db.table("schedules").select("*").eq("id", schedule_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return result.data


@router.post("/", response_model=Schedule, status_code=201)
def create_schedule(schedule: ScheduleCreate, db: Client = Depends(get_supabase)):
    result = db.table("schedules").insert(schedule.model_dump()).execute()
    return result.data[0]


@router.patch("/{schedule_id}", response_model=Schedule)
def update_schedule(schedule_id: str, updates: ScheduleUpdate, db: Client = Depends(get_supabase)):
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = db.table("schedules").update(data).eq("id", schedule_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return result.data[0]


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: str, db: Client = Depends(get_supabase)):
    workers = db.table("workers").select("id").eq("schedule_id", schedule_id).execute().data
    if workers:
        raise HTTPException(status_code=400, detail="Schedule has assigned workers — reassign them first")
    db.table("schedules").delete().eq("id", schedule_id).execute()
