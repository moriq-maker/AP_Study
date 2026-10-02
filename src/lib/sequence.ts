import { QUESTIONS, getQuestion, questionsOfCategory, questionsOfExam } from '../data';
import type { Question } from '../data/types';
import { amStatus, isBookmarked, type UserData } from './userData';

/**
 * 問題ページの「前へ / 次へ」をどの並びでたどるか。URL の ?from= で受け渡す。
 * - exam(既定): 同じ試験の問番号順
 * - cat:<中分類>: 分野別一覧の並び
 * - bookmarks: ブックマークした問題
 * - wrong: 直近の解答が不正解の問題
 */
export type SequenceSource = 'exam' | 'bookmarks' | 'wrong' | `cat:${string}`;

export function parseSource(value: string | null): SequenceSource {
  if (value === 'bookmarks' || value === 'wrong') return value;
  if (value?.startsWith('cat:')) return value as SequenceSource;
  return 'exam';
}

export function sourceLabel(source: SequenceSource): string {
  if (source === 'bookmarks') return 'ブックマーク';
  if (source === 'wrong') return '間違えた問題';
  if (source.startsWith('cat:')) return source.slice(4);
  return '試験';
}

export function sequenceFor(source: SequenceSource, current: Question, data: UserData): Question[] {
  if (source === 'bookmarks') return QUESTIONS.filter((q) => isBookmarked(data, q.id));
  if (source === 'wrong') return QUESTIONS.filter((q) => amStatus(data, q.id) === 'wrong');
  if (source.startsWith('cat:')) return questionsOfCategory(source.slice(4));
  return questionsOfExam(current.examId);
}

/**
 * 並びの中での前後の問題。
 * 現在の問題が並びから外れた場合(例: 正解したので「間違えた問題」から消えた)は、
 * 開いた時点の位置 fallbackIndex を基準にする(後ろの問題が一つ前に詰まっているので、その位置が「次」になる)。
 */
export function neighbors<T extends { id: string }>(sequence: readonly T[], currentId: string, fallbackIndex = 0) {
  const index = sequence.findIndex((q) => q.id === currentId);
  if (index >= 0) {
    return { prev: sequence[index - 1], next: sequence[index + 1], position: index + 1, total: sequence.length };
  }
  return { prev: sequence[fallbackIndex - 1], next: sequence[fallbackIndex], position: undefined, total: sequence.length };
}

export function questionLink(id: string, source: SequenceSource = 'exam'): string {
  const q = getQuestion(id);
  const base = q ? `/q/${id}` : `/pm/${id}`;
  return source === 'exam' ? base : `${base}?from=${encodeURIComponent(source)}`;
}
