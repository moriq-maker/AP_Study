import { describe, expect, it } from 'vitest';
import type { Question } from '../data/types';
import { buildQuiz, filterQuestions, percent, scoreByCategory, shuffle } from './quiz';
import { recordAnswer, type History } from './storage';

const q = (id: string, field: Question['field'], category: string): Question => ({
  id,
  field,
  category,
  question: id,
  choices: ['a', 'b', 'c', 'd'],
  answer: 0,
  explanation: '',
});

const pool = [
  q('t1', 'technology', 'ネットワーク'),
  q('t2', 'technology', 'データベース'),
  q('m1', 'management', 'プロジェクトマネジメント'),
  q('s1', 'strategy', '法務'),
];

describe('shuffle', () => {
  it('keeps all elements and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('filterQuestions', () => {
  it('filters by field and category', () => {
    const base = { fields: ['technology' as const], categories: [], mode: 'random' as const };
    expect(filterQuestions(pool, base, {}).map((x) => x.id)).toEqual(['t1', 't2']);
    expect(filterQuestions(pool, { ...base, categories: ['データベース'] }, {}).map((x) => x.id)).toEqual(['t2']);
  });

  it('weak mode returns only questions whose last answer was wrong', () => {
    let h: History = {};
    h = recordAnswer(h, 't1', false);
    h = recordAnswer(h, 't2', false);
    h = recordAnswer(h, 't2', true);
    const settings = { fields: ['technology' as const], categories: [], mode: 'weak' as const };
    expect(filterQuestions(pool, settings, h).map((x) => x.id)).toEqual(['t1']);
  });

  it('unanswered mode excludes answered questions', () => {
    const h = recordAnswer({}, 'm1', true);
    const settings = { fields: ['management' as const, 'strategy' as const], categories: [], mode: 'unanswered' as const };
    expect(filterQuestions(pool, settings, h).map((x) => x.id)).toEqual(['s1']);
  });
});

describe('buildQuiz', () => {
  it('limits to the requested count', () => {
    const quiz = buildQuiz(pool, { fields: ['technology', 'management', 'strategy'], categories: [], count: 2, mode: 'random' }, {});
    expect(quiz).toHaveLength(2);
  });
});

describe('recordAnswer', () => {
  it('accumulates attempts and correct counts', () => {
    let h: History = {};
    h = recordAnswer(h, 'x', true);
    h = recordAnswer(h, 'x', false);
    expect(h.x).toMatchObject({ attempts: 2, correct: 1, lastCorrect: false });
  });
});

describe('scoreByCategory / percent', () => {
  it('aggregates per category', () => {
    const scores = scoreByCategory(pool, [
      { questionId: 't1', selected: 0, correct: true },
      { questionId: 't2', selected: 1, correct: false },
    ]);
    expect(scores).toEqual([
      { category: 'ネットワーク', correct: 1, total: 1 },
      { category: 'データベース', correct: 0, total: 1 },
    ]);
    expect(percent(1, 3)).toBe(33);
    expect(percent(0, 0)).toBe(0);
  });
});
