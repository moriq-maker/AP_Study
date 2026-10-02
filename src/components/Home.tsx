import { useMemo, useState } from 'react';
import { FIELD_LABELS, type Exam, type Field, type Question } from '../data/types';
import { filterQuestions, type QuizMode, type QuizOrder, type QuizSettings } from '../lib/quiz';
import type { History } from '../lib/storage';

interface Props {
  exams: readonly Exam[];
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
const ORDER_LABELS: Record<QuizOrder, string> = {
  shuffle: 'ランダム',
  number: '問番号順(本番形式)',
};

export default function Home({ exams, questions, history, onStart }: Props) {
  const [examIds, setExamIds] = useState<string[]>([]);
  const [fields, setFields] = useState<Field[]>(ALL_FIELDS);
  const [categories, setCategories] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<QuizMode>('random');
  const [order, setOrder] = useState<QuizOrder>('shuffle');

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
    <div className="card">
      <h1>出題設定</h1>

      <section>
        <h2>試験</h2>
        <div className="chips chips-flat">
          {exams.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`chip ${examIds.includes(e.id) ? 'chip-on' : ''}`}
              aria-pressed={examIds.includes(e.id)}
              onClick={() => toggleExam(e.id)}
            >
              {e.title}({countByExam.get(e.id) ?? 0})
            </button>
          ))}
        </div>
        <p className="hint">試験を選ばない場合は、すべての試験から出題します。</p>
      </section>

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
        <h2>出題順</h2>
        <div className="radios">
          {(Object.keys(ORDER_LABELS) as QuizOrder[]).map((o) => (
            <label key={o} className="radio">
              <input type="radio" name="order" checked={order === o} onChange={() => setOrder(o)} />
              {ORDER_LABELS[o]}
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
          onClick={() => onStart({ examIds, fields, categories: visibleCategories, count, mode, order })}
        >
          {available === 0 ? '対象の問題がありません' : `${Math.min(count, available)}問を開始`}
        </button>
      </div>
    </div>
  );
}
