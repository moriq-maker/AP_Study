import { useEffect, useState } from 'react';
import { CHOICE_LABELS, FIELD_LABELS, type Question } from '../data/types';
import type { AnswerRecord } from '../lib/quiz';

interface Props {
  questions: Question[];
  onAnswer: (record: AnswerRecord) => void;
  onFinish: (answers: AnswerRecord[]) => void;
  onQuit: () => void;
}

export default function Quiz({ questions, onAnswer, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const q = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  const choose = (i: number) => {
    if (answered) return;
    const record: AnswerRecord = { questionId: q.id, selected: i, correct: i === q.answer };
    setSelected(i);
    setAnswers((a) => [...a, record]);
    onAnswer(record);
  };

  const next = () => {
    if (isLast) {
      onFinish(answers);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  // キーボード操作: 1〜4 で解答、Enter で次へ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) choose(Number(e.key) - 1);
      else if (answered && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const choiceClass = (i: number) => {
    if (!answered) return 'choice';
    if (i === q.answer) return 'choice choice-correct';
    if (i === selected) return 'choice choice-wrong';
    return 'choice choice-dim';
  };

  return (
    <div className="card">
      <div className="quiz-meta">
        <span>
          問{index + 1} / {questions.length}
        </span>
        <span className="tag">
          {FIELD_LABELS[q.field]} › {q.category}
        </span>
      </div>
      <progress value={index + (answered ? 1 : 0)} max={questions.length} />

      <p className="question">{q.question}</p>

      <ol className="choices">
        {q.choices.map((c, i) => (
          <li key={i}>
            <button className={choiceClass(i)} onClick={() => choose(i)} disabled={answered}>
              <span className="choice-label">{CHOICE_LABELS[i]}</span>
              <span>{c}</span>
            </button>
          </li>
        ))}
      </ol>

      {answered && (
        <div className={`feedback ${selected === q.answer ? 'feedback-ok' : 'feedback-ng'}`} role="status">
          <p className="feedback-title">
            {selected === q.answer ? '正解！' : `不正解 — 正解は「${CHOICE_LABELS[q.answer]}」`}
          </p>
          <p>{q.explanation}</p>
        </div>
      )}

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
    </div>
  );
}
