import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, List, RotateCcw } from 'lucide-react';
import ChoiceAnswer from '../components/ChoiceAnswer';
import { BookmarkButton, NoteEditor } from '../components/Personal';
import { PageHeader, ProgressBar } from '../components/ui';
import { getExam, getQuestion, questionLabel } from '../data';
import { FIELD_LABELS } from '../data/types';
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
    <div className="page page-question">
      <PageHeader
        back={{ to: backTo, label: (source === 'exam' ? exam?.title : sourceLabel(source)) ?? '一覧' }}
        title={questionLabel(question)}
        subtitle={
          <>
            <span className="tag">{FIELD_LABELS[question.field]}</span>
            <span className="tag">{question.category}</span>
          </>
        }
      />
      {position !== undefined && total !== undefined && (
        <div className="q-progress">
          <ProgressBar value={percent(position, total)} />
          <span>
            {position} / {total}
          </span>
        </div>
      )}

      <div className="q-layout">
        <article className="panel q-main">
          <ChoiceAnswer question={question} selected={selected} onChoose={choose} onNext={goNext} />
          {exam?.credit && <p className="credit">{exam.credit}</p>}
        </article>

        <aside className="q-side">
          <div className="panel q-tools">
            <BookmarkButton id={id} />
            {stat ? (
              <dl className="mini-stats">
                <div>
                  <dt>解答回数</dt>
                  <dd>{stat.attempts}</dd>
                </div>
                <div>
                  <dt>正答率</dt>
                  <dd>{percent(stat.correct, stat.attempts)}%</dd>
                </div>
                <div>
                  <dt>前回</dt>
                  <dd className={stat.lastCorrect ? 'text-ok' : 'text-ng'}>{stat.lastCorrect ? '正解' : '不正解'}</dd>
                </div>
              </dl>
            ) : (
              <p className="hint">はじめて解く問題です</p>
            )}
            <p className="hint kbd-hint">
              キーボード: <kbd>1</kbd>〜<kbd>4</kbd> で解答 / <kbd>Enter</kbd> で次へ
            </p>
          </div>
          <div className="panel">
            <NoteEditor id={id} />
          </div>
        </aside>
      </div>

      <nav className="action-bar" aria-label="問題の移動">
        {prev ? (
          <Link className="btn btn-secondary" to={questionLink(prev.id, source)} aria-label="前の問題">
            <ChevronLeft size={18} aria-hidden="true" />
            <span className="hide-sm">前の問題</span>
          </Link>
        ) : (
          <Link className="btn btn-secondary" to={backTo} aria-label="一覧に戻る">
            <List size={18} aria-hidden="true" />
          </Link>
        )}
        {selected !== null && (
          <button className="btn btn-ghost" onClick={() => setSelected(null)}>
            <RotateCcw size={16} aria-hidden="true" />
            もう一度
          </button>
        )}
        {next ? (
          <Link className={`btn ${selected !== null ? 'btn-primary' : 'btn-secondary'} btn-grow`} to={questionLink(next.id, source)}>
            次の問題
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <Link className="btn btn-primary btn-grow" to={backTo}>
            一覧に戻る
          </Link>
        )}
      </nav>
    </div>
  );
}
