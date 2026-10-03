import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, X } from 'lucide-react';
import { getExam, questionLabel } from '../data';
import type { Question } from '../data/types';
import { percent, type AnswerRecord } from '../lib/quiz';
import ChoiceAnswer from './ChoiceAnswer';
import { BookmarkButton } from './Personal';
import { ProgressBar } from './ui';

interface Props {
  questions: Question[];
  onAnswer: (record: AnswerRecord) => void;
  onFinish: (answers: AnswerRecord[]) => void;
  onQuit: () => void;
}

/** 演習: 選んだ問題を連続で解く */
export default function Quiz({ questions, onAnswer, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const q = questions[index];
  const exam = getExam(q.examId);
  const answered = selected !== null;
  const isLast = index === questions.length - 1;
  const correctCount = answers.filter((a) => a.correct).length;

  const choose = useCallback(
    (i: number) => {
      if (selected !== null) return;
      const record: AnswerRecord = { questionId: q.id, selected: i, correct: i === q.answer };
      setSelected(i);
      setAnswers((a) => [...a, record]);
      onAnswer(record);
    },
    [selected, q, onAnswer],
  );

  const next = useCallback(() => {
    if (isLast) {
      onFinish(answers);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      window.scrollTo(0, 0);
    }
  }, [isLast, answers, onFinish]);

  return (
    <div className="page page-question">
      <div className="quiz-top">
        <button className="icon-btn" onClick={onQuit} aria-label="中断する" title="中断する">
          <X size={20} />
        </button>
        <ProgressBar value={percent(index + (answered ? 1 : 0), questions.length)} />
        <span className="quiz-count">
          {index + 1}
          <small> / {questions.length}</small>
        </span>
      </div>

      <div className="q-layout">
        <article className="panel q-main">
          <div className="quiz-meta">
            <Link to={`/q/${q.id}`} className="tag tag-link">
              {questionLabel(q)}
            </Link>
            <span className="tag">{q.category}</span>
          </div>
          <ChoiceAnswer question={q} selected={selected} onChoose={choose} onNext={next} />
          {exam?.credit && <p className="credit">{exam.credit}</p>}
        </article>
        <aside className="q-side">
          <div className="panel q-tools">
            <BookmarkButton id={q.id} />
            <dl className="mini-stats">
              <div>
                <dt>解答</dt>
                <dd>{answers.length}</dd>
              </div>
              <div>
                <dt>正解</dt>
                <dd className="text-ok">{correctCount}</dd>
              </div>
              <div>
                <dt>正答率</dt>
                <dd>{answers.length ? `${percent(correctCount, answers.length)}%` : '—'}</dd>
              </div>
            </dl>
            <p className="hint kbd-hint">
              キーボード: <kbd>1</kbd>〜<kbd>4</kbd> で解答 / <kbd>Enter</kbd> で次へ
            </p>
          </div>
        </aside>
      </div>

      <nav className="action-bar" aria-label="演習の操作">
        <button className="btn btn-secondary" onClick={onQuit}>
          中断
        </button>
        <button className="btn btn-primary btn-grow" onClick={next} disabled={!answered} autoFocus={answered}>
          {isLast ? '結果を見る' : '次の問題へ'}
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
