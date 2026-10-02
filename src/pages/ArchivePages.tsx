import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { AmQuestionList, PmQuestionList, ProgressSummary } from '../components/QuestionLists';
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

/** 過去問倉庫のトップ: 試験(年度)の一覧 */
export function ExamsPage() {
  const { data } = useUserData();
  return (
    <div className="card">
      <h1>過去問倉庫</h1>
      <h2>午前</h2>
      <ul className="exam-grid">
        {EXAMS.map((exam) => (
          <li key={exam.id}>
            <Link className="exam-card" to={`/exams/${exam.id}`}>
              <strong>{exam.title}</strong>
              <ProgressSummary {...amProgress(questionsOfExam(exam.id), data)} />
            </Link>
          </li>
        ))}
      </ul>
      <h2>午後</h2>
      <ul className="exam-grid">
        {PM_EXAMS.map((exam) => {
          const qs = writtenQuestionsOfExam(exam.id);
          const answered = qs.filter((q) => pmSummary(data, q.id, q.items.length).answered > 0).length;
          return (
            <li key={exam.id}>
              <Link className="exam-card" to={`/exams/${exam.id}`}>
                <strong>{exam.title}</strong>
                <span className="hint">
                  {qs.length} 問 ・ 着手済み {answered} 問
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
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

function FilterChips({ value, onChange }: { value: AmFilter; onChange: (f: AmFilter) => void }) {
  return (
    <div className="chips chips-flat" role="group" aria-label="絞り込み">
      {(Object.keys(FILTER_LABELS) as AmFilter[]).map((f) => (
        <button key={f} type="button" className={`chip ${value === f ? 'chip-on' : ''}`} aria-pressed={value === f} onClick={() => onChange(f)}>
          {FILTER_LABELS[f]}
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
      <div className="card">
        <nav className="breadcrumb">
          <Link to="/exams">← 過去問倉庫</Link>
        </nav>
        <h1>{exam.title}</h1>
        <p className="hint">問1 は必須、問2〜問11 から 4 問を選択して解答します。</p>
        <PmQuestionList questions={writtenQuestionsOfExam(examId)} data={data} />
        {exam.credit && <p className="hint">{exam.credit}</p>}
      </div>
    );
  }

  const questions = questionsOfExam(examId);
  return (
    <div className="card">
      <nav className="breadcrumb">
        <Link to="/exams">← 過去問倉庫</Link>
      </nav>
      <h1>{exam.title}</h1>
      <ProgressSummary {...amProgress(questions, data)} />
      <div className="actions">
        <Link className="button primary" to={`/practice?exam=${examId}&order=number&count=80`}>
          本番形式で通しで解く
        </Link>
      </div>
      <FilterChips value={filter} onChange={setFilter} />
      <AmQuestionList questions={applyFilter(questions, filter, data)} data={data} />
      {exam.credit && <p className="hint">{exam.credit}</p>}
    </div>
  );
}

/** 分野別: 午前の中分類と午後の出題分野の一覧 */
export function FieldsPage() {
  const { data } = useUserData();
  const fields = Object.keys(FIELD_LABELS) as Field[];
  const pmCategories = [...new Set(WRITTEN_QUESTIONS.map((q) => q.category))];

  return (
    <div className="card">
      <h1>分野別</h1>
      <p className="hint">全年度の問題を分野ごとにまとめて表示します。</p>
      {fields.map((field) => {
        const categories = [...new Set(QUESTIONS.filter((q) => q.field === field).map((q) => q.category))];
        return (
          <section key={field}>
            <h2>午前 {FIELD_LABELS[field]}</h2>
            <ul className="category-list">
              {categories.map((c) => {
                const p = amProgress(questionsOfCategory(c), data);
                return (
                  <li key={c}>
                    <Link to={`/fields/${encodeURIComponent(c)}`}>
                      <span>{c}</span>
                      <span className="hint">
                        {p.total} 問{p.answered > 0 && ` ・ 正答率 ${percent(p.correct, p.answered)}%`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <section>
        <h2>午後</h2>
        <ul className="category-list">
          {pmCategories.map((c) => (
            <li key={c}>
              <Link to={`/fields/${encodeURIComponent(c)}`}>
                <span>{c}</span>
                <span className="hint">{writtenQuestionsOfCategory(c).length} 問</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
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

  return (
    <div className="card">
      <nav className="breadcrumb">
        <Link to="/fields">← 分野別</Link>
      </nav>
      <h1>{category}</h1>
      {am.length > 0 && (
        <section>
          <h2>午前</h2>
          <ProgressSummary {...amProgress(am, data)} />
          <div className="actions">
            <Link className="button primary" to={`/practice?category=${encodeURIComponent(category)}`}>
              この分野をランダムに解く
            </Link>
          </div>
          <FilterChips value={filter} onChange={setFilter} />
          <AmQuestionList questions={applyFilter(am, filter, data)} data={data} source={`cat:${category}`} showExam />
        </section>
      )}
      {pm.length > 0 && (
        <section>
          <h2>午後</h2>
          <PmQuestionList questions={pm} data={data} showExam />
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
    <div className="card">
      <h1>ブックマーク</h1>
      <h2>午前</h2>
      <AmQuestionList questions={amBookmarked} data={data} source="bookmarks" showExam />
      <h2>午後</h2>
      <PmQuestionList questions={pmBookmarked} data={data} showExam />
      <h2>メモのある問題</h2>
      {noted.length === 0 ? (
        <p className="hint">メモはまだありません。問題ページの下部からメモを残せます。</p>
      ) : (
        <ul className="library">
          {noted.map((q) => {
            const isAm = 'choices' in q;
            return (
              <li key={q.id}>
                <Link className="library-row" to={isAm ? `/q/${q.id}` : `/pm/${q.id}`}>
                  <span className="library-meta">
                    <span>{getExam(q.examId)?.title} 問{q.number}</span>
                  </span>
                  <span className="note-preview">{data.notes[q.id].text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
