import { Link } from 'react-router';
import { ChevronRight, CircleCheck, Flame, PenLine, RotateCcw, Trash2, Trophy } from 'lucide-react';
import { PageHeader, ProgressBar, StatTile } from '../components/ui';
import { AmQuestionList } from '../components/QuestionLists';
import { QUESTIONS, WRITTEN_QUESTIONS, questionLabel } from '../data';
import { FIELD_LABELS, type Field } from '../data/types';
import { percent } from '../lib/quiz';
import { amStatus, pmItemKey, studyStreak } from '../lib/userData';
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

  const renderRows = (rows: Row[], unit: string) => (
    <ul className="panel score-rows stats-rows">
      {rows.map((r) => {
        const rate = r.attempts === 0 ? null : percent(r.correct, r.attempts);
        return (
          <li key={r.key}>
            <Link to={`/fields/${encodeURIComponent(r.key)}`} className="stats-row">
              <span className="category-name">
                {r.label}
                {r.sub && <small>{r.sub}</small>}
              </span>
              <ProgressBar value={rate ?? 0} tone={rate !== null && rate >= 60 ? 'ok' : 'primary'} />
              <span className="score-num">{rate === null ? '—' : `${rate}%`}</span>
              <span className="stats-detail">
                {r.answered}/{r.total}
                {unit}
                {r.wrong > 0 && <em> ・ 苦手 {r.wrong}</em>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const pmAll = [...pmRows.values()];
  const pmAnswered = pmAll.reduce((n, r) => n + r.answered, 0);
  const pmTotal = pmAll.reduce((n, r) => n + r.total, 0);
  const streak = studyStreak(data);

  return (
    <div className="page">
      <PageHeader title="学習記録" subtitle="分野ごとの正答率と、間違えた問題を確認できます。" />

      <section className="stat-grid">
        <StatTile icon={Flame} label="連続学習" value={streak} unit="日" tone="warn" />
        <StatTile icon={CircleCheck} label="午前 解答済み" value={amAnswered} unit={`/ ${QUESTIONS.length}`} tone="ok" />
        <StatTile icon={Trophy} label="午前 延べ正答率" value={amAttempts ? percent(amCorrect, amAttempts) : '—'} unit={amAttempts ? '%' : ''} />
        <StatTile icon={PenLine} label="午後 解答した欄" value={pmAnswered} unit={`/ ${pmTotal}`} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>午前 分野別</h2>
        </div>
        {renderRows(amAll, '問')}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>午前 間違えた問題({wrongQuestions.length})</h2>
          {wrongQuestions.length > 0 && (
            <Link className="btn btn-primary btn-sm" to="/practice?mode=weak&count=20">
              <RotateCcw size={16} aria-hidden="true" />
              まとめて復習
            </Link>
          )}
        </div>
        <div className="panel panel-flush">
          <AmQuestionList questions={wrongQuestions} data={data} source="wrong" showExam />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>午後 分野別(解答欄単位)</h2>
        </div>
        {renderRows(pmAll, '欄')}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>午後 間違えた解答欄</h2>
        </div>
        <div className="panel panel-flush">
          {pmWrong.length === 0 ? (
            <p className="empty">該当する解答欄はありません。</p>
          ) : (
            <ul className="library">
              {pmWrong.map(({ q, items }) => (
                <li key={q.id}>
                  <Link className="library-row row-wrong" to={`/pm/${q.id}`}>
                    <span className="library-num">{q.number}</span>
                    <span className="library-body">
                      <span className="library-meta">
                        <span>{questionLabel(q)}</span>
                        <span className="tag">{q.category}</span>
                      </span>
                      <span className="library-title">{items.map((it) => it.label).join('、')}</span>
                    </span>
                    <ChevronRight className="library-chevron" size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel data-panel">
        <p className="hint">
          {account ? 'ログイン中のため、記録は端末間で同期されています。' : '記録はこのブラウザ内に保存されています。'}{' '}
          <Link to="/account">{account ? 'アカウント' : 'ログインして端末間で同期する'}</Link>
        </p>
        <button className="btn btn-danger-ghost btn-sm" onClick={confirmReset}>
          <Trash2 size={16} aria-hidden="true" />
          記録をリセット
        </button>
      </section>
    </div>
  );
}
