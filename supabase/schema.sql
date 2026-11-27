-- GreenAura online layer for Supabase (free plan). Run this whole file once in the SQL editor.
-- Rules are enforced here, on the server, so an edited phone cannot grant itself points.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  locality text not null default '' check (char_length(locality) <= 80),
  household int not null default 3 check (household between 1 and 500),
  land_acres numeric not null default 0 check (land_acres between 0 and 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.deed_rules (
  deed_id text primary key, cat text not null, points int not null,
  min_amount numeric not null, max_amount numeric, per_person boolean not null default false,
  whole_only boolean not null default false, once_only boolean not null default false,
  by_land boolean not null default false, is_penalty boolean not null default false
);

create table if not exists public.deed_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deed_id text not null references public.deed_rules(deed_id),
  cat text not null, log_date date not null, amount numeric not null,
  points int not null, created_at timestamptz not null default now(),
  unique (user_id, deed_id, log_date)               -- one entry per deed per day
);
create index if not exists deed_logs_user_idx on public.deed_logs(user_id, log_date);

create table if not exists public.groups (
  code text primary key check (code ~ '^[A-Z0-9-]{4,24}$'),
  name text not null, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_code text references public.groups(code) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(), primary key (group_code, user_id)
);

-- Nobody reads or writes tables directly from the app; everything goes through the functions below.
alter table public.profiles enable row level security;
alter table public.deed_rules enable row level security;
alter table public.deed_logs enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "own logs" on public.deed_logs for select using (user_id = auth.uid());
create policy "rules readable" on public.deed_rules for select using (true);
create policy "groups readable" on public.groups for select using (true);
create policy "own memberships" on public.group_members for select using (user_id = auth.uid());
-- (no insert/update/delete policies: writes only through security definer functions)

insert into public.deed_rules(deed_id,cat,points,min_amount,max_amount,per_person,whole_only,once_only,by_land,is_penalty) values
('c1','carbon',15,1,60,false,false,false,false,false),
('c2','carbon',15,3,150,false,false,false,false,false),
('c3','carbon',25,3,150,false,false,false,false,false),
('c4','carbon',15,1,24,true,false,false,false,false),
('c5','carbon',15,1,6,true,true,false,false,false),
('c6','carbon',50,1,20,false,true,false,false,false),
('c7','carbon',50,1,30,true,false,false,false,false),
('c8','carbon',100,1,1,false,true,true,false,false),
('w1','water',15,10,150,true,false,false,false,false),
('w2','water',25,1,5,false,true,false,false,false),
('w3','water',15,10,200,true,false,false,false,false),
('w4','water',50,20,3000,false,false,false,false,false),
('w5','water',15,1,10,true,true,false,false,false),
('w6','water',25,1,3,true,true,false,false,false),
('w7','water',50,1,3,false,true,false,false,false),
('w8','water',100,1,1,false,true,true,false,false),
('f1','food',15,1,5,true,true,false,false,false),
('f2','food',15,1,1,false,true,false,false,false),
('f3','food',25,0.5,10,true,false,false,false,false),
('f4','food',50,1,100,false,false,false,false,false),
('f5','food',15,1,5,true,true,false,false,false),
('f6','food',25,1,3,true,true,false,false,false),
('f7','food',100,1,2,false,true,false,false,false),
('f8','food',100,1,1,false,true,true,false,false),
('r1','farm',25,0.1,null,false,false,false,true,false),
('r2','farm',25,0.1,null,false,false,false,true,false),
('r3','farm',50,0.1,null,false,false,false,true,false),
('r4','farm',25,5,1000,false,false,false,false,false),
('r5','farm',50,0.1,null,false,false,false,true,false),
('r6','farm',15,1,10,false,true,false,false,false),
('r7','farm',50,1,200,false,true,false,false,false),
('r8','farm',100,1,1,false,true,true,false,false)
on conflict (deed_id) do update set cat=excluded.cat, points=excluded.points, min_amount=excluded.min_amount, max_amount=excluded.max_amount, per_person=excluded.per_person, whole_only=excluded.whole_only, once_only=excluded.once_only, by_land=excluded.by_land, is_penalty=excluded.is_penalty;

create or replace function public.save_profile(p_name text, p_locality text, p_household int, p_land numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  if p_household is null or p_household < 1 or p_household > 500 then raise exception 'Household size must be a whole number from 1 to 500.'; end if;
  if p_land < 0 or p_land > 5000 then raise exception 'Land size must be between 0 and 5000 acres.'; end if;
  insert into profiles(id, name, locality, household, land_acres)
  values (auth.uid(), left(trim(p_name), 60), left(coalesce(p_locality,''), 80), p_household, coalesce(p_land,0))
  on conflict (id) do update set name = excluded.name, locality = excluded.locality,
    household = excluded.household, land_acres = excluded.land_acres;
end $$;

-- Saves one deed after checking every rule. Returns the points actually granted.
create or replace function public.log_deed(p_deed text, p_amount numeric, p_date date)
returns int language plpgsql security definer set search_path = public as $$
declare
  r deed_rules; p profiles; mx numeric; used int; room int; pts int;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  select * into p from profiles where id = auth.uid();
  if not found then raise exception 'Finish setting up your profile first.'; end if;
  select * into r from deed_rules where deed_id = p_deed;
  if not found then raise exception 'Unknown deed.'; end if;
  if r.is_penalty then raise exception 'This is not a loggable deed.'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter an amount.'; end if;
  if p_amount < r.min_amount then raise exception 'The minimum for this deed is %.', r.min_amount; end if;
  if r.whole_only and p_amount <> floor(p_amount) then raise exception 'Use a whole number.'; end if;
  if r.by_land then
    if p.land_acres <= 0 then raise exception 'Add your land size first.'; end if;
    mx := p.land_acres;
  elsif r.per_person then mx := r.max_amount * p.household;
  else mx := r.max_amount; end if;
  if mx is not null and p_amount > mx then raise exception 'That is more than one day can realistically hold (most: %).', mx; end if;
  if p_date is null or p_date > current_date + 1 then raise exception 'The date cannot be in the future.'; end if;
  if p_date < current_date - 8 then raise exception 'You can log up to 7 days back.'; end if;
  if r.once_only and exists (select 1 from deed_logs where user_id = auth.uid() and deed_id = p_deed) then
    raise exception 'This one-time deed has already been counted.'; end if;
  if exists (select 1 from deed_logs where user_id = auth.uid() and deed_id = p_deed and log_date = p_date) then
    raise exception 'You already logged this deed for that day.'; end if;
  select coalesce(sum(points),0) into used from deed_logs where user_id = auth.uid() and cat = r.cat and log_date = p_date;
  room := 200 - used;
  if room <= 0 then raise exception 'Daily limit reached for this area. Come back tomorrow.'; end if;
  pts := least(r.points, room);
  insert into deed_logs(user_id, deed_id, cat, log_date, amount, points) values (auth.uid(), p_deed, r.cat, p_date, p_amount, pts);
  return pts;
end $$;

create or replace function public.delete_deed(p_deed text, p_date date)
returns void language sql security definer set search_path = public as $$
  delete from deed_logs where user_id = auth.uid() and deed_id = p_deed and log_date = p_date;
$$;

create or replace function public.my_score()
returns int language sql security definer stable set search_path = public as $$
  select least(7000, 2000 + coalesce(sum(points),0))::int from deed_logs where user_id = auth.uid();
$$;

create or replace function public.join_group(p_code text, p_name text default null)
returns text language plpgsql security definer set search_path = public as $$
declare c text := upper(trim(p_code)); g groups;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  select * into g from groups where code = c;
  if not found then
    if p_name is null or length(trim(p_name)) = 0 then raise exception 'No group with this code.'; end if;
    insert into groups(code, name, created_by) values (c, left(trim(p_name), 60), auth.uid()) returning * into g;
  end if;
  insert into group_members(group_code, user_id) values (c, auth.uid()) on conflict do nothing;
  return g.name;
end $$;

create or replace function public.leave_group(p_code text)
returns void language sql security definer set search_path = public as $$
  delete from group_members where group_code = upper(trim(p_code)) and user_id = auth.uid();
$$;

-- Leaderboard for one group: members see first names and scores only, never phone numbers.
create or replace function public.group_board(p_code text)
returns table(name text, score int, me boolean) language plpgsql security definer stable set search_path = public as $$
begin
  if not exists (select 1 from group_members where group_code = upper(trim(p_code)) and user_id = auth.uid()) then
    raise exception 'Join this group first.'; end if;
  return query
    select split_part(p.name,' ',1), least(7000, 2000 + coalesce((select sum(l.points) from deed_logs l where l.user_id = p.id),0))::int, (p.id = auth.uid())
    from group_members m join profiles p on p.id = m.user_id
    where m.group_code = upper(trim(p_code))
    order by 2 desc limit 100;
end $$;

grant execute on function public.save_profile, public.log_deed, public.delete_deed, public.my_score,
  public.join_group, public.leave_group, public.group_board to authenticated;
revoke execute on function public.save_profile, public.log_deed, public.delete_deed, public.my_score,
  public.join_group, public.leave_group, public.group_board from anon, public;
