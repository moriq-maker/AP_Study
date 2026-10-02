import type { Exam, Question } from './types';
import * as original from './exams/original';
import * as r07AutumnAm from './exams/r07-autumn-am';

/** 収録している試験。新しい試験を追加したらここに登録する */
const MODULES: { EXAM: Exam; QUESTIONS: Question[] }[] = [r07AutumnAm, original];

export const EXAMS: Exam[] = MODULES.map((m) => m.EXAM).sort((a, b) => b.order - a.order);

export const QUESTIONS: Question[] = MODULES.flatMap((m) => m.QUESTIONS);

const examById = new Map(EXAMS.map((e) => [e.id, e]));

export function getExam(id: string): Exam | undefined {
  return examById.get(id);
}

/** 例: '令和7年度 秋期 午前 問1'。オリジナル問題は試験名のみ */
export function questionLabel(q: Question): string {
  const title = getExam(q.examId)?.title ?? q.examId;
  return q.number === undefined ? title : `${title} 問${q.number}`;
}
