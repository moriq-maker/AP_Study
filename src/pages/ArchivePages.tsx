import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ChevronRight, FileText, Play, Shuffle } from 'lucide-react';
import { AmQuestionList, PmQuestionList } from '../components/QuestionLists';
import { PageHeader, ProgressBar, ProgressRing } from '../components/ui';
import {
  EXAMS,
  PM_EXAMS,
  QUESTIONS,
  WRITTEN_QUESTIONS,
  getExam,
  isPmExam,
  questionsOfCategory,
  questionsOfExam,
  writtenQuestionsOfCategory,
  writtenQuestionsOfExam,
} from '../data';
import { FIELD_LABELS, type Field, type Question } from '../data/types';
import { percent } from '../lib/quiz';
import { amStatus, isBookmarked, pmSummary, type UserData } from '../lib/userData';
import { useUserData } from '../store/UserDataContext';
import NotFound from './NotFound';

const FIELD_TONE = { technology: 'tech', management: 'mgmt', strategy: 'strat' } as const;

function amProgress(questions: readonly Question[], data: UserData) {
  let answered = 0;
  let correct = 0;
  for (const q of questions) {
    const s = amStatus(data, q.id);
    if (s !== 'unanswered') answered += 1;
    if (s === 'correct') correct += 1;
  }
  return { answered, correct, total: questions.length };
}

/** 解答済み・正答率・残りの 3 つを並べる */
function ProgressStrip({ answered, correct, total }: { answered: number; correct: number; total: number }) {
  return (
    <div className="progress-strip">
      <ProgressRing value={percent(answered, total)} size={72} stroke={8} />
      <dl>
        <div>
          <dt>解答済み</dt>
          <dd>
            {answered}
            <small> / {total}</small>
          </dd>
        </div>
        <div>
          <dt>正答率</dt>
          <dd>{answered > 0 ? <>{percent(correct, answered)}<small>%</small></> : '—'}</dd>
        </div>
        <div>
          <dt>不正解</dt>
          <dd>{answered - correct}</dd>
        </div>
      </dl>
    </div>
  );
}

/** 過去問倉庫のトップ: 試験(年度)の一覧 */
export function ExamsPage() {
  const { data } = useUserData();
  return (
    <div className="page">
      <PageHeader title="過去問倉庫" subtitle="年度を選んで、問題の一覧から 1 問ずつ解けます。" />

      <section className="section">
        <div className="section-head">
          <h2>午前(四肢択一・80 問)</h2>
        </div>
        <ul className="exam-grid">
          {EXAMS.map((exam) => {
            const p = amProgress(questionsOfExam(exam.id), data);
            return (
              <li key={exam.id}>
                <Link className="exam-card" to={`/exams/${exam.id}`}>
                  <ProgressRing value={percent(p.answered, p.total)} size={56} stroke={6} />
                  <span className="exam-card-body">
                    <strong>{exam.title}</strong>
                    <small>
                      {p.answered} / {p.total} 問{p.answered > 0 && ` ・ 正答率 ${percent(p.correct, p.answered)}%`}
                    </small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>午後(記述式・11 問から 5 問選択)</h2>
        </div>
        <ul className="exam-grid">
          {PM_EXAMS.map((exam) => {
            const qs = writtenQuestionsOfExam(exam.id);
            const answered = qs.filter((q) => pmSummary(data, q.id, q.items.length).answered > 0).length;
            return (
              <li key={exam.id}>
                <Link className="exam-card exam-card-pm" to={`/exams/${exam.id}`}>
                  <span className="exam-card-icon">
                    <FileText size={24} aria-hidden="true" />
                  </span>
                  <span className="exam-card-body">
                    <strong>{exam.title}</strong>
                    <small>
                      {qs.length} 問 ・ 着手済み {answered} 問
                    </small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

type AmFilter = 'all' | 'unanswered' | 'wrong' | 'bookmarked';
const FILTER_LABELS: Record<AmFilter, string> = {
  all: 'すべて',
  unanswered: '未解答',
  wrong: '不正解',
  bookmarked: 'ブックマーク',
};

function applyFilter(questions: readonly Question[], filter: AmFilter, data: UserData): Question[] {
  return questions.filter((q) => {
    if (filter === 'unanswered') return amStatus(data, q.id) === 'unanswered';
    if (filter === 'wrong') return amStatus(data, q.id) === 'wrong';
    if (filter === 'bookmarked') return isBookmarked(data, q.id);
    return true;
  });
}

function FilterChips({ value, onChange, questions, data }: { value: AmFilter; onChange: (f: AmFilter) => void; questions: readonly Question[]; data: UserData }) {
  return (
    <div className="filter-tabs" role="group" aria-label="絞り込み">
      {(Object.keys(FILTER_LABELS) as AmFilter[]).map((f) => (
        <button key={f} type="button" className={value === f ? 'on' : ''} aria-pressed={value === f} onClick={() => onChange(f)}>
          {FILTER_LABELS[f]}
          <span className="count">{applyFilter(questions, f, data).length}</span>
        </button>
      ))}
    </div>
  );
}

/** 試験(年度)ごとの問題一覧 */
export function ExamPage() {
  const { examId = '' } = useParams();
  const exam = getExam(examId);
  const { data } = useUserData();
  const [filter, setFilter] = useState<AmFilter>('all');
  if (!exam) return <NotFound />;

  if (isPmExam(examId)) {
    return (
      <div className="page">
        <PageHeader back={{ to: '/exams', label: '過去問倉庫' }} title={exam.title} subtitle="問1 は必須、問2〜問11 から 4 問を選択して解答します。" />
        <section className="panel panel-flush">
          <PmQuestionList questions={writtenQuestionsOfExam(examId)} data={data} />
        </section>
        {exam.credit && <p className="credit">{exam.credit}</p>}
      </div>
    );
  }

  const questions = questionsOfExam(examId);
  const isOriginal = examId === 'original';
  return (
    <div className="page">
      <PageHeader
        back={{ to: '/exams', label: '過去問倉庫' }}
        title={exam.title}
        actions={
          <Link className="btn btn-primary" to={`/practice?exam=${examId}&order=number&count=80`}>
            <Play size={18} aria-hidden="true" />
            {isOriginal ? '通しで解く' : '本番形式で通しで解く'}
          </Link>
        }
      />
      <section className="panel">
        <ProgressStrip {...amProgress(questions, data)} />
      </section>
      <FilterChips value={filter} onChange={setFilter} questions={questions} data={data} />
      <section className="panel panel-flush">
        <AmQuestionList questions={applyFilter(questions, filter, data)} data={data} />
      </section>
      {exam.credit && <p className="credit">{exam.credit}</p>}
    </div>
  );
}

/** 分野別: 午前の中分類と午後の出題分野の一覧 */
export function FieldsPage() {
  const { data } = useUserData();
  const { hash } = useLocation();
  const fields = Object.keys(FIELD_LABELS) as Field[];
  const pmCategories = [...new Set(WRITTEN_QUESTIONS.map((q) => q.category))];

  // ホームの分野カードから来たときは、その分野の位置までスクロールする
  useEffect(() => {
    if (!hash) return;
    const id = requestAnimationFrame(() => document.getElementById(`field-${hash.slice(1)}`)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(id);
  }, [hash]);

  return (
    <div className="page">
      <PageHeader title="分野別" subtitle="全年度の問題を分野ごとにまとめて表示します。" />
      <div className="field-sections">
        {fields.map((field) => {
          const fieldQuestions = QUESTIONS.filter((q) => q.field === field);
          const categories = [...new Set(fieldQuestions.map((q) => q.category))];
          const p = amProgress(fieldQuestions, data);
          return (
            <section key={field} id={`field-${field}`} className={`panel field-panel tone-${FIELD_TONE[field]}`}>
              <div className="field-panel-head">
                <ProgressRing value={percent(p.answered, p.total)} size={52} stroke={6} tone={FIELD_TONE[field]} />
                <div>
                  <span className="eyebrow">午前</span>
                  <h2>{FIELD_LABELS[field]}</h2>
                  <small className="hint">
                    {p.answered} / {p.total} 問{p.answered > 0 && ` ・ 正答率 ${percent(p.correct, p.answered)}%`}
                  </small>
                </div>
              </div>
              <ul className="category-list">
                {categories.map((c) => {
                  const cp = amProgress(questionsOfCategory(c), data);
                  return (
                    <li key={c}>
                      <Link to={`/fields/${encodeURIComponent(c)}`}>
                        <span className="category-name">{c}</span>
                        <span className="category-stat">
                          <ProgressBar value={percent(cp.answered, cp.total)} tone={FIELD_TONE[field]} />
                          <small>
                            {cp.answered}/{cp.total}
                          </small>
                        </span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        <section className="panel field-panel tone-pm">
          <div className="field-panel-head">
            <span className="field-panel-icon">
              <FileText size={24} aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">午後</span>
              <h2>出題分野</h2>
              <small className="hint">{WRITTEN_QUESTIONS.length} 問</small>
            </div>
          </div>
          <ul className="category-list">
            {pmCategories.map((c) => (
              <li key={c}>
                <Link to={`/fields/${encodeURIComponent(c)}`}>
                  <span className="category-name">{c}</span>
                  <span className="category-stat">
                    <small>{writtenQuestionsOfCategory(c).length} 問</small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** 分野(中分類)ごとの問題一覧。同名の午後の出題分野があれば併せて表示する */
export function CategoryPage() {
  const { category = '' } = useParams();
  const { data } = useUserData();
  const [filter, setFilter] = useState<AmFilter>('all');
  const am = questionsOfCategory(category);
  const pm = writtenQuestionsOfCategory(category);
  if (am.length === 0 && pm.length === 0) return <NotFound />;
  const field = am[0]?.field;

  return (
    <div className="page">
      <PageHeader
        back={{ to: field ? `/fields#${field}` : '/fields', label: '分野別' }}
        title={category}
        subtitle={field ? `午前 ${FIELD_LABELS[field]}` : '午後'}
        actions={
          am.length > 0 && (
            <Link className="btn btn-primary" to={`/practice?category=${encodeURIComponent(category)}`}>
              <Shuffle size={18} aria-hidden="true" />
              ランダムに解く
            </Link>
          )
        }
      />
      {am.length > 0 && (
        <>
          <section className="panel">
            <ProgressStrip {...amProgress(am, data)} />
          </section>
          <FilterChips value={filter} onChange={setFilter} questions={am} data={data} />
          <section className="panel panel-flush">
            <AmQuestionList questions={applyFilter(am, filter, data)} data={data} source={`cat:${category}`} showExam />
          </section>
        </>
      )}
      {pm.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>午後</h2>
          </div>
          <div className="panel panel-flush">
            <PmQuestionList questions={pm} data={data} showExam />
          </div>
        </section>
      )}
    </div>
  );
}

/** ブックマークとメモのある問題 */
export function BookmarksPage() {
  const { data } = useUserData();
  const amBookmarked = QUESTIONS.filter((q) => isBookmarked(data, q.id));
  const pmBookmarked = WRITTEN_QUESTIONS.filter((q) => isBookmarked(data, q.id));
  const noted = [...QUESTIONS, ...WRITTEN_QUESTIONS].filter((q) => data.notes[q.id]?.text);

  return (
    <div className="page">
      <PageHeader title="ブックマーク" subtitle="あとで見直したい問題と、メモを残した問題です。" />
      <section className="section">
        <div className="section-head">
          <h2>午前({amBookmarked.length})</h2>
        </div>
        <div className="panel panel-flush">
          <AmQuestionList questions={amBookmarked} data={data} source="bookmarks" showExam />
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>午後({pmBookmarked.length})</h2>
        </div>
        <div className="panel panel-flush">
          <PmQuestionList questions={pmBookmarked} data={data} showExam />
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>メモのある問題({noted.length})</h2>
        </div>
        <div className="panel panel-flush">
          {noted.length === 0 ? (
            <p className="empty">メモはまだありません。問題ページからメモを残せます。</p>
          ) : (
            <ul className="library">
              {noted.map((q) => {
                const isAm = 'choices' in q;
                return (
                  <li key={q.id}>
                    <Link className="library-row" to={isAm ? `/q/${q.id}` : `/pm/${q.id}`}>
                      <span className="library-body">
                        <span className="library-meta">
                          <span>
                            {getExam(q.examId)?.title} 問{q.number}
                          </span>
                        </span>
                        <span className="note-preview">{data.notes[q.id].text}</span>
                      </span>
                      <ChevronRight className="library-chevron" size={18} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
