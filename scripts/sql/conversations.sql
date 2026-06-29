-- クリチBot 会話記憶テーブル（Phase A）
-- LINE user_id ごとの「要約情報」のみ保存（生ログは chat_logs 側）
--
-- Supabase Dashboard → SQL Editor → 貼り付けて Run
-- 警告「RLS有効化」が出たら「Run and enable RLS」推奨（service_role は bypass）

create table if not exists line_conversations (
  user_id text primary key,                       -- LINE userId（U....）
  user_type text default '不明',                  -- 一般客 / 法人 / メディア / イベント関係者 / 不明
  name text,
  company text,
  email text,
  phone text,
  interest text,                                   -- 購入 / 卸し / 取材 / コラボ / イベント出店 / その他
  last_topic text,
  requested_quantity text,
  desired_date text,
  location text,
  preferred_contact text,                          -- LINE / メール / 電話
  important_notes jsonb default '[]'::jsonb,       -- 担当者が見るべき重要メモ
  handoff_required boolean default false,
  handoff_category text,                           -- 卸し相談 / 取材依頼 / コラボ / etc
  handoff_priority text,                           -- high / medium / low
  last_summary text,                               -- 直近の問い合わせ要約（1〜3文）
  message_count integer default 0,
  first_contacted_at timestamptz default now(),
  last_contacted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists line_conversations_handoff_idx
  on line_conversations(handoff_required, last_contacted_at desc);
create index if not exists line_conversations_type_idx
  on line_conversations(user_type);
