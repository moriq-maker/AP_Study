import { Link } from 'react-router';
import { getExam, questionLabel } from '../data';
import type { Question, WrittenQuestion } from '../data/types';
import { percent } from '../lib/quiz';
import { questionLink, type SequenceSource } from '../lib/sequence';
import { amStatus, isBookmarked, pmSummary, type UserData } from '../lib/userData';

const STATUS_LABEL = { unanswered: '未解答', correct: '正解', wrong: '不正解' } as const;
const STATUS_CLASS = { unanswered: 'status', correct: 'status status-ok', wrong: 'status status-ng' } as const;

interface AmProps {
  questions: readonly Question[];
  data: UserData;
  source?: SequenceSource;
  /** 行に試験名も表示する(複数の試験をまたぐ一覧用) */
  showExam?: boolean;
}

/** 午前問題の一覧。各行は問題ページへのリンク */
export function AmQuestionList({ questions, data, source = 'exam', showExam = false }: AmProps) {
  if (questions.length === 0) return <p className="hint">該当する問題はありません。</p>;
  return (
    <ul className="library">
      {questions.map((q) => {
        const status = amStatus(data, q.id);
        const stat = data.am[q.id];
        return (
          <li key={q.id}>
            <Link className="library-row" to={questionLink(q.id, source)}>
              <span className="library-meta">
                <span>{showExam ? questionLabel(q) : q.number !== undefined ? `問${q.number}` : getExam(q.examId)?.title}</span>
                <span className="tag">{q.category}</span>
                <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>
                {stat && stat.attempts > 1 && <span className="tag">{percent(stat.correct, stat.attempts)}%({stat.attempts}回)</span>}
                {isBookmarked(data, q.id) && <span className="star">★</span>}
                {data.notes[q.id]?.text && <span className="tag">📝</span>}
              </span>
              <span className="library-title">{q.question.split('\n')[0]}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

interface PmProps {
  questions: readonly WrittenQuestion[];
  data: UserData;
  showExam?: boolean;
}

/** 午後問題の一覧 */
export function PmQuestionList({ questions, data, showExam = false }: PmProps) {
  if (questions.length === 0) return <p className="hint">該当する問題はありません。</p>;
  return (
    <ul className="library">
      {questions.map((q) => {
        const s = pmSummary(data, q.id, q.items.length);
        return (
          <li key={q.id}>
            <Link className="library-row" to={`/pm/${q.id}`}>
              <span className="library-meta">
                <span>
                  {showExam ? questionLabel(q) : `問${q.number}`}
                  {q.required ? '(必須)' : ''}
                </span>
                <span className="tag">{q.category}</span>
                {s.answered === 0 ? (
                  <span className="status">未解答</span>
                ) : (
                  <span className={s.correct === s.total ? 'status status-ok' : 'status status-ng'}>
                    {s.correct} / {s.total} 欄正解
                  </span>
                )}
                {isBookmarked(data, q.id) && <span className="star">★</span>}
                {data.notes[q.id]?.text && <span className="tag">📝</span>}
              </span>
              <span className="library-title">{q.theme}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** 進捗バー付きの集計表示 */
export function ProgressSummary({ answered, total, correct }: { answered: number; total: number; correct: number }) {
  return (
    <div className="progress-summary">
      <progress value={answered} max={total} aria-label="解答済みの割合" />
      <span className="hint">
        解答済み {answered} / {total}
        {answered > 0 && ` ・ 正答率 ${percent(correct, answered)}%`}
      </span>
    </div>
  );
}
