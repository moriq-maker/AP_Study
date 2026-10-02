import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import ChoiceAnswer from '../components/ChoiceAnswer';
import { BookmarkButton, NoteEditor } from '../components/Personal';
import { getExam, getQuestion, questionLabel } from '../data';
import { percent } from '../lib/quiz';
import { neighbors, parseSource, questionLink, sequenceFor, sourceLabel } from '../lib/sequence';
import { useUserData } from '../store/UserDataContext';
import NotFound from './NotFound';

/** 午前問題の個別ページ(一問一答) */
export default function AmQuestionPage() {
  const { id = '' } = useParams();
  const question = getQuestion(id);
  if (!question) return <NotFound />;
  // 問題が変わったら解答状態をリセットするため key を付ける
  return <AmQuestionView key={id} id={id} />;
}

function AmQuestionView({ id }: { id: string }) {
  const question = getQuestion(id)!;
  const exam = getExam(question.examId);
  const [params] = useSearchParams();
  const source = parseSource(params.get('from'));
  const navigate = useNavigate();
  const { data, recordAm } = useUserData();
  const [selected, setSelected] = useState<number | null>(null);

  const sequence = sequenceFor(source, question, data);
  // 開いた時点の並び順での位置(正解して「間違えた問題」から外れても前後をたどれるように)
  const [initialIndex] = useState(() => Math.max(0, sequence.findIndex((q) => q.id === id)));
  const { prev, next, position, total } = neighbors(sequence, id, initialIndex);
  const stat = data.am[id];

  const choose = useCallback(
    (i: number) => {
      if (selected !== null) return;
      setSelected(i);
      recordAm(id, i === question.answer);
    },
    [selected, id, question.answer, recordAm],
  );
  const goNext = useMemo(() => (next ? () => navigate(questionLink(next.id, source)) : undefined), [next, navigate, source]);

  const backTo =
    source === 'exam'
      ? `/exams/${question.examId}`
      : source === 'bookmarks'
        ? '/bookmarks'
        : source === 'wrong'
          ? '/stats'
          : `/fields/${encodeURIComponent(source.slice(4))}`;

  return (
    <div className="card">
      <nav className="breadcrumb">
        <Link to={backTo}>← {source === 'exam' ? exam?.title : sourceLabel(source)}</Link>
        {position !== undefined && (
          <span className="hint">
            {position} / {total}
          </span>
        )}
      </nav>
      <div className="quiz-meta">
        <span>{questionLabel(question)}</span>
        <span className="tag">{question.category}</span>
      </div>
      <div className="question-tools">
        <BookmarkButton id={id} />
        {stat && (
          <span className="hint">
            これまで {stat.attempts} 回解答・正答率 {percent(stat.correct, stat.attempts)}%
          </span>
        )}
      </div>

      <ChoiceAnswer question={question} selected={selected} onChoose={choose} onNext={goNext} />

      <div className="actions">
        {prev ? <Link to={questionLink(prev.id, source)}>← 前の問題</Link> : <span />}
        {selected !== null && (
          <button className="link" onClick={() => setSelected(null)}>
            もう一度解く
          </button>
        )}
        {next ? (
          <Link className={selected !== null ? 'button primary' : ''} to={questionLink(next.id, source)}>
            次の問題 →
          </Link>
        ) : (
          <Link to={backTo}>一覧に戻る</Link>
        )}
      </div>
      {selected !== null && <p className="hint">キーボード: Enter で次の問題へ</p>}

      <NoteEditor id={id} />
      {exam?.credit && <p className="hint">{exam.credit}</p>}
    </div>
  );
}
