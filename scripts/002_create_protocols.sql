-- Create protocols table for exercise programs
-- Therapists create protocols for athletes
create table if not exists public.protocols (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  exercises jsonb not null default '[]'::jsonb,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.protocols enable row level security;

-- Therapists can create, view, update, and delete their own protocols
create policy "Therapists can manage their protocols"
  on public.protocols for all
  using (auth.uid() = therapist_id);

-- Athletes can view protocols assigned to them
create policy "Athletes can view their protocols"
  on public.protocols for select
  using (auth.uid() = athlete_id);
