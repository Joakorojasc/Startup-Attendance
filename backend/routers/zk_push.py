from fastapi import APIRouter, Request, Query, Depends
from fastapi.responses import PlainTextResponse
from supabase import Client
from database import get_supabase
from datetime import datetime

router = APIRouter(prefix="/iclock", tags=["zk-push"])


@router.get("/cdata", response_class=PlainTextResponse)
def zk_handshake(SN: str = Query(...)):
    """El dispositivo hace GET al arrancar para registrarse y obtener configuración."""
    return (
        f"GET OPTION FROM:{SN}\n"
        "ATTSTAte=None\n"
        "ErrorDelay=30\n"
        "Delay=10\n"
        "TransTimes=00:00;14:05\n"
        "TransInterval=1\n"
        "TransFlag=TransData AttLog\n"
        "Realtime=1\n"
        "Encrypt=None\n"
    )


@router.get("/getrequest", response_class=PlainTextResponse)
def zk_getrequest(SN: str = Query(...)):
    """El dispositivo consulta si el servidor tiene comandos pendientes."""
    return "OK"


@router.post("/cdata", response_class=PlainTextResponse)
async def zk_receive(
    request: Request,
    SN: str = Query(...),
    table: str = Query(default="ATTLOG"),
    db: Client = Depends(get_supabase),
):
    """El dispositivo envía marcajes. Formato por línea: USER_ID\\tDATETIME\\tSTATUS\\tVERIFY\\n
    STATUS: 0=entrada, 1=salida, 2=break-out, 3=break-in
    """
    body = await request.body()

    # Heartbeat de opciones — ignorar
    if table != "ATTLOG":
        return "OK"

    lines = body.decode("utf-8", errors="ignore").strip().splitlines()
    processed = 0
    errors = []

    for line in lines:
        parts = line.strip().split("\t")
        if len(parts) < 3:
            continue

        zk_uid_str, dt_str, status_str = parts[0], parts[1], parts[2]

        try:
            dt = datetime.strptime(dt_str.strip(), "%Y-%m-%d %H:%M:%S")
        except ValueError:
            errors.append(f"bad datetime: {dt_str}")
            continue

        status_code = int(status_str.strip())
        mark_type = "entry" if status_code == 0 else "exit"
        date_str = dt.date().isoformat()
        time_str = dt.strftime("%H:%M")

        # Buscar worker por zk_user_id
        res = (
            db.table("workers")
            .select("id, schedules(start_time)")
            .eq("zk_user_id", int(zk_uid_str))
            .eq("status", "active")
            .execute()
        )
        if not res.data:
            errors.append(f"unknown zk_user_id: {zk_uid_str}")
            continue

        worker = res.data[0]
        worker_id = worker["id"]

        existing = (
            db.table("attendance")
            .select("id, entry_time, exit_time")
            .eq("worker_id", worker_id)
            .eq("date", date_str)
            .execute()
        ).data

        if existing:
            record = existing[0]
            if mark_type == "entry":
                db.table("attendance").update({"entry_time": time_str}).eq("id", record["id"]).execute()
            elif mark_type == "exit" and not record.get("exit_time"):
                db.table("attendance").update({"exit_time": time_str}).eq("id", record["id"]).execute()
        else:
            if mark_type == "exit":
                errors.append(f"exit without entry: worker {worker_id} on {date_str}")
                continue

            schedule = (worker.get("schedules") or {})
            sh, sm = map(int, schedule.get("start_time", "09:00").split(":"))
            th, tm = map(int, time_str.split(":"))
            late_minutes = max(0, (th * 60 + tm) - (sh * 60 + sm))

            db.table("attendance").insert({
                "worker_id": worker_id,
                "date": date_str,
                "entry_time": time_str,
                "status": "late" if late_minutes > 0 else "punctual",
                "late_minutes": late_minutes,
            }).execute()

        processed += 1

    return f"OK: {processed} processed, {len(errors)} errors"
