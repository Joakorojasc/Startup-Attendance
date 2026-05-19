from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_supabase
from models.schemas import Worker, WorkerCreate, WorkerUpdate

router = APIRouter(prefix="/workers", tags=["workers"])


@router.get("/", response_model=list[Worker])
async def list_workers(status: str | None = None, db: Client = Depends(get_supabase)):
    query = db.table("workers").select("*")
    if status:
        query = query.eq("status", status)
    result = query.order("name").execute()
    return result.data


@router.get("/{worker_id}", response_model=Worker)
async def get_worker(worker_id: str, db: Client = Depends(get_supabase)):
    result = db.table("workers").select("*").eq("id", worker_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result.data


@router.post("/", response_model=Worker, status_code=201)
async def create_worker(worker: WorkerCreate, db: Client = Depends(get_supabase)):
    result = db.table("workers").insert(worker.model_dump()).execute()
    return result.data[0]


@router.patch("/{worker_id}", response_model=Worker)
async def update_worker(worker_id: str, updates: WorkerUpdate, db: Client = Depends(get_supabase)):
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = db.table("workers").update(data).eq("id", worker_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result.data[0]


@router.delete("/{worker_id}", status_code=204)
async def deactivate_worker(worker_id: str, db: Client = Depends(get_supabase)):
    db.table("workers").update({"status": "inactive"}).eq("id", worker_id).execute()
