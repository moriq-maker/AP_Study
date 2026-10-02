import type { Exam, Question, WrittenQuestion } from './types';
import * as original from './exams/original';
import * as r04AutumnAm from './exams/r04-autumn-am';
import * as r04AutumnPm from './exams/r04-autumn-pm';
import * as r05AutumnAm from './exams/r05-autumn-am';
import * as r05AutumnPm from './exams/r05-autumn-pm';
import * as r06AutumnAm from './exams/r06-autumn-am';
import * as r06AutumnPm from './exams/r06-autumn-pm';
import * as r07AutumnAm from './exams/r07-autumn-am';
import * as r07AutumnPm from './exams/r07-autumn-pm';

/** 収録している午前試験。新しい試験を追加したらここに登録する */
const MODULES: { EXAM: Exam; QUESTIONS: Question[] }[] = [r07AutumnAm, r06AutumnAm, r05AutumnAm, r04AutumnAm, original];

export const EXAMS: Exam[] = MODULES.map((m) => m.EXAM).sort((a, b) => b.order - a.order);

export const QUESTIONS: Question[] = MODULES.flatMap((m) => m.QUESTIONS);

/** 収録している午後試験。新しい試験を追加したらここに登録する */
const PM_MODULES: { EXAM: Exam; QUESTIONS: WrittenQuestion[] }[] = [r07AutumnPm, r06AutumnPm, r05AutumnPm, r04AutumnPm];

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

const questionById = new Map(QUESTIONS.map((q) => [q.id, q]));
const writtenById = new Map(WRITTEN_QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return questionById.get(id);
}

export function getWrittenQuestion(id: string): WrittenQuestion | undefined {
  return writtenById.get(id);
}

export function isPmExam(examId: string): boolean {
  return PM_EXAMS.some((e) => e.id === examId);
}

export function questionsOfExam(examId: string): Question[] {
  return QUESTIONS.filter((q) => q.examId === examId);
}

export function writtenQuestionsOfExam(examId: string): WrittenQuestion[] {
  return WRITTEN_QUESTIONS.filter((q) => q.examId === examId);
}

const examOrder = (examId: string) => getExam(examId)?.order ?? 0;

/** 午前の中分類ごとの問題(新しい試験から順) */
export function questionsOfCategory(category: string): Question[] {
  return QUESTIONS.filter((q) => q.category === category).sort(
    (a, b) => examOrder(b.examId) - examOrder(a.examId) || (a.number ?? 0) - (b.number ?? 0),
  );
}

/** 午後の出題分野ごとの問題(新しい試験から順) */
export function writtenQuestionsOfCategory(category: string): WrittenQuestion[] {
  return WRITTEN_QUESTIONS.filter((q) => q.category === category).sort(
    (a, b) => examOrder(b.examId) - examOrder(a.examId) || a.number - b.number,
  );
}
