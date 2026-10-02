import { questionLabel } from '../data';
import { FIELD_LABELS, type Field, type Question, type WrittenQuestion } from '../data/types';
import { isWeak, percent } from '../lib/quiz';
import type { History } from '../lib/storage';
import type { WrittenHistory } from '../lib/written';

interface Props {
  questions: readonly Question[];
  history: History;
  writtenQuestions: readonly WrittenQuestion[];
  writtenHistory: WrittenHistory;
  onReset: () => void;
  onHome: () => void;
}

interface Row {
  field: Field;
  category: string;
  total: number;
  answered: number;
  attempts: number;
  correct: number;
  weak: number;
}

export default function Stats({ questions, history, writtenQuestions, writtenHistory, onReset, onHome }: Props) {
  const rows = new Map<string, Row>();
  for (const q of questions) {
    const row = rows.get(q.category) ?? {
      field: q.field,
      category: q.category,
      total: 0,
      answered: 0,
      attempts: 0,
      correct: 0,
      weak: 0,
    };
    const h = history[q.id];
    row.total += 1;
    if (h) {
      row.answered += 1;
      row.attempts += h.attempts;
      row.correct += h.correct;
      if (isWeak(q.id, history)) row.weak += 1;
    }
    rows.set(q.category, row);
  }

  const all = [...rows.values()];
  const answered = all.reduce((n, r) => n + r.answered, 0);
  const attempts = all.reduce((n, r) => n + r.attempts, 0);
  const correct = all.reduce((n, r) => n + r.correct, 0);

  const writtenDone = writtenQuestions.filter((q) => writtenHistory[q.id]);

  const confirmReset = () => {
    if (window.confirm('学習記録をすべて削除します。よろしいですか？')) onReset();
  };

  return (
    <div className="card">
      <h1>学習記録</h1>
      <div className="score">
        <span>
          解答済み {answered} / {questions.length} 問
        </span>
        <span>延べ正答率 {percent(correct, attempts)}%</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>分野</th>
            <th>中分類</th>
            <th>解答済み</th>
            <th>正答率</th>
            <th>苦手</th>
          </tr>
        </thead>
        <tbody>
          {all.map((r) => (
            <tr key={r.category}>
              <td>{FIELD_LABELS[r.field]}</td>
              <td>{r.category}</td>
              <td>
                {r.answered} / {r.total}
              </td>
              <td>{r.attempts === 0 ? '—' : `${percent(r.correct, r.attempts)}%`}</td>
              <td>{r.weak}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>午後問題</h2>
      {writtenDone.length === 0 ? (
        <p className="hint">まだ記録がありません。</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>問題</th>
              <th>分野</th>
              <th>前回</th>
              <th>解答回数</th>
            </tr>
          </thead>
          <tbody>
            {writtenDone.map((q) => {
              const h = writtenHistory[q.id];
              return (
                <tr key={q.id}>
                  <td>{questionLabel(q)}</td>
                  <td>{q.category}</td>
                  <td>{percent(h.lastCorrect, h.total)}%</td>
                  <td>{h.attempts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="hint">記録はこのブラウザ内(localStorage)にのみ保存されます。</p>

      <div className="actions">
        <button className="link" onClick={onHome}>
          トップへ戻る
        </button>
        <button className="danger" onClick={confirmReset} disabled={attempts === 0 && writtenDone.length === 0}>
          記録をリセット
        </button>
      </div>
    </div>
  );
}
