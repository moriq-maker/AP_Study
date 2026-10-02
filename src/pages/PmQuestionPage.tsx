import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { AnswerSheet, ItemQuiz } from '../components/PmAnswer';
import { BookmarkButton, NoteEditor } from '../components/Personal';
import { assetUrl } from '../components/QuestionBody';
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
    <div className="card">
      <nav className="breadcrumb">
        <Link to={`/exams/${question.examId}`}>← {exam?.title}</Link>
      </nav>
      <div className="quiz-meta">
        <span>
          問{question.number}
          {question.required ? '(必須)' : ''}
        </span>
        <span className="tag">{question.category}</span>
      </div>
      <h1 className="written-title">{question.theme}</h1>
      <div className="question-tools">
        <BookmarkButton id={id} />
        {summary.answered > 0 && (
          <span className="hint">
            これまでの結果: {summary.correct} / {summary.total} 欄正解
          </span>
        )}
      </div>

      <button className="link" aria-expanded={showPages} onClick={() => setShowPages((v) => !v)}>
        {showPages ? '▲ 問題文を隠す' : '▼ 問題文を表示'}
      </button>
      {showPages && (
        <>
          {question.referencePages && (
            <details className="reference">
              <summary>共通の記述形式(参考ページ)</summary>
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
          {exam?.credit && <p className="hint">{exam.credit}</p>}
        </>
      )}

      <h2 id="answer">解答</h2>
      <div className="segmented" role="tablist" aria-label="解き方">
        <button role="tab" aria-selected={mode === 'items'} className={mode === 'items' ? 'seg-on' : ''} onClick={() => setMode('items')}>
          一問一答(1 欄ずつ)
        </button>
        <button role="tab" aria-selected={mode === 'sheet'} className={mode === 'sheet' ? 'seg-on' : ''} onClick={() => setMode('sheet')}>
          解答用紙(まとめて)
        </button>
      </div>
      {mode === 'items' ? (
        <ItemQuiz question={question} data={data} onRecord={(i, correct, replace) => recordPmItem(id, i, correct, replace)} />
      ) : (
        <AnswerSheet question={question} onSubmit={(marks, replace) => marks.forEach((m, i) => recordPmItem(id, i, m, replace))} />
      )}

      <div className="actions">
        {prev ? <Link to={`/pm/${prev.id}`}>← 問{prev.number}</Link> : <span />}
        {next ? <Link to={`/pm/${next.id}`}>問{next.number} →</Link> : <Link to={`/exams/${question.examId}`}>一覧に戻る</Link>}
      </div>

      <NoteEditor id={id} />
    </div>
  );
}
