import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { getExam, questionLabel } from '../data';
import type { Question } from '../data/types';
import type { AnswerRecord } from '../lib/quiz';
import ChoiceAnswer from './ChoiceAnswer';
import { BookmarkButton } from './Personal';

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
    }
  }, [isLast, answers, onFinish]);

  return (
    <div className="card">
      <div className="quiz-meta">
        <span>
          {index + 1} / {questions.length}
        </span>
        <span className="tag">
          <Link to={`/q/${q.id}`}>{questionLabel(q)}</Link> › {q.category}
        </span>
      </div>
      <progress value={index + (answered ? 1 : 0)} max={questions.length} />
      <div className="question-tools">
        <BookmarkButton id={q.id} />
      </div>

      <ChoiceAnswer question={q} selected={selected} onChoose={choose} onNext={next} />

      <div className="actions">
        <button className="link" onClick={onQuit}>
          中断する
        </button>
        {answered && (
          <button className="primary" onClick={next} autoFocus>
            {isLast ? '結果を見る' : '次の問題へ'}
          </button>
        )}
      </div>
      <p className="hint">キーボード: 1〜4 で解答 / Enter で次へ</p>
      {exam?.credit && <p className="hint">{exam.credit}</p>}
    </div>
  );
}
