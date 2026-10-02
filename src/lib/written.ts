import type { WrittenItem } from '../data/types';

/** 表記ゆれ(全角/半角、空白、記号の種類、大文字小文字)を吸収して比較用の文字列にする */
export function normalize(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[−‐―]/g, '-') // マイナス記号のゆれ
    .replace(/[、，]/g, ',')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function candidates(item: WrittenItem): string[] {
  return [item.answer, ...(item.accept ?? [])].map(normalize);
}

/**
 * exact の解答欄を自動採点する。free の解答欄は null(自己採点)。
 * unordered が同じ解答欄どうしは、解答例をどの順で書いても正解にする(同じ値の重複は不可)。
 */
export function autoGrade(items: readonly WrittenItem[], inputs: readonly string[]): (boolean | null)[] {
  const result: (boolean | null)[] = items.map((item, i) =>
    item.kind === 'free' ? null : candidates(item).includes(normalize(inputs[i] ?? '')),
  );

  const groups = new Map<string, number[]>();
  items.forEach((item, i) => {
    if (item.kind === 'exact' && item.unordered) groups.set(item.unordered, [...(groups.get(item.unordered) ?? []), i]);
  });
  for (const indexes of groups.values()) {
    const remaining = indexes.map((i) => candidates(items[i]));
    for (const i of indexes) {
      const value = normalize(inputs[i] ?? '');
      const hit = remaining.findIndex((c) => c.includes(value));
      result[i] = hit >= 0;
      if (hit >= 0) remaining.splice(hit, 1);
    }
  }
  return result;
}
