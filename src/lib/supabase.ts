import type { SupabaseClient } from '@supabase/supabase-js';
import type { RemoteStore } from './sync';
import type { UserData } from './userData';

/**
 * Supabase の接続先。どちらもブラウザに埋め込む前提の公開情報。
 * データは行レベルセキュリティ(supabase/schema.sql)で本人以外が読み書きできないようにしている。
 * 別のプロジェクトに向けたいときは .env.local に VITE_SUPABASE_URL / VITE_SUPABASE_KEY を書く。
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://mzbsayzlkydkhucqqmql.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_DTj_5ROaG2kxu5jj4p1vcg_KAlh8-p-';

let clientPromise: Promise<SupabaseClient> | null = null;

/** Supabase のライブラリは大きいので、初めて使うときに読み込む */
export function getSupabase(): Promise<SupabaseClient> {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // ハッシュ方式のルーティングと衝突しないよう、ログインリンクの戻り先にはクエリ(?code=)を使う方式にする
        flowType: 'pkce',
      },
    }),
  );
  return clientPromise;
}

/** ログイン中の利用者の行を読み書きする RemoteStore */
export function userDataStore(client: SupabaseClient, userId: string): RemoteStore {
  return {
    fetch: async () => {
      const { data, error } = await client.from('user_data').select('data').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data ? (data.data as unknown) : null;
    },
    save: async (userData: UserData) => {
      const { error } = await client
        .from('user_data')
        .upsert({ user_id: userId, data: userData, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
  };
}
