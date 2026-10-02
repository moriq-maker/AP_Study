import { describe, expect, it } from 'vitest';
import { neighbors, parseSource } from './sequence';

const seq = ['a', 'b', 'c'].map((id) => ({ id }));

describe('neighbors', () => {
  it('returns previous and next within the sequence', () => {
    expect(neighbors(seq, 'b')).toMatchObject({ prev: { id: 'a' }, next: { id: 'c' }, position: 2, total: 3 });
    expect(neighbors(seq, 'a').prev).toBeUndefined();
  });

  it('falls back to the original position when the current item left the sequence', () => {
    // 元は ['a', 'x', 'b', 'c'] の 2 番目(index 1)に x があった
    expect(neighbors(seq, 'x', 1)).toMatchObject({ prev: { id: 'a' }, next: { id: 'b' }, position: undefined });
  });
});

describe('parseSource', () => {
  it('accepts known sources and defaults to exam', () => {
    expect(parseSource('bookmarks')).toBe('bookmarks');
    expect(parseSource('cat:ネットワーク')).toBe('cat:ネットワーク');
    expect(parseSource(null)).toBe('exam');
    expect(parseSource('unknown')).toBe('exam');
  });
});
