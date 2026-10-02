import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './questions';

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
