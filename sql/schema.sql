-- ============================================
-- RAQUETEERS BADMINTON TOURNAMENT - SQL SCHEMA
-- ============================================

-- 1. TEAMS TABLE
create table if not exists teams (
  id serial primary key,
  team_number int unique not null,
  player1 text not null,
  player2 text not null,
  group_name char(1) not null check (group_name in ('A', 'B'))
);

-- 2. MATCHES TABLE
create table if not exists matches (
  id serial primary key,
  match_number int unique not null,
  round text not null check (round in ('league', 'semi_final', 'final')),
  group_name char(1),
  team1_id int references teams(id),
  team2_id int references teams(id),
  court text not null,
  scheduled_time text not null,
  umpire text,
  line_umpire1 text,
  line_umpire2 text,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  winner_team_id int references teams(id),
  created_at timestamptz default now()
);

-- 3. SET SCORES TABLE
create table if not exists set_scores (
  id serial primary key,
  match_id int references matches(id) on delete cascade,
  set_number int not null check (set_number in (1, 2, 3)),
  team1_score int not null default 0,
  team2_score int not null default 0,
  unique(match_id, set_number)
);

-- Enable Row Level Security (allow all for this tournament app)
alter table teams enable row level security;
alter table matches enable row level security;
alter table set_scores enable row level security;

create policy "Allow all on teams" on teams for all using (true) with check (true);
create policy "Allow all on matches" on matches for all using (true) with check (true);
create policy "Allow all on set_scores" on set_scores for all using (true) with check (true);

-- Enable realtime for specific tables
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table set_scores;
