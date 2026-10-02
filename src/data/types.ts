/** 応用情報技術者試験の出題分野(大分類) */
export type Field = 'technology' | 'management' | 'strategy';

export const FIELD_LABELS: Record<Field, string> = {
  technology: 'テクノロジ系',
  management: 'マネジメント系',
  strategy: 'ストラテジ系',
};

/** 問題の出典となる試験(年度・期・区分)。オリジナル問題も一つの「試験」として扱う */
export interface Exam {
  /** 例: 'r07-autumn-am'。問題IDや図のパスの接頭辞にも使う */
  id: string;
  /** 例: '令和7年度 秋期 午前' */
  title: string;
  /** 一覧での並び順に使う。新しい試験ほど大きい値(例: 2025.2 = 2025年秋期) */
  order: number;
  /** 画面に表示する出典表記。IPA の過去問題には必ず付ける */
  credit?: string;
  /** 解説が本アプリ独自のものである場合 true */
  authoredExplanation?: boolean;
}

/** 問題文中の表 */
export interface Table {
  caption?: string;
  header?: string[];
  rows: string[][];
}

export interface Question {
  /** 一意なID。学習履歴のキーになるため変更しないこと */
  id: string;
  examId: string;
  /** 試験での問番号。オリジナル問題には無い */
  number?: number;
  field: Field;
  /** 中分類(例: 基礎理論, ネットワーク) */
  category: string;
  question: string;
  /** 問題文の後に表示する表 */
  tables?: Table[];
  /** 問題文の後に表示する図(public/ からの相対パス) */
  figures?: string[];
  /** 選択肢が図で示される場合の図(public/ からの相対パス) */
  choiceFigure?: string;
  /** 選択肢。表示時に ア・イ・ウ・エ が付与される */
  choices: [string, string, string, string];
  /** 正解の選択肢インデックス (0〜3) */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export const CHOICE_LABELS = ['ア', 'イ', 'ウ', 'エ'] as const;
