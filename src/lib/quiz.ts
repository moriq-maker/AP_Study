import type { Field, Question } from '../data/types';
import type { History } from './storage';

export type QuizMode = 'random' | 'weak' | 'unanswered';

export interface QuizSettings {
  fields: Field[];
  /** 空配列なら選択した大分類のすべての中分類が対象 */
  categories: string[];
  count: number;
  mode: QuizMode;
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
  settings: Omit<QuizSettings, 'count'>,
  history: History,
): Question[] {
  return questions.filter((q) => {
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
  return shuffle(filterQuestions(questions, settings, history), rng).slice(0, settings.count);
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
