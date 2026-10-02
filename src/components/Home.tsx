import { useMemo, useState } from 'react';
import { FIELD_LABELS, type Field, type Question } from '../data/types';
import { filterQuestions, type QuizMode, type QuizSettings } from '../lib/quiz';
import type { History } from '../lib/storage';

interface Props {
  questions: readonly Question[];
  history: History;
  onStart: (settings: QuizSettings) => void;
}

const ALL_FIELDS = Object.keys(FIELD_LABELS) as Field[];
const COUNT_OPTIONS = [5, 10, 20, 80];
const MODE_LABELS: Record<QuizMode, string> = {
  random: 'すべての問題',
  weak: '苦手な問題(前回不正解)',
  unanswered: '未解答の問題',
};

export default function Home({ questions, history, onStart }: Props) {
  const [fields, setFields] = useState<Field[]>(ALL_FIELDS);
  const [categories, setCategories] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<QuizMode>('random');

  const categoriesByField = useMemo(() => {
    const map = new Map<Field, string[]>();
    for (const q of questions) {
      const list = map.get(q.field) ?? [];
      if (!list.includes(q.category)) list.push(q.category);
      map.set(q.field, list);
    }
    return map;
  }, [questions]);

  const available = filterQuestions(questions, { fields, categories, mode }, history).length;

  const toggleField = (f: Field) => {
    const next = fields.includes(f) ? fields.filter((x) => x !== f) : [...fields, f];
    setFields(next);
    // 外した大分類に属する中分類の選択は解除する
    setCategories((cs) => cs.filter((c) => next.some((nf) => categoriesByField.get(nf)?.includes(c))));
  };

  const toggleCategory = (c: string) => {
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  };

  return (
    <div className="card">
      <h1>出題設定</h1>

      <section>
        <h2>分野</h2>
        {ALL_FIELDS.map((f) => (
          <div key={f} className="field-group">
            <label className="checkbox">
              <input type="checkbox" checked={fields.includes(f)} onChange={() => toggleField(f)} />
              <strong>{FIELD_LABELS[f]}</strong>
            </label>
            {fields.includes(f) && (
              <div className="chips">
                {(categoriesByField.get(f) ?? []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${categories.includes(c) ? 'chip-on' : ''}`}
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

      <section>
        <h2>出題対象</h2>
        <div className="radios">
          {(Object.keys(MODE_LABELS) as QuizMode[]).map((m) => (
            <label key={m} className="radio">
              <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} />
              {MODE_LABELS[m]}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2>問題数</h2>
        <div className="radios">
          {COUNT_OPTIONS.map((n) => (
            <label key={n} className="radio">
              <input type="radio" name="count" checked={count === n} onChange={() => setCount(n)} />
              {n === 80 ? '80問(本番と同数)' : `${n}問`}
            </label>
          ))}
        </div>
      </section>

      <div className="actions">
        <span className="hint">対象: {available}問</span>
        <button
          className="primary"
          disabled={available === 0}
          onClick={() => onStart({ fields, categories, count, mode })}
        >
          {available === 0 ? '対象の問題がありません' : `${Math.min(count, available)}問を開始`}
        </button>
      </div>
    </div>
  );
}
