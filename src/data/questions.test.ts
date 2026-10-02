import { describe, expect, it } from 'vitest';
import { EXAMS, QUESTIONS } from '.';
import { CHOICE_LABELS } from './types';
import * as r07AutumnAm from './exams/r07-autumn-am';

describe('question data', () => {
  it('has unique ids', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s is well-formed', (_, q) => {
    expect(q.question.trim()).not.toBe('');
    expect(q.explanation.trim()).not.toBe('');
    expect(q.choices).toHaveLength(4);
    expect(new Set(q.choices).size).toBe(4);
    expect([0, 1, 2, 3]).toContain(q.answer);
  });
});

describe('exam data', () => {
  it('every question belongs to a registered exam', () => {
    const ids = new Set(EXAMS.map((e) => e.id));
    for (const q of QUESTIONS) expect(ids).toContain(q.examId);
  });

  it('IPA past exams have 80 numbered questions in order with credit', () => {
    for (const e of EXAMS.filter((x) => x.id !== 'original')) {
      expect(e.credit).toBeTruthy();
      const nums = QUESTIONS.filter((q) => q.examId === e.id).map((q) => q.number);
      expect(nums).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
    }
  });

  // 公式解答例 (令和7年度秋期 午前) の正解を問1から順に並べたもの
  it('r07-autumn-am answers match the official answer key', () => {
    const key = 'エイイウイイアエイアイウアイエイウイエアアウエウウイエアイウアアイエエイウアエアアアウイアエイイエエアエウアアアイエウイアエイウイウウイアイイイウエウエイエアア';
    expect(r07AutumnAm.QUESTIONS.map((q) => CHOICE_LABELS[q.answer]).join('')).toBe(key);
  });
});
