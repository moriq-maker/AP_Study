import { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { PageHeader } from './ui';
import { FIELD_LABELS, type Exam, type Field, type Question } from '../data/types';
import { filterQuestions, type History, type QuizMode, type QuizOrder, type QuizSettings } from '../lib/quiz';

interface Props {
  exams: readonly Exam[];
  questions: readonly Question[];
  history: History;
  /** URL などから渡す初期設定 */
  initial?: Partial<QuizSettings>;
  onStart: (settings: QuizSettings) => void;
}

const ALL_FIELDS = Object.keys(FIELD_LABELS) as Field[];
const FIELD_TONE = { technology: 'tech', management: 'mgmt', strategy: 'strat' } as const;
const COUNT_OPTIONS = [5, 10, 20, 80];
const MODE_LABELS: Record<QuizMode, string> = {
  random: 'すべての問題',
  weak: '苦手(前回不正解)',
  unanswered: '未解答',
};
const ORDER_LABELS: Record<QuizOrder, string> = {
  shuffle: 'ランダム',
  number: '問番号順',
};

export default function PracticeSettings({ exams, questions, history, initial = {}, onStart }: Props) {
  const [examIds, setExamIds] = useState<string[]>(initial.examIds ?? []);
  const [fields, setFields] = useState<Field[]>(initial.fields ?? ALL_FIELDS);
  const [categories, setCategories] = useState<string[]>(initial.categories ?? []);
  const [count, setCount] = useState(initial.count ?? 10);
  const [mode, setMode] = useState<QuizMode>(initial.mode ?? 'random');
  const [order, setOrder] = useState<QuizOrder>(initial.order ?? 'shuffle');

  const countByExam = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of questions) map.set(q.examId, (map.get(q.examId) ?? 0) + 1);
    return map;
  }, [questions]);

  // 選択中の試験に含まれる中分類だけを表示する
  const categoriesByField = useMemo(() => {
    const map = new Map<Field, string[]>();
    for (const q of questions) {
      if (examIds.length > 0 && !examIds.includes(q.examId)) continue;
      const list = map.get(q.field) ?? [];
      if (!list.includes(q.category)) list.push(q.category);
      map.set(q.field, list);
    }
    return map;
  }, [questions, examIds]);

  const visibleCategories = categories.filter((c) =>
    fields.some((f) => categoriesByField.get(f)?.includes(c)),
  );

  const available = filterQuestions(questions, { examIds, fields, categories: visibleCategories, mode }, history).length;

  const toggleExam = (id: string) => {
    setExamIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const toggleField = (f: Field) => {
    setFields((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]));
  };

  const toggleCategory = (c: string) => {
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  };

  return (
    <div className="page">
      <PageHeader title="演習" subtitle="条件を選んで、午前問題を連続で解きます。" />

      <div className="settings-grid">
        <section className="panel settings-block">
          <h2>試験</h2>
          <div className="chips">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`chip ${examIds.includes(e.id) ? 'chip-on' : ''}`}
                aria-pressed={examIds.includes(e.id)}
                onClick={() => toggleExam(e.id)}
              >
                {e.title}
                <span className="count">{countByExam.get(e.id) ?? 0}</span>
              </button>
            ))}
          </div>
          <p className="hint">選ばない場合は、すべての試験から出題します。</p>
        </section>

        <section className="panel settings-block">
          <h2>分野</h2>
          {ALL_FIELDS.map((f) => (
            <div key={f} className={`field-group tone-${FIELD_TONE[f]}`}>
              <label className="checkbox">
                <input type="checkbox" checked={fields.includes(f)} onChange={() => toggleField(f)} />
                <strong>{FIELD_LABELS[f]}</strong>
              </label>
              {fields.includes(f) && (
                <div className="chips chips-indent">
                  {(categoriesByField.get(f) ?? []).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`chip chip-sm ${categories.includes(c) ? 'chip-on' : ''}`}
                      aria-pressed={categories.includes(c)}
                      onClick={() => toggleCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <p className="hint">中分類を選ばない場合は、チェックした分野のすべてから出題します。</p>
        </section>

        <section className="panel settings-block">
          <h2>出題対象</h2>
          <OptionGroup name="mode" label="出題対象" labels={MODE_LABELS} value={mode} onChange={setMode} />
          <h2>出題順</h2>
          <OptionGroup name="order" label="出題順" labels={ORDER_LABELS} value={order} onChange={setOrder} />
          <h2>問題数</h2>
          <OptionGroup
            name="count"
            label="問題数"
            labels={Object.fromEntries(COUNT_OPTIONS.map((n) => [String(n), n === 80 ? '80問(本番)' : `${n}問`]))}
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
          />
        </section>
      </div>

      <div className="action-bar">
        <span className="action-bar-info">
          対象 <strong>{available}</strong> 問
        </span>
        <button
          className="btn btn-primary btn-grow"
          disabled={available === 0}
          onClick={() => onStart({ examIds, fields, categories: visibleCategories, count, mode, order })}
        >
          <Play size={18} aria-hidden="true" />
          {available === 0 ? '対象の問題がありません' : `${Math.min(count, available)}問を開始`}
        </button>
      </div>
    </div>
  );
}

/** ラジオボタンをボタン風に並べた単一選択 */
function OptionGroup<T extends string>({
  name,
  label,
  labels,
  value,
  onChange,
}: {
  name: string;
  label: string;
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="option-group" role="radiogroup" aria-label={label}>
      {(Object.keys(labels) as T[]).map((k) => (
        <label key={k} className={`option ${value === k ? 'option-on' : ''}`}>
          <input type="radio" name={name} checked={value === k} onChange={() => onChange(k)} />
          {labels[k]}
        </label>
      ))}
    </div>
  );
}
