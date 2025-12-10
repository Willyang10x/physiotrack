-- Create messages table for chat
-- Therapists and athletes can communicate
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  protocol_id uuid references public.protocols(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Users can view messages they sent or received
create policy "Users can view their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can send messages
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Users can update read status of messages they received
create policy "Users can update received messages"
  on public.messages for update
  using (auth.uid() = receiver_id);
