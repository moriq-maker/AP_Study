import type { WrittenItem, WrittenQuestion } from '../types';

/** 記号・数値・用語など、表記ゆれを除いて一致すれば正解とする解答欄 */
export const exact = (label: string, answer: string, extra: Partial<WrittenItem> = {}): WrittenItem => ({
  label,
  answer,
  kind: 'exact',
  ...extra,
});

/** 文章で答える解答欄(自己採点) */
export const free = (label: string, answer: string, extra: Partial<WrittenItem> = {}): WrittenItem => ({
  label,
  answer,
  kind: 'free',
  ...extra,
});

/** 問題冊子のページ番号の範囲から画像パスの配列を作る */
export function pageRange(examId: string, from: number, to: number): string[] {
  return Array.from(
    { length: to - from + 1 },
    (_, i) => `figures/${examId}/p${String(from + i).padStart(2, '0')}.webp`,
  );
}

/** 午後試験一つ分の問題を作る関数を返す */
export function writtenQuestionFactory(examId: string) {
  return (
    number: number,
    category: string,
    theme: string,
    [from, to]: [number, number],
    aim: string,
    items: WrittenItem[],
    extra: Partial<WrittenQuestion> = {},
  ): WrittenQuestion => ({
    id: `${examId}-${String(number).padStart(2, '0')}`,
    examId,
    number,
    category,
    theme,
    pages: pageRange(examId, from, to),
    aim,
    items,
    ...extra,
  });
}
