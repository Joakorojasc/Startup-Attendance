from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time
from enum import Enum


class WorkerStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class AttendanceStatus(str, Enum):
    punctual = "punctual"
    late = "late"
    absent = "absent"
    day_off = "day_off"
    in_progress = "in_progress"


# ── Schedules ────────────────────────────────────────────────────────────────

class ScheduleBase(BaseModel):
    name: str
    start_time: str  # "HH:MM"
    end_time: str    # "HH:MM"
    work_days: List[int]  # 0=Sun .. 6=Sat


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    work_days: Optional[List[int]] = None


class Schedule(ScheduleBase):
    id: str

    class Config:
        from_attributes = True


# ── Workers ──────────────────────────────────────────────────────────────────

class WorkerBase(BaseModel):
    name: str
    role: str
    phone: str
    schedule_id: str
    fingerprint_registered: bool = False
    status: WorkerStatus = WorkerStatus.active
    avatar_color: str = "#6366f1"


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    schedule_id: Optional[str] = None
    fingerprint_registered: Optional[bool] = None
    status: Optional[WorkerStatus] = None
    avatar_color: Optional[str] = None


class Worker(WorkerBase):
    id: str

    class Config:
        from_attributes = True


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceRecordBase(BaseModel):
    worker_id: str
    date: date
    entry_time: Optional[str] = None
    exit_time: Optional[str] = None
    status: AttendanceStatus = AttendanceStatus.absent
    late_minutes: int = 0


class AttendanceRecordCreate(AttendanceRecordBase):
    pass


class AttendanceRecordUpdate(BaseModel):
    exit_time: Optional[str] = None
    status: Optional[AttendanceStatus] = None
    late_minutes: Optional[int] = None


class AttendanceRecord(AttendanceRecordBase):
    id: str

    class Config:
        from_attributes = True


# ── Aggregates ────────────────────────────────────────────────────────────────

class DailyStats(BaseModel):
    date: date
    present: int
    late: int
    absent: int
    total_workers: int
    avg_hours: float


class MonthlyWorkerStats(BaseModel):
    worker_id: str
    worker_name: str
    days_present: int
    total_working_days: int
    total_hours: int
    extra_hours: int
    late_count: int
    punctuality_pct: int
