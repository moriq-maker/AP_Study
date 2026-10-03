import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, ChevronRight, Eye, EyeOff, List } from 'lucide-react';
import { AnswerSheet, ItemQuiz } from '../components/PmAnswer';
import { BookmarkButton, NoteEditor } from '../components/Personal';
import { assetUrl } from '../components/QuestionBody';
import { PageHeader } from '../components/ui';
import { getExam, getWrittenQuestion, writtenQuestionsOfExam } from '../data';
import { neighbors } from '../lib/sequence';
import { pmSummary } from '../lib/userData';
import { useUserData } from '../store/UserDataContext';
import NotFound from './NotFound';

type Mode = 'items' | 'sheet';

/** 午後問題の個別ページ */
export default function PmQuestionPage() {
  const { id = '' } = useParams();
  if (!getWrittenQuestion(id)) return <NotFound />;
  return <PmQuestionView key={id} id={id} />;
}

function PmQuestionView({ id }: { id: string }) {
  const question = getWrittenQuestion(id)!;
  const exam = getExam(question.examId);
  const { data, recordPmItem } = useUserData();
  const [mode, setMode] = useState<Mode>('items');
  const [showPages, setShowPages] = useState(true);
  const { prev, next } = neighbors(writtenQuestionsOfExam(question.examId), id);
  const summary = pmSummary(data, id, question.items.length);

  return (
    <div className="page page-question page-wide">
      <PageHeader
        back={{ to: `/exams/${question.examId}`, label: exam?.title ?? '一覧' }}
        title={question.theme}
        subtitle={
          <>
            <span className="tag tag-strong">
              問{question.number}
              {question.required ? '(必須)' : ''}
            </span>
            <span className="tag">{question.category}</span>
            {summary.answered > 0 && (
              <span className="tag">
                前回 {summary.correct} / {summary.total} 欄正解
              </span>
            )}
          </>
        }
        actions={<BookmarkButton id={id} />}
      />

      <div className={`pm-layout ${showPages ? '' : 'pm-layout-collapsed'}`}>
        <section className="panel pm-pages" aria-label="問題文">
          <div className="pm-pages-head">
            <h2>問題文</h2>
            <button className="btn btn-ghost btn-sm" aria-expanded={showPages} onClick={() => setShowPages((v) => !v)}>
              {showPages ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              {showPages ? '隠す' : '表示'}
            </button>
          </div>
          {showPages && (
            <>
              {question.referencePages && (
                <details className="reference">
                  <summary>{question.referenceLabel ?? '共通の記述形式(参考ページ)'}</summary>
                  {question.referencePages.map((src) => (
                    <img key={src} className="q-page" src={assetUrl(src)} alt="参考ページ" loading="lazy" />
                  ))}
                </details>
              )}
              <div className="pages">
                {question.pages.map((src, i) => (
                  <img key={src} className="q-page" src={assetUrl(src)} alt={`問題 ${i + 1}ページ目`} loading="lazy" />
                ))}
              </div>
              {exam?.credit && <p className="credit">{exam.credit}</p>}
            </>
          )}
        </section>

        <aside className="pm-answer">
          <section className="panel" aria-labelledby="answer">
            <div className="pm-pages-head">
              <h2 id="answer">解答</h2>
            </div>
            <div className="segmented" role="tablist" aria-label="解き方">
              <button role="tab" aria-selected={mode === 'items'} className={mode === 'items' ? 'seg-on' : ''} onClick={() => setMode('items')}>
                一問一答
              </button>
              <button role="tab" aria-selected={mode === 'sheet'} className={mode === 'sheet' ? 'seg-on' : ''} onClick={() => setMode('sheet')}>
                解答用紙
              </button>
            </div>
            {mode === 'items' ? (
              <ItemQuiz question={question} data={data} onRecord={(i, correct, replace) => recordPmItem(id, i, correct, replace)} />
            ) : (
              <AnswerSheet question={question} onSubmit={(marks, replace) => marks.forEach((m, i) => recordPmItem(id, i, m, replace))} />
            )}
          </section>
          <div className="panel">
            <NoteEditor id={id} />
          </div>
        </aside>
      </div>

      <nav className="action-bar" aria-label="問題の移動">
        {prev ? (
          <Link className="btn btn-secondary" to={`/pm/${prev.id}`}>
            <ChevronLeft size={18} aria-hidden="true" />問{prev.number}
          </Link>
        ) : (
          <Link className="btn btn-secondary" to={`/exams/${question.examId}`} aria-label="一覧に戻る">
            <List size={18} aria-hidden="true" />
          </Link>
        )}
        {next ? (
          <Link className="btn btn-primary btn-grow" to={`/pm/${next.id}`}>
            問{next.number}へ
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <Link className="btn btn-primary btn-grow" to={`/exams/${question.examId}`}>
            一覧に戻る
          </Link>
        )}
      </nav>
    </div>
  );
}
