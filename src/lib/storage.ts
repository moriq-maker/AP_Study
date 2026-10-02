export interface QuestionHistory {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAnsweredAt: string;
}

/** 問題IDごとの解答履歴 */
export type History = Record<string, QuestionHistory>;

const STORAGE_KEY = 'ap-study:history:v1';

export function recordAnswer(history: History, questionId: string, correct: boolean, now = new Date()): History {
  const prev = history[questionId];
  return {
    ...history,
    [questionId]: {
      attempts: (prev?.attempts ?? 0) + 1,
      correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
      lastCorrect: correct,
      lastAnsweredAt: now.toISOString(),
    },
  };
}

// localStorage はプライベートモード等で例外を投げることがあるため、失敗しても動作を続ける
export function loadHistory(): History {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as History) : {};
  } catch {
    return {};
  }
}

export function saveHistory(history: History): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // 保存できなくても学習自体は継続できる
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
