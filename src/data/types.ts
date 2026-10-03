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

/**
 * 午後(記述式)の解答欄一つ分。
 * - exact: 解答例と表記ゆれを除いて一致すれば自動で正解にする(記号・数値・用語)
 * - free: 文章で答える設問。解答例を見て自己採点する
 */
export interface WrittenItem {
  /** 例: '設問1 a' */
  label: string;
  /** 解答例(公式) */
  answer: string;
  kind: 'exact' | 'free';
  /** 解答例に併記されている別解 */
  accept?: string[];
  /** 「順不同」の解答欄に同じ値を付ける。グループ内では解答例をどの順で書いても正解 */
  unordered?: string;
}

export interface WrittenQuestion {
  /** 一意なID。学習記録のキーになるため変更しないこと */
  id: string;
  examId: string;
  number: number;
  /** 出題分野(例: 情報セキュリティ) */
  category: string;
  theme: string;
  /** 必須問題か */
  required?: boolean;
  /** 問題冊子のページ画像(public/ からの相対パス) */
  pages: string[];
  /** 問題を読むのに必要な共通ページ(擬似言語の記述形式など) */
  referencePages?: string[];
  /** referencePages の見出し。省略時は「共通の記述形式(参考ページ)」 */
  referenceLabel?: string;
  /** 出題趣旨(公式) */
  aim: string;
  items: WrittenItem[];
}
