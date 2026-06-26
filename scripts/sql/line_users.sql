-- LINE Bot ホワイトリスト管理テーブル
-- 「認証された人だけが質問できる」を実現する。
--
-- 友だち追加だけでは質問できず、合言葉（AMZ2026 等）を送って初めて
-- is_verified=true で登録される。以降は通常通り質問可。
--
-- 適用方法：
--   Supabase ダッシュボード → SQL Editor → 下記を貼り付け → Run
--   または psql で接続して実行

create table if not exists line_users (
  line_user_id   text primary key,
  display_name   text,
  is_verified    boolean default false,
  verified_at    timestamptz,
  shop_code      text,
  created_at     timestamptz default now(),
  blocked        boolean default false,
  blocked_reason text,
  last_seen_at   timestamptz default now()
);

create index if not exists line_users_verified_idx on line_users(is_verified);
create index if not exists line_users_blocked_idx on line_users(blocked);

-- RLS（PostgRESTを使うなら必須・service_role keyならbypassされる）
-- 必要なら下記を有効化
-- alter table line_users enable row level security;
