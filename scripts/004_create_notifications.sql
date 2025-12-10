-- Create notifications table
-- System sends notifications for exercise reminders and messages
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('exercise_reminder', 'message', 'protocol_update')),
  title text not null,
  message text not null,
  read boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can view and update their own notifications
create policy "Users can view their notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- System can insert notifications (using service role)
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);
