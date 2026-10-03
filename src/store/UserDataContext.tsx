import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  emptyUserData,
  loadUserData,
  mergeUserData,
  pmItemKey,
  recordAm,
  recordPmItem,
  sameUserData,
  saveUserData,
  setNote,
  toggleBookmark,
  type UserData,
} from '../lib/userData';

interface UserDataApi {
  data: UserData;
  recordAm: (questionId: string, correct: boolean) => void;
  /** replace = true で直前の結果を置き換える(採点の修正) */
  recordPmItem: (questionId: string, itemIndex: number, correct: boolean, replace?: boolean) => void;
  toggleBookmark: (id: string) => void;
  setNote: (id: string, text: string) => void;
  reset: () => void;
  /** 他の端末(サーバ)のデータを取り込む。内容が変わらなければ何もしない */
  mergeFrom: (other: UserData) => void;
}

const UserDataContext = createContext<UserDataApi | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>(() => loadUserData());

  useEffect(() => {
    saveUserData(data);
  }, [data]);

  const api = useMemo<UserDataApi>(
    () => ({
      data,
      recordAm: (id, correct) => setData((d) => recordAm(d, id, correct)),
      recordPmItem: (id, index, correct, replace = false) =>
        setData((d) => recordPmItem(d, pmItemKey(id, index), correct, new Date(), replace)),
      toggleBookmark: (id) => setData((d) => toggleBookmark(d, id)),
      setNote: (id, text) => setData((d) => setNote(d, id, text)),
      reset: () => setData(emptyUserData()),
      mergeFrom: (other) =>
        setData((d) => {
          const merged = mergeUserData(d, other);
          return sameUserData(merged, d) ? d : merged;
        }),
    }),
    [data],
  );

  return <UserDataContext.Provider value={api}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataApi {
  const api = useContext(UserDataContext);
  if (!api) throw new Error('useUserData must be used within UserDataProvider');
  return api;
}

