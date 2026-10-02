import type { Field, Question } from '../data/types';
/** 問題 ID → 直近の正誤。学習データ(UserData.am)をそのまま渡せる */
export type History = Record<string, { lastCorrect: boolean }>;

export type QuizMode = 'random' | 'weak' | 'unanswered';
export type QuizOrder = 'shuffle' | 'number';

export interface QuizSettings {
  /** 空配列ならすべての試験が対象 */
  examIds: string[];
  fields: Field[];
  /** 空配列なら選択した大分類のすべての中分類が対象 */
  categories: string[];
  count: number;
  mode: QuizMode;
  /** number: 試験ごとに問番号順で出題する(本番形式) */
  order: QuizOrder;
}

export interface AnswerRecord {
  questionId: string;
  selected: number;
  correct: boolean;
}

/** Fisher–Yates シャッフル。元の配列は変更しない */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 直近の解答が不正解だった問題を「苦手」とみなす */
export function isWeak(id: string, history: History): boolean {
  const h = history[id];
  return h !== undefined && !h.lastCorrect;
}

export function filterQuestions(
  questions: readonly Question[],
  settings: Pick<QuizSettings, 'examIds' | 'fields' | 'categories' | 'mode'>,
  history: History,
): Question[] {
  return questions.filter((q) => {
    if (settings.examIds.length > 0 && !settings.examIds.includes(q.examId)) return false;
    if (!settings.fields.includes(q.field)) return false;
    if (settings.categories.length > 0 && !settings.categories.includes(q.category)) return false;
    if (settings.mode === 'weak') return isWeak(q.id, history);
    if (settings.mode === 'unanswered') return history[q.id] === undefined;
    return true;
  });
}

export function buildQuiz(
  questions: readonly Question[],
  settings: QuizSettings,
  history: History,
  rng: () => number = Math.random,
): Question[] {
  const pool = filterQuestions(questions, settings, history);
  if (settings.order === 'number') {
    // 試験ごとにまとめ、試験内は問番号順に並べる(filter は元の並びを保つ)
    const examOrder = [...new Set(pool.map((q) => q.examId))];
    return [...pool]
      .sort((a, b) => examOrder.indexOf(a.examId) - examOrder.indexOf(b.examId) || (a.number ?? 0) - (b.number ?? 0))
      .slice(0, settings.count);
  }
  return shuffle(pool, rng).slice(0, settings.count);
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
}

export function scoreByCategory(questions: readonly Question[], answers: readonly AnswerRecord[]): CategoryScore[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const scores = new Map<string, CategoryScore>();
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const s = scores.get(q.category) ?? { category: q.category, correct: 0, total: 0 };
    s.total += 1;
    if (a.correct) s.correct += 1;
    scores.set(q.category, s);
  }
  return [...scores.values()];
}

export function percent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
