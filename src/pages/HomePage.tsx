import { Link } from 'react-router';
import { ArrowRight, BookOpen, CircleCheck, Flame, RotateCcw, Shuffle, Target, Trophy } from 'lucide-react';
import { ProgressBar, ProgressRing, StatTile } from '../components/ui';
import {
  EXAMS,
  PM_EXAMS,
  QUESTIONS,
  WRITTEN_QUESTIONS,
  getQuestion,
  getWrittenQuestion,
  questionLabel,
  questionsOfExam,
} from '../data';
import { FIELD_LABELS, type Field } from '../data/types';
import { percent } from '../lib/quiz';
import { amStatus, answeredToday, studyStreak } from '../lib/userData';
import { useSync } from '../store/SyncContext';
import { useUserData } from '../store/UserDataContext';

const FIELD_TONE = { technology: 'tech', management: 'mgmt', strategy: 'strat' } as const;

function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'こんばんは';
  if (h < 11) return 'おはようございます';
  if (h < 18) return 'こんにちは';
  return 'こんばんは';
}

/** ホーム: 今日の学習状況と各機能への入口 */
export default function HomePage() {
  const { data } = useUserData();
  const { account } = useSync();

  const past = QUESTIONS.filter((q) => q.examId !== 'original');
  const answered = past.filter((q) => amStatus(data, q.id) !== 'unanswered');
  const correct = answered.filter((q) => amStatus(data, q.id) === 'correct').length;
  const wrong = answered.length - correct;
  const streak = studyStreak(data);
  const today = answeredToday(data);

  // 新しい試験から順に、まだ解いていない最初の問題
  const nextQuestion = past.find((q) => amStatus(data, q.id) === 'unanswered');

  // 最近解いた問題(午前・午後をまとめて新しい順に 5 件)
  const recent = [
    ...Object.entries(data.am).map(([id, s]) => ({ id, at: s.updatedAt, pm: false })),
    ...Object.entries(data.pm).map(([key, s]) => ({ id: key.split('#')[0], at: s.updatedAt, pm: true })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i)
    .slice(0, 5);

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-text">
          <p className="hero-greeting">{greeting()}</p>
          <h1>今日も 1 問から積み上げよう</h1>
          <p className="hero-sub">
            {streak > 0 ? (
              <>
                <Flame size={16} aria-hidden="true" /> {streak} 日連続で学習中
              </>
            ) : (
              '今日の 1 問目を解いて、連続学習をはじめましょう'
            )}
          </p>
          <div className="hero-actions">
            {nextQuestion && (
              <Link className="btn btn-light" to={`/q/${nextQuestion.id}`}>
                <BookOpen size={18} aria-hidden="true" />
                続きから解く
              </Link>
            )}
            <Link className="btn btn-ghost-light" to="/practice?count=10">
              <Shuffle size={18} aria-hidden="true" />
              ランダム 10 問
            </Link>
          </div>
        </div>
        <ProgressRing value={percent(answered.length, past.length)} size={112} stroke={10} tone="ok" label={
          <>
            <strong>{percent(answered.length, past.length)}%</strong>
            <small>午前 進捗</small>
          </>
        } />
      </section>

      <section className="stat-grid">
        <StatTile icon={Flame} label="連続学習" value={streak} unit="日" tone="warn" />
        <StatTile icon={Target} label="今日解いた数" value={today} unit="問" />
        <StatTile icon={CircleCheck} label="午前 解答済み" value={answered.length} unit={`/ ${past.length}`} tone="ok" />
        <StatTile icon={Trophy} label="午前 正答率" value={answered.length ? percent(correct, answered.length) : '—'} unit={answered.length ? '%' : ''} />
      </section>

      {wrong > 0 && (
        <Link to="/practice?mode=weak&count=10" className="callout">
          <RotateCcw size={20} aria-hidden="true" />
          <span>
            <strong>苦手を復習</strong>
            <small>前回間違えた問題が {wrong} 問あります</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}

      <section className="section">
        <div className="section-head">
          <h2>分野別の進捗</h2>
          <Link to="/fields">すべて見る</Link>
        </div>
        <div className="field-cards">
          {(Object.keys(FIELD_LABELS) as Field[]).map((field) => {
            const qs = past.filter((q) => q.field === field);
            const done = qs.filter((q) => amStatus(data, q.id) !== 'unanswered');
            const ok = done.filter((q) => amStatus(data, q.id) === 'correct').length;
            return (
              <Link key={field} to={`/fields#${field}`} className={`field-card tone-${FIELD_TONE[field]}`}>
                <ProgressRing value={percent(done.length, qs.length)} size={56} stroke={6} tone={FIELD_TONE[field]} />
                <span>
                  <strong>{FIELD_LABELS[field]}</strong>
                  <small>
                    {done.length} / {qs.length} 問{done.length > 0 && ` ・ 正答率 ${percent(ok, done.length)}%`}
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>試験から解く</h2>
          <Link to="/exams">過去問倉庫へ</Link>
        </div>
        <div className="exam-scroller">
          {EXAMS.filter((e) => e.id !== 'original').map((exam) => {
            const qs = questionsOfExam(exam.id);
            const done = qs.filter((q) => amStatus(data, q.id) !== 'unanswered').length;
            return (
              <Link key={exam.id} to={`/exams/${exam.id}`} className="exam-tile">
                <span className="exam-tile-badge">午前</span>
                <strong>{exam.title.replace(' 午前', '')}</strong>
                <ProgressBar value={percent(done, qs.length)} />
                <small>
                  {done} / {qs.length} 問
                </small>
              </Link>
            );
          })}
          {PM_EXAMS.map((exam) => (
            <Link key={exam.id} to={`/exams/${exam.id}`} className="exam-tile exam-tile-pm">
              <span className="exam-tile-badge">午後</span>
              <strong>{exam.title.replace(' 午後', '')}</strong>
              <small>{WRITTEN_QUESTIONS.filter((q) => q.examId === exam.id).length} 問</small>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>最近解いた問題</h2>
          </div>
          <ul className="list-card">
            {recent.map((r) => {
              const q = r.pm ? getWrittenQuestion(r.id) : getQuestion(r.id);
              if (!q) return null;
              return (
                <li key={r.id}>
                  <Link to={r.pm ? `/pm/${r.id}` : `/q/${r.id}`} className="list-row">
                    <span className="list-main">
                      <strong>{questionLabel(q)}</strong>
                      <small>{q.category}</small>
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!account && (
        <Link to="/account" className="callout callout-muted">
          <span>
            <strong>ログインして端末間で同期</strong>
            <small>PC とスマホで同じ記録を使えます</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
