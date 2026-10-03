-- AP Study: 学習データ同期用のテーブル
-- Supabase の SQL Editor に貼り付けて一度だけ実行する。
--
-- 利用者 1 人につき 1 行。学習データ(解答履歴・ブックマーク・メモ)を JSON で丸ごと保存し、
-- 端末側でレコード単位にマージしてから書き戻す(src/lib/sync.ts)。

create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 行レベルセキュリティ: ログインした本人の行だけを読み書きできる
alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 「新しいテーブルを自動で公開しない」設定にしているので、ログイン済みの利用者にだけ明示的に権限を与える
revoke all on public.user_data from anon;
grant select, insert, update on public.user_data to authenticated;
