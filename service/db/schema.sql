-- ============================================================================
-- PulpLabs Learn — schema
--
-- Two decisions shape this file.
--
-- 1. Anything that is *queried* — slugs, titles, levels, relationships, topics
--    — is a column. Anything that is *authored prose* — a lesson body, a doc
--    page, a list of features — is JSONB. Normalising a block-structured
--    document into rows buys nothing here: it is always read whole, never
--    filtered on, and the shape is already validated by the renderer.
--
-- 2. `questions.correct` and `questions.explanation` live in this database and
--    are selected by exactly one code path — the grader. Every read route
--    projects the other columns explicitly. The boundary that used to be a
--    function (toCandidateExam) is now a column grant away from being
--    enforced by the database itself.
-- ============================================================================

create table if not exists settings (
  key   text  primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------- subjects --
create table if not exists technologies (
  slug          text primary key,
  name          text not null,
  category      text not null,
  level         text not null,
  tagline       text not null,
  what          text,
  why           text,
  outline       jsonb  not null default '[]',
  facts         jsonb  not null default '[]',
  prerequisites text[] not null default '{}',
  related       text[] not null default '{}',
  path_slugs    text[] not null default '{}',
  exam_slugs    text[] not null default '{}',
  project_slugs text[] not null default '{}',
  position      int    not null default 0
);

-- ------------------------------------------------------------------ courses --
create table if not exists paths (
  slug          text primary key,
  title         text not null,
  certification text,
  plate         text,
  eyebrow       text,
  summary       text not null,
  level         text not null,
  span          text,
  audience      text,
  prerequisites jsonb  not null default '[]',
  outcomes      jsonb  not null default '[]',
  covers        jsonb  not null default '[]',
  modules       jsonb  not null default '[]',
  skills        text[] not null default '{}',
  technologies  text[] not null default '{}',
  exam_slugs    text[] not null default '{}',
  project_slugs text[] not null default '{}',
  position      int    not null default 0
);

create table if not exists lessons (
  path_slug  text not null references paths(slug) on delete cascade,
  slug       text not null,
  title      text not null,
  summary    text not null,
  minutes    int  not null default 0,
  module     text,
  topics     text[] not null default '{}',
  objectives jsonb  not null default '[]',
  body       jsonb  not null default '[]',
  exercise   jsonb,
  related    jsonb  not null default '[]',
  position   int    not null default 0,
  primary key (path_slug, slug)
);

create index if not exists lessons_path_position_idx on lessons (path_slug, position);

-- ----------------------------------------------------------------- exams ----
create table if not exists exams (
  slug         text primary key,
  family       text not null default 'Foundations and practice',
  title        text not null,
  summary      text not null,
  level        text not null,
  minutes      int  not null default 0,
  passing      int  not null default 70,
  topics       text[] not null default '{}',
  technologies text[] not null default '{}',
  rules        jsonb  not null default '[]',
  topic_links  jsonb  not null default '{}',
  position     int    not null default 0
);

create table if not exists questions (
  exam_slug   text not null references exams(slug) on delete cascade,
  id          text not null,
  type        text not null default 'single',
  topic       text not null,
  difficulty  int  not null default 1,
  prompt      text not null,
  options     jsonb not null default '[]',
  -- Answer key. Read by the grader and by nothing else.
  correct     text[] not null default '{}',
  explanation text,
  position    int  not null default 0,
  primary key (exam_slug, id)
);

create index if not exists questions_exam_position_idx on questions (exam_slug, position);

-- --------------------------------------------------------------- projects ---
create table if not exists projects (
  slug         text primary key,
  name         text not null,
  tagline      text not null,
  category     text,
  status       text,
  repository   text,
  docs         text,
  description  text,
  problem      text,
  features     jsonb  not null default '[]',
  architecture jsonb  not null default '[]',
  learn        jsonb  not null default '[]',
  technologies text[] not null default '{}',
  exam_slugs   text[] not null default '{}',
  position     int    not null default 0
);

create table if not exists doc_sets (
  slug         text primary key,
  name         text not null,
  tagline      text not null,
  version      text,
  version_note text,
  repository   text,
  position     int not null default 0
);

create table if not exists doc_pages (
  set_slug    text not null references doc_sets(slug) on delete cascade,
  slug        text not null,
  title       text not null,
  summary     text,
  group_title text not null,
  body        jsonb not null default '[]',
  position    int   not null default 0,
  primary key (set_slug, slug)
);

create index if not exists doc_pages_set_position_idx on doc_pages (set_slug, position);

-- ------------------------------------------------------------------ field ---
create table if not exists field_entries (
  slug         text primary key,
  kind         text not null,
  title        text not null,
  client       text,
  logo         text,
  sector       text,
  summary      text not null,
  published    date,
  minutes      int  not null default 0,
  plate        text,
  video        jsonb,
  people       jsonb  not null default '[]',
  facts        jsonb  not null default '[]',
  quote        jsonb,
  body         jsonb  not null default '[]',
  learn        jsonb  not null default '[]',
  technologies text[] not null default '{}',
  position     int    not null default 0
);

-- --------------------------------------------------------------- articles ---
-- Writing about the stack. Same block model as lessons and documentation, so
-- it renders through the same component — but it is not a course: an article
-- makes one argument and ends.
create table if not exists articles (
  slug         text primary key,
  title        text not null,
  topic        text not null,
  summary      text not null,
  author       text,
  published    date,
  minutes      int  not null default 0,
  body         jsonb  not null default '[]',
  related      jsonb  not null default '[]',
  technologies text[] not null default '{}',
  position     int    not null default 0
);

create index if not exists articles_published_idx on articles (published desc);

-- ------------------------------------------------------------- accounts ----
-- Nothing in this table is stored in the clear except what has to be indexed.
--
-- `password_hash` is a scrypt digest, not ciphertext: a password we can
-- decrypt is a password an attacker can decrypt, so the one-way function is
-- the stronger choice and the only correct one.
--
-- Everything that identifies a person — email, name, avatar URL — is
-- AES-256-GCM ciphertext. Lookup still needs an equality key, so `email_index`
-- is a keyed HMAC of the lowercased address: it finds the row without the
-- table ever holding a readable address. Lose the key and the ciphertext is
-- noise, which is the intended failure mode.
create table if not exists users (
  id            uuid primary key,
  email_index   text not null unique,
  email_enc     text not null,
  name_enc      text,
  avatar_enc    text,
  password_hash text,
  provider      text not null default 'password',
  google_sub    text unique,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- ------------------------------------------------------------ playground ----
-- `spec` holds corpora, answer keys and grading rules. Like the exam answer
-- key above, it is selected by one code path — the demo runner — and never by
-- a read route. `preview` is the half a signed-out reader may see.
create table if not exists playground_demos (
  slug         text primary key,
  title        text not null,
  tagline      text not null,
  kind         text not null default 'Sandbox',
  engine       text not null,
  summary      text not null,
  minutes      int  not null default 0,
  brief        jsonb  not null default '[]',
  controls     jsonb  not null default '{}',
  learn        jsonb  not null default '[]',
  spec         jsonb  not null default '{}',
  technologies text[] not null default '{}',
  position     int    not null default 0
);

-- A demo instance: a lease on a demo, held by one account, with a deadline
-- and a run quota. Both are enforced in the service, not in the browser.
create table if not exists playground_sessions (
  id           uuid primary key,
  user_id      uuid not null references users(id) on delete cascade,
  demo_slug    text not null references playground_demos(slug) on delete cascade,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  last_used_at timestamptz,
  runs         int not null default 0
);

create index if not exists playground_sessions_user_idx on playground_sessions (user_id, demo_slug);
create index if not exists playground_sessions_expiry_idx on playground_sessions (expires_at);

-- ------------------------------------------------------------- attempts -----
-- Exam attempts were browser-local and stay that way by default. This table
-- exists so a graded attempt can be persisted when there is an account to
-- attach it to; nothing writes to it yet, and the UI does not claim it does.
create table if not exists attempts (
  id         uuid primary key,
  exam_slug  text not null references exams(slug) on delete cascade,
  answers    jsonb not null,
  result     jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------- later columns ---
-- `create table if not exists` does nothing to a table that already exists, so
-- anything added after the first release has to arrive as its own statement.
-- These are idempotent and run on every boot, like the rest of this file.
--
-- A client mark is shown unmodified on the ground it was drawn for, so the
-- ground travels with the file: the Urban Ethnographers wordmark is navy on
-- yellow and disappears on both of our themes without it.
alter table field_entries add column if not exists logo_ground text;
alter table field_entries add column if not exists logo_shape  text;

-- A demo that is announced but not built. `planned` rows render as a
-- coming-soon card and the service refuses to lease an instance for one, so
-- the state cannot be bypassed by typing the URL.
alter table playground_demos add column if not exists status text not null default 'live';
