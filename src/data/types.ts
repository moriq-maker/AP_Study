/** 応用情報技術者試験の出題分野(大分類) */
export type Field = 'technology' | 'management' | 'strategy';

export const FIELD_LABELS: Record<Field, string> = {
  technology: 'テクノロジ系',
  management: 'マネジメント系',
  strategy: 'ストラテジ系',
};

export interface Question {
  /** 一意なID。学習履歴のキーになるため変更しないこと */
  id: string;
  field: Field;
  /** 中分類(例: 基礎理論, ネットワーク) */
  category: string;
  question: string;
  /** 選択肢。表示時に ア・イ・ウ・エ が付与される */
  choices: [string, string, string, string];
  /** 正解の選択肢インデックス (0〜3) */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export const CHOICE_LABELS = ['ア', 'イ', 'ウ', 'エ'] as const;
