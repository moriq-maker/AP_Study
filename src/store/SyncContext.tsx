import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase, SUPABASE_URL, userDataStore } from '../lib/supabase';
import { syncOnce } from '../lib/sync';
import { canonicalJson } from '../lib/userData';
import { useUserData } from './UserDataContext';

export type SyncStatus = 'checking' | 'signed-out' | 'syncing' | 'synced' | 'error';

interface Account {
  userId: string;
  email: string;
}

interface SyncApi {
  status: SyncStatus;
  account: Account | null;
  lastSyncedAt: Date | null;
  error: string | null;
  /** ログイン用のコード(とリンク)をメールで送る */
  sendCode: (email: string) => Promise<void>;
  /** メールで届いたコードでログインする */
  verifyCode: (email: string, code: string) => Promise<void>;
  syncNow: () => Promise<void>;
  /** 同期してからログアウトし、この端末の学習データを消す */
  signOut: () => Promise<void>;
}

const SyncContext = createContext<SyncApi | null>(null);

/** 手元の変更をサーバに送るまでの待ち時間(連続して解いている間はまとめて送る) */
const SYNC_DELAY_MS = 2000;

/** ログイン状態が保存されているか、ログインリンクから戻ってきた直後か */
function mayHaveSession(): boolean {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    return localStorage.getItem(`sb-${ref}-auth-token`) !== null || new URLSearchParams(location.search).has('code');
  } catch {
    return false;
  }
}

function message(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return String(e);
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { data, mergeFrom, reset } = useUserData();
  const [status, setStatus] = useState<SyncStatus>(() => (mayHaveSession() ? 'checking' : 'signed-out'));
  const [account, setAccount] = useState<Account | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<SupabaseClient | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const syncedJsonRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const pendingRef = useRef(false);

  const runSync = useCallback(async (): Promise<void> => {
    const client = clientRef.current;
    if (!client || !account) return;
    // 同期中に呼ばれたら、終わってからもう一度だけ実行する
    if (inFlightRef.current) {
      pendingRef.current = true;
      return inFlightRef.current;
    }
    const task = (async () => {
      setStatus('syncing');
      try {
        const { merged } = await syncOnce(dataRef.current, userDataStore(client, account.userId));
        syncedJsonRef.current = canonicalJson(merged);
        mergeFrom(merged);
        setLastSyncedAt(new Date());
        setError(null);
        setStatus('synced');
      } catch (e) {
        setError(message(e));
        setStatus('error');
      }
    })();
    inFlightRef.current = task;
    await task;
    inFlightRef.current = null;
    if (pendingRef.current) {
      pendingRef.current = false;
      await runSync();
    }
  }, [account, mergeFrom]);

  /** Supabase を読み込み、ログイン状態の変化を購読する(アプリの起動中に一度だけ) */
  const ensureClient = useCallback(async () => {
    if (clientRef.current) return clientRef.current;
    const client = await getSupabase();
    if (!clientRef.current) {
      clientRef.current = client;
      client.auth.onAuthStateChange((_event, session) => {
        const user = session?.user;
        setAccount((prev) => (user ? (prev?.userId === user.id ? prev : { userId: user.id, email: user.email ?? '' }) : null));
        if (!user) setStatus('signed-out');
      });
    }
    return client;
  }, []);

  // 起動時: 保存されたログイン状態があるときだけ Supabase を読み込む(未ログインの人には読み込ませない)
  useEffect(() => {
    if (!mayHaveSession()) return;
    void (async () => {
      const client = await ensureClient();
      const { data: s } = await client.auth.getSession();
      if (!s.session) setStatus('signed-out');
      // ログインリンクの ?code= は処理後に URL から消す
      if (new URLSearchParams(location.search).has('code')) {
        history.replaceState(null, '', location.pathname + location.hash);
      }
    })();
  }, [ensureClient]);

  // ログインしたら最初の同期
  useEffect(() => {
    if (account) void runSync();
  }, [account, runSync]);

  // 手元で解いたら、少し待ってからまとめて同期
  useEffect(() => {
    if (!account || canonicalJson(data) === syncedJsonRef.current) return;
    const timer = setTimeout(() => void runSync(), SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [data, account, runSync]);

  // 別の端末で解いた分を取り込むため、画面に戻ってきたときにも同期
  useEffect(() => {
    if (!account) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void runSync();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [account, runSync]);

  const api = useMemo<SyncApi>(
    () => ({
      status,
      account,
      lastSyncedAt,
      error,
      sendCode: async (email) => {
        const client = await ensureClient();
        const { error: e } = await client.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname },
        });
        if (e) throw e;
      },
      verifyCode: async (email, code) => {
        const client = await ensureClient();
        const { error: e } = await client.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
        if (e) throw e;
      },
      syncNow: runSync,
      signOut: async () => {
        const client = clientRef.current;
        if (!client) return;
        await runSync();
        await client.auth.signOut();
        syncedJsonRef.current = null;
        setAccount(null);
        setLastSyncedAt(null);
        setStatus('signed-out');
        // 共有 PC などで次の人に記録が残らないよう、この端末のデータは消す(サーバには残っている)
        reset();
      },
    }),
    [status, account, lastSyncedAt, error, ensureClient, runSync, reset],
  );

  return <SyncContext.Provider value={api}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncApi {
  const api = useContext(SyncContext);
  if (!api) throw new Error('useSync must be used within SyncProvider');
  return api;
}
