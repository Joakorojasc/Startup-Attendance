-- AsistenTrack — Supabase schema
-- Run this in the Supabase SQL Editor

-- ── Schedules ─────────────────────────────────────────────────────────────

create table if not exists schedules (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  start_time text not null,   -- "HH:MM"
  end_time   text not null,   -- "HH:MM"
  work_days  integer[] not null default '{1,2,3,4,5}',
  created_at timestamptz default now()
);

-- ── Workers ───────────────────────────────────────────────────────────────

create table if not exists workers (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  role                    text not null,
  phone                   text,
  schedule_id             uuid references schedules(id),
  fingerprint_registered  boolean default false,
  status                  text not null default 'active' check (status in ('active', 'inactive')),
  avatar_color            text default '#6366f1',
  created_at              timestamptz default now()
);

create index if not exists workers_status_idx on workers(status);
create index if not exists workers_schedule_idx on workers(schedule_id);

-- ── Attendance records ────────────────────────────────────────────────────

create table if not exists attendance (
  id           uuid primary key default gen_random_uuid(),
  worker_id    uuid not null references workers(id) on delete cascade,
  date         date not null,
  entry_time   text,   -- "HH:MM" or null
  exit_time    text,   -- "HH:MM" or null
  status       text not null default 'absent'
               check (status in ('punctual', 'late', 'absent', 'day_off', 'in_progress')),
  late_minutes integer not null default 0,
  created_at   timestamptz default now(),
  unique(worker_id, date)
);

create index if not exists attendance_date_idx on attendance(date);
create index if not exists attendance_worker_date_idx on attendance(worker_id, date);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Enable RLS (service role key bypasses it — use for backend)

alter table schedules enable row level security;
alter table workers    enable row level security;
alter table attendance enable row level security;

-- Allow full access for authenticated users (admins)
create policy "Authenticated full access" on schedules
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access" on workers
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access" on attendance
  for all using (auth.role() = 'authenticated');

-- ── Seed data ─────────────────────────────────────────────────────────────

insert into schedules (id, name, start_time, end_time, work_days) values
  ('11111111-1111-1111-1111-111111111111', 'Estándar',     '09:00', '18:00', '{1,2,3,4,5}'),
  ('22222222-2222-2222-2222-222222222222', 'Turno Tarde',  '13:00', '22:00', '{1,2,3,4,5}'),
  ('33333333-3333-3333-3333-333333333333', 'Medio Tiempo', '09:00', '13:00', '{1,2,3,4,5}')
on conflict do nothing;