/**
 * 利用者ごとの学習データ(解答履歴・ブックマーク・メモ)。
 * 端末間同期に備えて、各レコードに更新時刻を持たせ、レコード単位で新しい方を採用してマージできるようにする。
 */

export interface AnswerStat {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  /** ISO 8601。マージ時にこの値が新しい方を採用する */
  updatedAt: string;
}

export interface Note {
  text: string;
  updatedAt: string;
}

export interface Bookmark {
  /** false は「削除済み」を表す(同期時に削除を伝えるため、レコード自体は残す) */
  on: boolean;
  updatedAt: string;
}

export interface UserData {
  version: 2;
  /** 午前問題 ID → 解答履歴 */
  am: Record<string, AnswerStat>;
  /** 午後の解答欄 ID(`${問題ID}#${欄の番号}`)→ 解答履歴 */
  pm: Record<string, AnswerStat>;
  bookmarks: Record<string, Bookmark>;
  notes: Record<string, Note>;
}

export const emptyUserData = (): UserData => ({ version: 2, am: {}, pm: {}, bookmarks: {}, notes: {} });

export const pmItemKey = (questionId: string, itemIndex: number) => `${questionId}#${itemIndex}`;

function nextStat(prev: AnswerStat | undefined, correct: boolean, now: Date): AnswerStat {
  return {
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    lastCorrect: correct,
    updatedAt: now.toISOString(),
  };
}

export function recordAm(data: UserData, questionId: string, correct: boolean, now = new Date()): UserData {
  return { ...data, am: { ...data.am, [questionId]: nextStat(data.am[questionId], correct, now) } };
}

/**
 * 午後の解答欄の結果を記録する。
 * replace = true のときは直前の記録の正誤だけを置き換える(自動採点を自己採点で修正した場合など)。
 */
export function recordPmItem(data: UserData, itemKey: string, correct: boolean, now = new Date(), replace = false): UserData {
  const prev = data.pm[itemKey];
  const stat: AnswerStat =
    replace && prev
      ? {
          attempts: prev.attempts,
          correct: prev.correct - (prev.lastCorrect ? 1 : 0) + (correct ? 1 : 0),
          lastCorrect: correct,
          updatedAt: now.toISOString(),
        }
      : nextStat(prev, correct, now);
  return { ...data, pm: { ...data.pm, [itemKey]: stat } };
}

export function isBookmarked(data: UserData, id: string): boolean {
  return data.bookmarks[id]?.on === true;
}

export function toggleBookmark(data: UserData, id: string, now = new Date()): UserData {
  return {
    ...data,
    bookmarks: { ...data.bookmarks, [id]: { on: !isBookmarked(data, id), updatedAt: now.toISOString() } },
  };
}

export function setNote(data: UserData, id: string, text: string, now = new Date()): UserData {
  return { ...data, notes: { ...data.notes, [id]: { text, updatedAt: now.toISOString() } } };
}

function mergeRecords<T extends { updatedAt: string }>(a: Record<string, T>, b: Record<string, T>): Record<string, T> {
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) {
    const current = result[key];
    if (!current || value.updatedAt > current.updatedAt) result[key] = value;
  }
  return result;
}

/** 二つの学習データを、レコードごとに更新時刻が新しい方を採用して統合する */
export function mergeUserData(a: UserData, b: UserData): UserData {
  return {
    version: 2,
    am: mergeRecords(a.am, b.am),
    pm: mergeRecords(a.pm, b.pm),
    bookmarks: mergeRecords(a.bookmarks, b.bookmarks),
    notes: mergeRecords(a.notes, b.notes),
  };
}

/** 午前問題の状態 */
export type AmStatus = 'unanswered' | 'correct' | 'wrong';

export function amStatus(data: UserData, questionId: string): AmStatus {
  const s = data.am[questionId];
  if (!s) return 'unanswered';
  return s.lastCorrect ? 'correct' : 'wrong';
}

/** 午後問題一つ分の集計(直近の解答で正解している欄の数) */
export function pmSummary(data: UserData, questionId: string, itemCount: number) {
  let answered = 0;
  let correct = 0;
  for (let i = 0; i < itemCount; i++) {
    const s = data.pm[pmItemKey(questionId, i)];
    if (!s) continue;
    answered += 1;
    if (s.lastCorrect) correct += 1;
  }
  return { answered, correct, total: itemCount };
}

// ---- 永続化(ブラウザ内) ----

const STORAGE_KEY = 'ap-study:userdata:v2';
const LEGACY_HISTORY_KEY = 'ap-study:history:v1';

interface LegacyHistoryEntry {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAnsweredAt: string;
}

function isUserData(value: unknown): value is UserData {
  return !!value && typeof value === 'object' && (value as UserData).version === 2;
}

/** 旧形式(v1)の午前の解答履歴を取り込む */
function migrateLegacy(raw: string | null): UserData {
  const data = emptyUserData();
  if (!raw) return data;
  try {
    const legacy = JSON.parse(raw) as Record<string, LegacyHistoryEntry>;
    for (const [id, h] of Object.entries(legacy)) {
      data.am[id] = { attempts: h.attempts, correct: h.correct, lastCorrect: h.lastCorrect, updatedAt: h.lastAnsweredAt };
    }
  } catch {
    // 壊れた旧データは無視する
  }
  return data;
}

// localStorage はプライベートモード等で例外を投げることがあるため、失敗しても動作を続ける
export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isUserData(parsed)) return { ...emptyUserData(), ...parsed };
    }
    return migrateLegacy(localStorage.getItem(LEGACY_HISTORY_KEY));
  } catch {
    return emptyUserData();
  }
}

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存できなくても学習自体は継続できる
  }
}

/** キーの順序に依存しない JSON 文字列。内容が同じかどうかの比較に使う */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

export function sameUserData(a: UserData, b: UserData): boolean {
  return canonicalJson(a) === canonicalJson(b);
}

/** サーバから取得したデータを安全に UserData として扱う(壊れていれば空とみなす) */
export function toUserData(value: unknown): UserData {
  return isUserData(value) ? { ...emptyUserData(), ...value } : emptyUserData();
}
