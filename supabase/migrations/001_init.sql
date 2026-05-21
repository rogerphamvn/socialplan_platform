-- Socialplan Platform — initial schema
-- Apply: paste vào Supabase Dashboard → SQL Editor → Run
--
-- Tables:
--   1. projects             — brands được quản lý
--   2. agents / skills      — registry của các agent/skill (KG nodes)
--   3. generations          — mỗi lần chạy agent log vào đây (KG node type=Generation)
--   4. kg_edges             — quan hệ giữa các node
--   5. content_items        — bài đăng / video / poster (sau khi migrate khỏi mock.ts)
--   6. campaigns            — chiến dịch marketing
--
-- RLS được bật, chỉ service-role mới ghi/đọc full được.

create extension if not exists "pgcrypto";

------------------------------------------------------------------
-- 1. Projects
------------------------------------------------------------------
create table if not exists projects (
  id            text primary key,
  name          text not null,
  brand         text not null,
  mcp_endpoint  text,
  description   text,
  created_at    timestamptz default now()
);

------------------------------------------------------------------
-- 2. Agents + Skills
------------------------------------------------------------------
create table if not exists agents (
  id            text primary key,
  name          text not null,
  department    text,
  tier          text default 'staff',
  level         int default 1,
  description   text,
  default_model text,
  created_at    timestamptz default now()
);

create table if not exists skills (
  id          text primary key,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

------------------------------------------------------------------
-- 3. Generations (KG node + agent execution log)
------------------------------------------------------------------
create table if not exists generations (
  id            text primary key,             -- run_<ts>_<rand>
  agent_id      text references agents(id),
  project_id    text references projects(id),
  model         text not null,
  topic         text,                          -- truncated input
  ok            boolean not null,
  error         text,
  payload       jsonb,                         -- the full data response
  prompt_tokens int,
  completion_tokens int,
  started_at    timestamptz not null,
  finished_at   timestamptz not null,
  created_at    timestamptz default now()
);

create index if not exists idx_generations_agent on generations(agent_id);
create index if not exists idx_generations_project on generations(project_id);
create index if not exists idx_generations_started on generations(started_at desc);

------------------------------------------------------------------
-- 4. KG edges
------------------------------------------------------------------
create table if not exists kg_edges (
  id          uuid primary key default gen_random_uuid(),
  from_node   text not null,
  to_node     text not null,
  edge_type   text not null,                  -- CALLS / HAS_SKILL / PRODUCES / USES_MODEL ...
  properties  jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_kg_edges_from on kg_edges(from_node);
create index if not exists idx_kg_edges_to on kg_edges(to_node);
create index if not exists idx_kg_edges_type on kg_edges(edge_type);

------------------------------------------------------------------
-- 5. Content items (replace mock.ts later)
------------------------------------------------------------------
create table if not exists content_items (
  id            text primary key,
  project_id    text references projects(id),
  title         text not null,
  description   text,
  kind          text not null,                 -- post|reel|story|poster|video
  platform      text not null,                 -- facebook|instagram|tiktok|youtube|shorts
  status        text not null,                 -- scheduled|published|pending_review|draft
  scheduled_at  timestamptz,
  image_url     text,
  duration_sec  int,
  generation_id text references generations(id),  -- link back to AI generation
  created_at    timestamptz default now()
);

create index if not exists idx_content_items_project on content_items(project_id);
create index if not exists idx_content_items_scheduled on content_items(scheduled_at);

------------------------------------------------------------------
-- 6. Campaigns
------------------------------------------------------------------
create table if not exists campaigns (
  id            text primary key,
  slug          text unique not null,
  project_id    text references projects(id),
  name          text not null,
  status        text default 'draft',          -- running|draft|ended
  start_date    date,
  end_date      date,
  budget        bigint default 0,
  spent         bigint default 0,
  cover_url     text,
  owner_name    text,
  goal          text,
  allocation    jsonb default '[]'::jsonb,
  metrics       jsonb default '{}'::jsonb,
  deltas        jsonb default '{}'::jsonb,
  timeline      jsonb default '[]'::jsonb,
  created_at    timestamptz default now()
);

------------------------------------------------------------------
-- Seed initial agents
------------------------------------------------------------------
insert into agents (id, name, department, tier, level, description, default_model) values
  ('marketing-creative-director', 'Creative Director', 'marketing', 'staff', 5, 'Brand DNA + Big Idea + IMC + Hormozi transformation', 'openai/gpt-5'),
  ('content-creator',             'Content Creator',    'marketing', 'staff', 4, 'Multi-format content pack',                          'openai/gpt-5'),
  ('brand-storyboard-generator',  'Storyboard Generator','marketing','staff', 5, 'Story arc + per-scene visual brief',                 'openai/gpt-5'),
  ('storyboard-to-video-prompt',  'Video Prompt Compiler','marketing','staff',5, 'Mega prompts for Sora/Veo3/Higgsfield/Kling',        'openai/gpt-5')
on conflict (id) do nothing;

insert into skills (id, name, description) values
  ('skill-content-pack',      'Multi-format content pack',                'post + carousel + ad + email + hashtag'),
  ('skill-brand-dna',         'Brand DNA framework',                      'Foundation + Personality + Voice'),
  ('skill-storyboard-arc',    'Story arc + scene briefs',                 'Brand-locked, anti-drift'),
  ('skill-video-mega-prompt', 'Mega prompt for Sora/Veo3/Higgsfield',     'Anti-slop, audio-grounded')
on conflict (id) do nothing;

insert into projects (id, name, brand, mcp_endpoint, description) values
  ('aniki',  'Aniki Japanese Restaurant', 'Aniki',  'https://aniki.com/api/mcp',  'Chuỗi nhà hàng Nhật Bản đậm vị, mở rộng tại TP. HCM'),
  ('tinhmo', 'Tinh Mơ Skincare',          'Tinh Mơ','https://tinhmo.com/api/mcp', 'Thương hiệu skincare clean-beauty Việt Nam')
on conflict (id) do nothing;

------------------------------------------------------------------
-- Row Level Security
------------------------------------------------------------------
alter table projects        enable row level security;
alter table agents          enable row level security;
alter table skills          enable row level security;
alter table generations     enable row level security;
alter table kg_edges        enable row level security;
alter table content_items   enable row level security;
alter table campaigns       enable row level security;

-- Default: only service-role can read/write (Next.js server-side uses service-role key)
-- Add anon read-only policies if you want public read on some tables.
