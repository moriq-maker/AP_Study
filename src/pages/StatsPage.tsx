import { Link } from 'react-router';
import { AmQuestionList } from '../components/QuestionLists';
import { QUESTIONS, WRITTEN_QUESTIONS, questionLabel } from '../data';
import { FIELD_LABELS, type Field } from '../data/types';
import { percent } from '../lib/quiz';
import { amStatus, pmItemKey } from '../lib/userData';
import { useSync } from '../store/SyncContext';
import { useUserData } from '../store/UserDataContext';

interface Row {
  key: string;
  label: string;
  sub?: string;
  answered: number;
  total: number;
  attempts: number;
  correct: number;
  wrong: number;
}

function Bar({ value }: { value: number }) {
  return (
    <span className="bar" aria-hidden="true">
      <span className="bar-fill" style={{ width: `${value}%` }} />
    </span>
  );
}

/** 学習記録: 分野別の正答率と苦手な問題 */
export default function StatsPage() {
  const { data, reset } = useUserData();
  const { account } = useSync();

  // 午前: 中分類ごと
  const amRows = new Map<string, Row>();
  for (const q of QUESTIONS) {
    const row = amRows.get(q.category) ?? {
      key: q.category,
      label: q.category,
      sub: FIELD_LABELS[q.field as Field],
      answered: 0,
      total: 0,
      attempts: 0,
      correct: 0,
      wrong: 0,
    };
    const s = data.am[q.id];
    row.total += 1;
    if (s) {
      row.answered += 1;
      row.attempts += s.attempts;
      row.correct += s.correct;
      if (!s.lastCorrect) row.wrong += 1;
    }
    amRows.set(q.category, row);
  }

  // 午後: 出題分野ごと(解答欄単位)
  const pmRows = new Map<string, Row>();
  for (const q of WRITTEN_QUESTIONS) {
    const row = pmRows.get(q.category) ?? { key: q.category, label: q.category, answered: 0, total: 0, attempts: 0, correct: 0, wrong: 0 };
    q.items.forEach((_, i) => {
      const s = data.pm[pmItemKey(q.id, i)];
      row.total += 1;
      if (s) {
        row.answered += 1;
        row.attempts += s.attempts;
        row.correct += s.correct;
        if (!s.lastCorrect) row.wrong += 1;
      }
    });
    pmRows.set(q.category, row);
  }

  const amAll = [...amRows.values()];
  const amAnswered = amAll.reduce((n, r) => n + r.answered, 0);
  const amAttempts = amAll.reduce((n, r) => n + r.attempts, 0);
  const amCorrect = amAll.reduce((n, r) => n + r.correct, 0);
  const wrongQuestions = QUESTIONS.filter((q) => amStatus(data, q.id) === 'wrong');
  const pmWrong = WRITTEN_QUESTIONS.map((q) => ({
    q,
    items: q.items.filter((_, i) => data.pm[pmItemKey(q.id, i)]?.lastCorrect === false),
  })).filter((x) => x.items.length > 0);

  const confirmReset = () => {
    if (window.confirm(account
          ? '学習記録・ブックマーク・メモをこの端末から削除します。ログイン中のため、次の同期でサーバの記録が戻ります。よろしいですか？'
          : '学習記録・ブックマーク・メモをすべて削除します。よろしいですか？')) reset();
  };

  const renderTable = (rows: Row[], unit: string) => (
    <table className="table stats-table">
      <thead>
        <tr>
          <th>分野</th>
          <th>解答済み</th>
          <th>正答率</th>
          <th>苦手</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const rate = r.attempts === 0 ? null : percent(r.correct, r.attempts);
          return (
            <tr key={r.key}>
              <td>
                <Link to={`/fields/${encodeURIComponent(r.key)}`}>{r.label}</Link>
                {r.sub && <span className="hint"> {r.sub}</span>}
              </td>
              <td>
                {r.answered} / {r.total}
                {unit}
              </td>
              <td>
                {rate === null ? '—' : `${rate}%`} <Bar value={rate ?? 0} />
              </td>
              <td>{r.wrong}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="card">
      <h1>学習記録</h1>
      <div className="score">
        <span>
          午前 解答済み {amAnswered} / {QUESTIONS.length} 問
        </span>
        <span>延べ正答率 {percent(amCorrect, amAttempts)}%</span>
      </div>

      <h2>午前 分野別</h2>
      {renderTable(amAll, '問')}

      <h2>午前 間違えた問題({wrongQuestions.length})</h2>
      {wrongQuestions.length > 0 && (
        <div className="actions">
          <Link className="button primary" to="/practice?mode=weak&count=20">
            間違えた問題を演習する
          </Link>
        </div>
      )}
      <AmQuestionList questions={wrongQuestions} data={data} source="wrong" showExam />

      <h2>午後 分野別(解答欄単位)</h2>
      {renderTable([...pmRows.values()], '欄')}

      <h2>午後 間違えた解答欄</h2>
      {pmWrong.length === 0 ? (
        <p className="hint">該当する解答欄はありません。</p>
      ) : (
        <ul className="library">
          {pmWrong.map(({ q, items }) => (
            <li key={q.id}>
              <Link className="library-row" to={`/pm/${q.id}`}>
                <span className="library-meta">
                  <span>{questionLabel(q)}</span>
                  <span className="tag">{q.category}</span>
                </span>
                <span className="library-title">{items.map((it) => it.label).join('、')}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="hint">
        {account ? 'ログイン中のため、記録は端末間で同期されています。' : '記録はこのブラウザ内に保存されています。'}
        <Link to="/account">{account ? 'アカウント' : 'ログインして端末間で同期する'}</Link>
      </p>
      <div className="actions">
        <span />
        <button className="danger" onClick={confirmReset}>
          記録をリセット
        </button>
      </div>
    </div>
  );
}
