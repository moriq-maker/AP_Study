import { WRITTEN_QUESTIONS } from '../data';

/** vite.config.ts の runtimeCaching と同じキャッシュ名 */
export const PM_CACHE = 'pm-pages';

/** 午後の問題冊子のページ画像(参考ページを含む)の URL 一覧 */
export function pmPageUrls(): string[] {
  const paths = new Set<string>();
  for (const q of WRITTEN_QUESTIONS) {
    for (const p of [...q.pages, ...(q.referencePages ?? [])]) paths.add(p);
  }
  return [...paths].map((p) => new URL(`${import.meta.env.BASE_URL}${p}`, location.href).href);
}

export function offlineSupported(): boolean {
  return typeof caches !== 'undefined' && 'serviceWorker' in navigator;
}

/** 保存済みの午後ページ数 */
export async function countCachedPmPages(): Promise<number> {
  if (!offlineSupported()) return 0;
  const cache = await caches.open(PM_CACHE);
  const keys = new Set((await cache.keys()).map((r) => r.url));
  return pmPageUrls().filter((u) => keys.has(u)).length;
}

/** まだ保存していない午後のページ画像をまとめて保存する */
export async function downloadPmPages(onProgress: (done: number, total: number) => void): Promise<void> {
  const cache = await caches.open(PM_CACHE);
  const keys = new Set((await cache.keys()).map((r) => r.url));
  const urls = pmPageUrls();
  let done = urls.filter((u) => keys.has(u)).length;
  onProgress(done, urls.length);
  const missing = urls.filter((u) => !keys.has(u));
  // 同時に 4 件ずつ取得する
  let next = 0;
  const worker = async () => {
    while (next < missing.length) {
      const url = missing[next++];
      await cache.add(url);
      done += 1;
      onProgress(done, urls.length);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
}

/** 保存した午後のページ画像を削除する */
export async function clearPmPages(): Promise<void> {
  await caches.delete(PM_CACHE);
}
