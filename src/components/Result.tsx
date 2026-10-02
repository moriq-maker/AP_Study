import { questionLabel } from '../data';
import { CHOICE_LABELS, type Question } from '../data/types';
import { percent, scoreByCategory, type AnswerRecord } from '../lib/quiz';

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
  const byId = new Map(questions.map((q) => [q.id, q]));
  const wrong = answers.filter((a) => !a.correct).map((a) => ({ a, q: byId.get(a.questionId)! }));

  return (
    <div className="card">
      <h1>結果</h1>
      <div className="score">
        <span className="score-value">{rate}%</span>
        <span>
          {correct} / {answers.length} 問正解
        </span>
        <span className={rate >= PASS_LINE ? 'badge badge-ok' : 'badge badge-ng'}>
          {rate >= PASS_LINE ? '合格ライン到達' : `合格ライン(${PASS_LINE}%)未満`}
        </span>
      </div>

      <h2>分野別</h2>
      <table className="table">
        <thead>
          <tr>
            <th>中分類</th>
            <th>正解</th>
            <th>正答率</th>
          </tr>
        </thead>
        <tbody>
          {scoreByCategory(questions, answers).map((s) => (
            <tr key={s.category}>
              <td>{s.category}</td>
              <td>
                {s.correct} / {s.total}
              </td>
              <td>{percent(s.correct, s.total)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {wrong.length > 0 && (
        <>
          <h2>間違えた問題</h2>
          <ul className="review">
            {wrong.map(({ a, q }) => (
              <li key={q.id}>
                <p className="tag">{questionLabel(q)}</p>
                <p className="question">{q.question}</p>
                <p>
                  あなたの解答: {CHOICE_LABELS[a.selected]} {q.choices[a.selected]}
                  <br />
                  正解: {CHOICE_LABELS[q.answer]} {q.choices[q.answer]}
                </p>
                <p className="hint">{q.explanation}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="actions">
        <button className="link" onClick={onHome}>
          トップへ戻る
        </button>
        {wrong.length > 0 && (
          <button className="primary" onClick={() => onRetryWrong(wrong.map((w) => w.q))}>
            間違えた{wrong.length}問を解き直す
          </button>
        )}
      </div>
    </div>
  );
}
