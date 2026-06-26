-- クリチ Inquiry AI 用 Supabase テーブル
-- Supabase Dashboard → SQL Editor → これを貼り付けて Run

-- 1. リード保存テーブル
create table if not exists leads (
  id bigserial primary key,
  name text not null,
  company text,
  email text not null,
  phone text,
  type text,
  message text not null,
  created_at timestamptz default now()
);
create index if not exists leads_created_idx on leads(created_at desc);

-- 2. チャットログ（ラ・ヴィーチェと共用なら既存。新規ならこれ）
create table if not exists chat_logs (
  id bigserial primary key,
  user_id text,
  user_name text,
  user_source text,         -- "kurichi-line" / "kurichi-line/escalate"
  question text not null,
  answer_preview text,
  citation text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cache_creation_tokens integer default 0,
  cache_read_tokens integer default 0,
  duration_ms integer default 0,
  rate_limited boolean default false,
  filtered boolean default false,
  filter_label text,
  created_at timestamptz default now()
);
create index if not exists chat_logs_created_idx on chat_logs(created_at desc);
create index if not exists chat_logs_source_idx on chat_logs(user_source);
