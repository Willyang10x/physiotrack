-- Create daily feedback table
-- Athletes submit daily feedback on pain, fatigue, and mobility
create table if not exists public.daily_feedback (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  protocol_id uuid not null references public.protocols(id) on delete cascade,
  date date not null,
  pain_level integer not null check (pain_level >= 0 and pain_level <= 10),
  fatigue_level integer not null check (fatigue_level >= 0 and fatigue_level <= 10),
  mobility_range integer not null check (mobility_range >= 0 and mobility_range <= 100),
  notes text,
  exercises_completed jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(athlete_id, protocol_id, date)
);

-- Enable RLS
alter table public.daily_feedback enable row level security;

-- Athletes can create, view, update their own feedback
create policy "Athletes can manage their feedback"
  on public.daily_feedback for all
  using (auth.uid() = athlete_id);

-- Therapists can view feedback from athletes assigned to their protocols
create policy "Therapists can view athlete feedback"
  on public.daily_feedback for select
  using (
    exists (
      select 1 from public.protocols
      where protocols.id = daily_feedback.protocol_id
      and protocols.therapist_id = auth.uid()
    )
  );
