import { useMemo, useState } from 'react';
import { getExam, questionLabel } from '../data';
import { CHOICE_LABELS, FIELD_LABELS, type Exam, type Field, type Question } from '../data/types';
import type { History } from '../lib/storage';
import QuestionBody from './QuestionBody';

interface Props {
  exams: readonly Exam[];
  questions: readonly Question[];
  history: History;
  onHome: () => void;
}

const PAGE_SIZE = 30;

function statusOf(q: Question, history: History): { label: string; className: string } {
  const h = history[q.id];
  if (!h) return { label: '未解答', className: 'status' };
  return h.lastCorrect ? { label: '正解', className: 'status status-ok' } : { label: '不正解', className: 'status status-ng' };
}

export default function Library({ exams, questions, history, onHome }: Props) {
  const [examId, setExamId] = useState('');
  const [field, setField] = useState<Field | ''>('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => [...new Set(questions.filter((q) => !field || q.field === field).map((q) => q.category))],
    [questions, field],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return questions.filter(
      (q) =>
        (!examId || q.examId === examId) &&
        (!field || q.field === field) &&
        (!category || q.category === category) &&
        (!kw || [q.question, ...q.choices, q.explanation].some((t) => t.toLowerCase().includes(kw))),
    );
  }, [questions, examId, field, category, keyword]);

  const resetPaging = () => {
    setLimit(PAGE_SIZE);
    setOpenId(null);
  };

  return (
    <div className="card">
      <h1>午前問題一覧</h1>
      <div className="filters">
        <select
          value={examId}
          onChange={(e) => {
            setExamId(e.target.value);
            resetPaging();
          }}
          aria-label="試験"
        >
          <option value="">すべての試験</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        <select
          value={field}
          onChange={(e) => {
            setField(e.target.value as Field | '');
            setCategory('');
            resetPaging();
          }}
          aria-label="分野"
        >
          <option value="">すべての分野</option>
          {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
            <option key={f} value={f}>
              {FIELD_LABELS[f]}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            resetPaging();
          }}
          aria-label="中分類"
        >
          <option value="">すべての中分類</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="キーワード検索"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            resetPaging();
          }}
        />
      </div>
      <p className="hint">{filtered.length}問</p>

      <ul className="library">
        {filtered.slice(0, limit).map((q) => {
          const open = openId === q.id;
          const status = statusOf(q, history);
          const exam = getExam(q.examId);
          return (
            <li key={q.id}>
              <button className="library-row" onClick={() => setOpenId(open ? null : q.id)} aria-expanded={open}>
                <span className="library-meta">
                  <span>{questionLabel(q)}</span>
                  <span className="tag">{q.category}</span>
                  <span className={status.className}>{status.label}</span>
                </span>
                <span className="library-title">{q.question.split('\n')[0]}</span>
              </button>
              {open && (
                <div className="library-detail">
                  <QuestionBody question={q} />
                  <ol className="choices choices-static">
                    {q.choices.map((c, i) => (
                      <li key={i} className={i === q.answer ? 'choice choice-correct' : 'choice'}>
                        <span className="choice-label">{CHOICE_LABELS[i]}</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="feedback feedback-ok">
                    <p className="feedback-title">正解: {CHOICE_LABELS[q.answer]}</p>
                    <p>{q.explanation}</p>
                  </div>
                  {exam?.credit && <p className="hint">{exam.credit}</p>}
                  {exam?.authoredExplanation && <p className="hint">解説は本アプリ独自のものです。</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {filtered.length > limit && (
        <button className="link" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
          さらに表示({filtered.length - limit}問)
        </button>
      )}

      <div className="actions">
        <button className="link" onClick={onHome}>
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
