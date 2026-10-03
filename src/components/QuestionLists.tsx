import { Link } from 'react-router';
import { Bookmark, ChevronRight, NotebookPen } from 'lucide-react';
import { getExam, questionLabel } from '../data';
import type { Question, WrittenQuestion } from '../data/types';
import { percent } from '../lib/quiz';
import { questionLink, type SequenceSource } from '../lib/sequence';
import { amStatus, isBookmarked, pmSummary, type UserData } from '../lib/userData';
import { ProgressBar } from './ui';

const STATUS_LABEL = { unanswered: '未解答', correct: '正解', wrong: '不正解' } as const;
const STATUS_CLASS = { unanswered: 'status', correct: 'status status-ok', wrong: 'status status-ng' } as const;

interface AmProps {
  questions: readonly Question[];
  data: UserData;
  source?: SequenceSource;
  /** 行に試験名も表示する(複数の試験をまたぐ一覧用) */
  showExam?: boolean;
}

function Marks({ data, id }: { data: UserData; id: string }) {
  return (
    <>
      {isBookmarked(data, id) && <Bookmark className="mark-icon mark-bookmark" size={14} fill="currentColor" aria-label="ブックマーク" />}
      {data.notes[id]?.text && <NotebookPen className="mark-icon" size={14} aria-label="メモあり" />}
    </>
  );
}

function Empty() {
  return <p className="empty">該当する問題はありません。</p>;
}

/** 午前問題の一覧。各行は問題ページへのリンク */
export function AmQuestionList({ questions, data, source = 'exam', showExam = false }: AmProps) {
  if (questions.length === 0) return <Empty />;
  return (
    <ul className="library">
      {questions.map((q) => {
        const status = amStatus(data, q.id);
        const stat = data.am[q.id];
        return (
          <li key={q.id}>
            <Link className={`library-row row-${status}`} to={questionLink(q.id, source)}>
              <span className="library-num">{q.number ?? '–'}</span>
              <span className="library-body">
                <span className="library-meta">
                  {showExam && <span>{questionLabel(q)}</span>}
                  {!showExam && q.number === undefined && <span>{getExam(q.examId)?.title}</span>}
                  <span className="tag">{q.category}</span>
                  <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>
                  {stat && stat.attempts > 1 && (
                    <span className="tag">
                      {percent(stat.correct, stat.attempts)}%({stat.attempts}回)
                    </span>
                  )}
                  <Marks data={data} id={q.id} />
                </span>
                <span className="library-title">{q.question.split('\n')[0]}</span>
              </span>
              <ChevronRight className="library-chevron" size={18} aria-hidden="true" />
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
  if (questions.length === 0) return <Empty />;
  return (
    <ul className="library">
      {questions.map((q) => {
        const s = pmSummary(data, q.id, q.items.length);
        const status = s.answered === 0 ? 'unanswered' : s.correct === s.total ? 'correct' : 'wrong';
        return (
          <li key={q.id}>
            <Link className={`library-row row-${status}`} to={`/pm/${q.id}`}>
              <span className="library-num">{q.number}</span>
              <span className="library-body">
                <span className="library-meta">
                  {showExam && <span>{questionLabel(q)}</span>}
                  {q.required && <span className="tag tag-strong">必須</span>}
                  <span className="tag">{q.category}</span>
                  {s.answered === 0 ? (
                    <span className="status">未解答</span>
                  ) : (
                    <span className={STATUS_CLASS[status]}>
                      {s.correct} / {s.total} 欄正解
                    </span>
                  )}
                  <Marks data={data} id={q.id} />
                </span>
                <span className="library-title">{q.theme}</span>
              </span>
              <ChevronRight className="library-chevron" size={18} aria-hidden="true" />
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
      <ProgressBar value={percent(answered, total)} />
      <span className="hint">
        解答済み {answered} / {total}
        {answered > 0 && ` ・ 正答率 ${percent(correct, answered)}%`}
      </span>
    </div>
  );
}
