import { Link } from 'react-router';
import { CircleX, RotateCcw, Settings2 } from 'lucide-react';
import { questionLabel } from '../data';
import { CHOICE_LABELS, type Question } from '../data/types';
import { percent, scoreByCategory, type AnswerRecord } from '../lib/quiz';
import { ProgressBar, ProgressRing } from './ui';

interface Props {
  questions: Question[];
  answers: AnswerRecord[];
  onRetryWrong: (questions: Question[]) => void;
  onHome: () => void;
}

/** 午前試験の合格基準は 60 点(100 点満点) */
const PASS_LINE = 60;

export default function Result({ questions, answers, onRetryWrong, onHome }: Props) {
  const correct = answers.filter((a) => a.correct).length;
  const rate = percent(correct, answers.length);
  const passed = rate >= PASS_LINE;
  const byId = new Map(questions.map((q) => [q.id, q]));
  const wrong = answers.filter((a) => !a.correct).map((a) => ({ a, q: byId.get(a.questionId)! }));

  return (
    <div className="page">
      <section className={`hero result-hero ${passed ? 'hero-ok' : ''}`}>
        <div className="hero-text">
          <p className="hero-greeting">演習結果</p>
          <h1>{passed ? '合格ライン到達！' : 'おつかれさまでした'}</h1>
          <p className="hero-sub">
            {correct} / {answers.length} 問正解{!passed && ` ・ 合格ライン(${PASS_LINE}%)まであと ${PASS_LINE - rate} ポイント`}
          </p>
          <div className="hero-actions">
            {wrong.length > 0 && (
              <button className="btn btn-light" onClick={() => onRetryWrong(wrong.map((w) => w.q))}>
                <RotateCcw size={18} aria-hidden="true" />
                間違えた {wrong.length} 問を解き直す
              </button>
            )}
            <button className="btn btn-ghost-light" onClick={onHome}>
              <Settings2 size={18} aria-hidden="true" />
              演習の設定に戻る
            </button>
          </div>
        </div>
        <ProgressRing
          value={rate}
          size={120}
          stroke={11}
          tone="ok"
          label={
            <>
              <strong>{rate}%</strong>
              <small>正答率</small>
            </>
          }
        />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>分野別</h2>
        </div>
        <ul className="panel score-rows">
          {scoreByCategory(questions, answers).map((s) => (
            <li key={s.category}>
              <span className="category-name">{s.category}</span>
              <ProgressBar value={percent(s.correct, s.total)} tone={percent(s.correct, s.total) >= PASS_LINE ? 'ok' : 'primary'} />
              <span className="score-num">
                {s.correct}/{s.total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {wrong.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>間違えた問題</h2>
          </div>
          <ul className="review">
            {wrong.map(({ a, q }) => (
              <li key={q.id} className="panel">
                <p className="review-head">
                  <CircleX size={18} aria-hidden="true" />
                  <Link to={`/q/${q.id}`}>{questionLabel(q)}</Link>
                  <span className="tag">{q.category}</span>
                </p>
                <p className="question">{q.question}</p>
                <div className="review-answers">
                  <p className="text-ng">
                    あなたの解答: {CHOICE_LABELS[a.selected]} {q.choices[a.selected]}
                  </p>
                  <p className="text-ok">
                    正解: {CHOICE_LABELS[q.answer]} {q.choices[q.answer]}
                  </p>
                </div>
                <p className="hint">{q.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
