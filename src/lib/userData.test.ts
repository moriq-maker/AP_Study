import { describe, expect, it } from 'vitest';
import {
  amStatus,
  emptyUserData,
  isBookmarked,
  mergeUserData,
  pmItemKey,
  pmSummary,
  recordAm,
  recordPmItem,
  setNote,
  toggleBookmark,
} from './userData';

const t = (s: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, s));

describe('recording', () => {
  it('accumulates AM answers and reports status', () => {
    let d = emptyUserData();
    expect(amStatus(d, 'q1')).toBe('unanswered');
    d = recordAm(d, 'q1', true);
    d = recordAm(d, 'q1', false);
    expect(d.am.q1).toMatchObject({ attempts: 2, correct: 1, lastCorrect: false });
    expect(amStatus(d, 'q1')).toBe('wrong');
  });

  it('summarises PM items by their latest result', () => {
    let d = emptyUserData();
    d = recordPmItem(d, pmItemKey('p1', 0), true);
    d = recordPmItem(d, pmItemKey('p1', 2), false);
    expect(pmSummary(d, 'p1', 4)).toEqual({ answered: 2, correct: 1, total: 4 });
  });
});

describe('recordPmItem replace', () => {
  it('replaces the latest result without adding an attempt', () => {
    let d = recordPmItem(emptyUserData(), 'k', false);
    d = recordPmItem(d, 'k', true, new Date(), true);
    expect(d.pm.k).toMatchObject({ attempts: 1, correct: 1, lastCorrect: true });
  });
});

describe('bookmarks and notes', () => {
  it('toggles bookmarks', () => {
    let d = toggleBookmark(emptyUserData(), 'q1');
    expect(isBookmarked(d, 'q1')).toBe(true);
    d = toggleBookmark(d, 'q1');
    expect(isBookmarked(d, 'q1')).toBe(false);
    expect(d.bookmarks.q1).toBeDefined();
  });

  it('stores notes', () => {
    expect(setNote(emptyUserData(), 'q1', 'memo').notes.q1.text).toBe('memo');
  });
});

describe('mergeUserData', () => {
  it('keeps the newer record per key', () => {
    const a = setNote(recordAm(emptyUserData(), 'q1', true, t(1)), 'q1', 'old', t(1));
    const b = setNote(recordAm(toggleBookmark(emptyUserData(), 'q2', t(2)), 'q1', false, t(5)), 'q1', 'new', t(5));
    const merged = mergeUserData(a, b);
    expect(merged.am.q1.lastCorrect).toBe(false);
    expect(merged.notes.q1.text).toBe('new');
    expect(isBookmarked(merged, 'q2')).toBe(true);
    expect(mergeUserData(b, a)).toEqual(merged);
  });

  it('propagates bookmark removal when it is newer', () => {
    const on = toggleBookmark(emptyUserData(), 'q1', t(1));
    const off = toggleBookmark(on, 'q1', t(2));
    expect(isBookmarked(mergeUserData(on, off), 'q1')).toBe(false);
  });
});
