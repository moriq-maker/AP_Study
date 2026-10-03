import { emptyUserData, mergeUserData, sameUserData, toUserData, type UserData } from './userData';

/** 同期先(Supabase)とのやり取り。テストでは差し替える */
export interface RemoteStore {
  /** 保存済みのデータ。まだ無ければ null */
  fetch: () => Promise<unknown | null>;
  save: (data: UserData) => Promise<void>;
}

export interface SyncResult {
  /** 手元とサーバを統合した結果 */
  merged: UserData;
  /** サーバに書き込んだか(サーバ側が既に最新なら書き込まない) */
  uploaded: boolean;
}

/**
 * 手元のデータとサーバのデータを統合し、サーバが古ければ書き込む。
 * 統合はレコードごとに更新時刻が新しい方を採用するので、複数端末で別々に解いた記録も失われない。
 */
export async function syncOnce(local: UserData, remote: RemoteStore): Promise<SyncResult> {
  const fetched = await remote.fetch();
  const remoteData = fetched === null ? emptyUserData() : toUserData(fetched);
  const merged = mergeUserData(local, remoteData);
  const uploaded = fetched === null || !sameUserData(merged, remoteData);
  if (uploaded) await remote.save(merged);
  return { merged, uploaded };
}
