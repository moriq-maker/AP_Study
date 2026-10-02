import type { WrittenItem } from '../data/types';

/** 表記ゆれ(全角/半角、空白、記号の種類、大文字小文字)を吸収して比較用の文字列にする */
export function normalize(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[−‐―]/g, '-') // マイナス記号のゆれ
    .replace(/[、，]/g, ',')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function candidates(item: WrittenItem): string[] {
  return [item.answer, ...(item.accept ?? [])].map(normalize);
}

/**
 * exact の解答欄を自動採点する。free の解答欄は null(自己採点)。
 * unordered が同じ解答欄どうしは、解答例をどの順で書いても正解にする(同じ値の重複は不可)。
 */
export function autoGrade(items: readonly WrittenItem[], inputs: readonly string[]): (boolean | null)[] {
  const result: (boolean | null)[] = items.map((item, i) =>
    item.kind === 'free' ? null : candidates(item).includes(normalize(inputs[i] ?? '')),
  );

  const groups = new Map<string, number[]>();
  items.forEach((item, i) => {
    if (item.kind === 'exact' && item.unordered) groups.set(item.unordered, [...(groups.get(item.unordered) ?? []), i]);
  });
  for (const indexes of groups.values()) {
    const remaining = indexes.map((i) => candidates(items[i]));
    for (const i of indexes) {
      const value = normalize(inputs[i] ?? '');
      const hit = remaining.findIndex((c) => c.includes(value));
      result[i] = hit >= 0;
      if (hit >= 0) remaining.splice(hit, 1);
    }
  }
  return result;
}

export interface WrittenHistoryEntry {
  attempts: number;
  lastCorrect: number;
  total: number;
  /** 前回の解答(見直し用) */
  lastInputs: string[];
  lastAnsweredAt: string;
}

/** 午後問題IDごとの解答履歴 */
export type WrittenHistory = Record<string, WrittenHistoryEntry>;

const STORAGE_KEY = 'ap-study:written-history:v1';

export function recordWritten(
  history: WrittenHistory,
  questionId: string,
  inputs: string[],
  marks: boolean[],
  now = new Date(),
): WrittenHistory {
  return {
    ...history,
    [questionId]: {
      attempts: (history[questionId]?.attempts ?? 0) + 1,
      lastCorrect: marks.filter(Boolean).length,
      total: marks.length,
      lastInputs: inputs,
      lastAnsweredAt: now.toISOString(),
    },
  };
}

// localStorage はプライベートモード等で例外を投げることがあるため、失敗しても動作を続ける
export function loadWrittenHistory(): WrittenHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as WrittenHistory) : {};
  } catch {
    return {};
  }
}

export function saveWrittenHistory(history: WrittenHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // 保存できなくても学習自体は継続できる
  }
}

export function clearWrittenHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
