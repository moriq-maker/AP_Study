import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EXAMS, PM_EXAMS, QUESTIONS, WRITTEN_QUESTIONS } from '.';
import { CHOICE_LABELS } from './types';
import * as r04AutumnAm from './exams/r04-autumn-am';
import * as r05AutumnAm from './exams/r05-autumn-am';
import * as r06AutumnAm from './exams/r06-autumn-am';
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

  // 公式解答例の正解を問1から順に並べたもの
  it.each([
    [r07AutumnAm, 'エイイウイイアエイアイウアイエイウイエアアウエウウイエアイウアアイエエイウアエアアアウイアエイイエエアエウアアアイエウイアエイウイウウイアイイイウエウエイエアア'],
    [r06AutumnAm, 'ウエウアウイウウウイウエエイアウアエウウウウウウイエイウイイイウウウエアウウアウウイエイイアウイイエウエアエエウイアアウイエイイウアエウウウウアイウイイアイアウ'],
    [r05AutumnAm, 'ウエアアウウイウウアイイイエエエアイエエウウアアイエアアイアウイイイエウアウアアイウアアエウエアアアエウアエアイイウウイイアエウアエアウイウエイイエエイエエアイ'],
    [r04AutumnAm, 'イエアイイエエイイエイウウエアイウウウウウエウアエイイウウイウアウエエウアウアイイイアイイアイイエウウイエウイウイエウアエイウイエエエウイエウイウイエウイウエア'],
  ])('$EXAM.id answers match the official answer key', (mod, key) => {
    expect(mod.QUESTIONS.map((q) => CHOICE_LABELS[q.answer]).join('')).toBe(key);
  });
});

describe('afternoon exam data', () => {
  it('has unique ids, registered exams and non-empty items', () => {
    const ids = WRITTEN_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const examIds = new Set(PM_EXAMS.map((e) => e.id));
    for (const q of WRITTEN_QUESTIONS) {
      expect(examIds).toContain(q.examId);
      expect(q.pages.length).toBeGreaterThan(0);
      expect(q.items.length).toBeGreaterThan(0);
      for (const item of q.items) expect(item.answer.trim()).not.toBe('');
    }
  });

  it('every image exists in public/', () => {
    for (const q of QUESTIONS) {
      for (const f of [...(q.figures ?? []), ...(q.choiceFigure ? [q.choiceFigure] : [])]) {
        expect(existsSync(`public/${f}`), f).toBe(true);
      }
    }
    for (const q of WRITTEN_QUESTIONS) {
      for (const page of [...q.pages, ...(q.referencePages ?? [])]) {
        expect(existsSync(`public/${page}`), page).toBe(true);
      }
    }
  });
});
