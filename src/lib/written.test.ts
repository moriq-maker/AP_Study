import { describe, expect, it } from 'vitest';
import type { WrittenItem } from '../data/types';
import { autoGrade, normalize, recordWritten } from './written';

const exact = (answer: string, extra: Partial<WrittenItem> = {}): WrittenItem => ({ label: '', answer, kind: 'exact', ...extra });

describe('normalize', () => {
  it('absorbs width, spaces, minus signs and commas', () => {
    expect(normalize('lcsl[n − 1, k − 1] ＋ 1')).toBe(normalize('lcsl[n-1,k-1]+1'));
    expect(normalize('Ｗｅｂ サーバ')).toBe(normalize('webサーバ'));
    expect(normalize('6,510')).toBe(normalize('６，５１０'));
    expect(normalize('isPrime[(d－1)÷2]が true と等しい')).toBe(normalize('isPrime[(d-1)÷2]がtrueと等しい'));
    expect(normalize('N2')).toBe(normalize('N²'));
  });
});

describe('autoGrade', () => {
  it('grades exact items and leaves free items to self-grading', () => {
    const items: WrittenItem[] = [exact('ア'), { label: '', answer: '文章', kind: 'free' }, exact('可用性', { accept: ['稼働率'] })];
    expect(autoGrade(items, ['ア', '何か', '稼働率'])).toEqual([true, null, true]);
    expect(autoGrade(items, ['イ', '', ''])).toEqual([false, null, false]);
  });

  it('accepts unordered answers in any order but not duplicates', () => {
    const items = [exact('レベル', { unordered: 'g' }), exact('ジャンル', { unordered: 'g' })];
    expect(autoGrade(items, ['ジャンル', 'レベル'])).toEqual([true, true]);
    expect(autoGrade(items, ['レベル', 'レベル'])).toEqual([true, false]);
  });
});

describe('recordWritten', () => {
  it('stores the latest score and inputs', () => {
    const h = recordWritten(recordWritten({}, 'x', ['a'], [false]), 'x', ['b'], [true]);
    expect(h.x).toMatchObject({ attempts: 2, lastCorrect: 1, total: 1, lastInputs: ['b'] });
  });
});
