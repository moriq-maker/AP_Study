import type { Exam, Question, WrittenQuestion } from './types';
import * as original from './exams/original';
import * as r06AutumnAm from './exams/r06-autumn-am';
import * as r06AutumnPm from './exams/r06-autumn-pm';
import * as r07AutumnAm from './exams/r07-autumn-am';
import * as r07AutumnPm from './exams/r07-autumn-pm';

/** 収録している午前試験。新しい試験を追加したらここに登録する */
const MODULES: { EXAM: Exam; QUESTIONS: Question[] }[] = [r07AutumnAm, r06AutumnAm, original];

export const EXAMS: Exam[] = MODULES.map((m) => m.EXAM).sort((a, b) => b.order - a.order);

export const QUESTIONS: Question[] = MODULES.flatMap((m) => m.QUESTIONS);

/** 収録している午後試験。新しい試験を追加したらここに登録する */
const PM_MODULES: { EXAM: Exam; QUESTIONS: WrittenQuestion[] }[] = [r07AutumnPm, r06AutumnPm];

export const PM_EXAMS: Exam[] = PM_MODULES.map((m) => m.EXAM).sort((a, b) => b.order - a.order);

export const WRITTEN_QUESTIONS: WrittenQuestion[] = PM_MODULES.flatMap((m) => m.QUESTIONS);

const examById = new Map([...EXAMS, ...PM_EXAMS].map((e) => [e.id, e]));

export function getExam(id: string): Exam | undefined {
  return examById.get(id);
}

/** 例: '令和7年度 秋期 午前 問1'。オリジナル問題は試験名のみ */
export function questionLabel(q: Pick<Question, 'examId' | 'number'>): string {
  const title = getExam(q.examId)?.title ?? q.examId;
  return q.number === undefined ? title : `${title} 問${q.number}`;
}
