alter table public.invites
  add column if not exists sender_token_hash text;

alter table public.invites
  add column if not exists recipient_message text;

alter table public.invites
  add column if not exists recipient_message_sent_at timestamptz;

create unique index if not exists invites_sender_token_hash_idx
  on public.invites (sender_token_hash)
  where sender_token_hash is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invites_recipient_message_length_chk'
  ) then
    alter table public.invites
      add constraint invites_recipient_message_length_chk
      check (
        recipient_message is null
        or char_length(recipient_message) <= 300
      );
  end if;
end $$;
