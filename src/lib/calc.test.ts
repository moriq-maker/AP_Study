import { describe, expect, it } from 'vitest';
import { CalcError, evaluate, formatNumber, plainNumber } from './calc';

describe('evaluate', () => {
  it.each([
    ['1+2×3', 7],
    ['(1+2)×3', 9],
    ['10÷4', 2.5],
    ['2^10', 1024],
    ['2^3^2', 512],
    ['−3+5', 2],
    ['-2^2', -4],
    ['3×-2', -6],
    ['50%', 0.5],
    ['200×15%', 30],
    ['2(3+4)', 14],
    ['(1+2)(3+4)', 21],
    ['(2+3', 5],
    ['.5+1.25', 1.75],
    ['１２３＋４', 127],
    ['1,000×3', 3000],
    ['60000/50', 1200],
    ['800*600*24*30', 345600000],
  ])('%s = %d', (expr, want) => {
    expect(evaluate(expr)).toBeCloseTo(want, 10);
  });

  it.each(['', '1+', '1++×2', '()', '1)', '5÷0', '2..3', 'abc', '1+(2×'])('%s はエラー', (expr) => {
    expect(() => evaluate(expr)).toThrow(CalcError);
  });
});

describe('formatNumber', () => {
  it('浮動小数点の誤差を丸めて桁区切りを付ける', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(1234567.5)).toBe('1,234,567.5');
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(1 / 3)).toBe('0.3333333333');
  });

  it('とても大きい・小さい数は指数表記にする', () => {
    expect(formatNumber(2 ** 60)).toBe('1.152922e+18');
    expect(formatNumber(1e-12)).toBe('1e-12');
  });

  it('続きの計算用には桁区切りを付けない', () => {
    expect(plainNumber(1234567.5)).toBe('1234567.5');
    expect(plainNumber(0.1 + 0.2)).toBe('0.3');
  });
});
