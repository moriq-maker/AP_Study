import { describe, expect, it } from 'vitest';
import { syncOnce, type RemoteStore } from './sync';
import { emptyUserData, recordAm, sameUserData, setNote, toggleBookmark, type UserData } from './userData';

const t = (s: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, s));

function fakeRemote(initial: unknown | null) {
  let stored = initial;
  let saves = 0;
  const remote: RemoteStore = {
    fetch: async () => stored,
    save: async (d: UserData) => {
      stored = JSON.parse(JSON.stringify(d));
      saves += 1;
    },
  };
  return { remote, get stored() { return stored; }, get saves() { return saves; } };
}

describe('syncOnce', () => {
  it('uploads local data when the server has nothing', async () => {
    const local = recordAm(emptyUserData(), 'q1', true, t(1));
    const r = fakeRemote(null);
    const { merged, uploaded } = await syncOnce(local, r.remote);
    expect(uploaded).toBe(true);
    expect(sameUserData(merged, local)).toBe(true);
  });

  it('merges two devices and converges without further uploads', async () => {
    const pc = recordAm(emptyUserData(), 'q1', true, t(1));
    const phone = setNote(toggleBookmark(emptyUserData(), 'q2', t(2)), 'q2', 'memo', t(3));
    const r = fakeRemote(null);

    await syncOnce(pc, r.remote);
    const fromPhone = await syncOnce(phone, r.remote);
    expect(fromPhone.merged.am.q1).toBeDefined();
    expect(fromPhone.merged.notes.q2.text).toBe('memo');

    const again = await syncOnce(fromPhone.merged, r.remote);
    expect(again.uploaded).toBe(false);
    expect(r.saves).toBe(2);
  });

  it('treats broken server data as empty', async () => {
    const local = recordAm(emptyUserData(), 'q1', false, t(1));
    const { merged } = await syncOnce(local, fakeRemote({ broken: true }).remote);
    expect(merged.am.q1.lastCorrect).toBe(false);
  });
});
