import { useState } from 'react';
import { getExam } from '../data';
import type { WrittenQuestion } from '../data/types';
import { percent } from '../lib/quiz';
import { autoGrade, type WrittenHistoryEntry } from '../lib/written';
import { assetUrl } from './QuestionBody';

interface Props {
  question: WrittenQuestion;
  previous?: WrittenHistoryEntry;
  onSubmit: (inputs: string[], marks: boolean[]) => void;
  onBack: () => void;
}

export default function WrittenQuiz({ question, previous, onSubmit, onBack }: Props) {
  const exam = getExam(question.examId);
  const [inputs, setInputs] = useState<string[]>(() => question.items.map(() => ''));
  // null: 未採点(自己採点待ち)。採点前は配列自体が null
  const [marks, setMarks] = useState<(boolean | null)[] | null>(null);
  const [saved, setSaved] = useState(false);

  const graded = marks !== null;
  const allMarked = graded && marks.every((m) => m !== null);
  const correct = graded ? marks.filter((m) => m === true).length : 0;

  const grade = () => setMarks(autoGrade(question.items, inputs));

  const setMark = (i: number, value: boolean) => {
    setMarks((ms) => ms && ms.map((m, j) => (j === i ? value : m)));
    setSaved(false);
  };

  const save = () => {
    if (!marks || !allMarked) return;
    onSubmit(inputs, marks as boolean[]);
    setSaved(true);
  };

  return (
    <div className="card">
      <div className="quiz-meta">
        <span>
          {exam?.title} 問{question.number}
          {question.required ? '(必須)' : ''}
        </span>
        <span className="tag">{question.category}</span>
      </div>
      <h1 className="written-title">{question.theme}</h1>
      <p className="hint">
        <a href="#answer-sheet">解答欄へ移動 ↓</a>
        {previous && ` / 前回 ${percent(previous.lastCorrect, previous.total)}%(${previous.attempts}回解答)`}
      </p>

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

      <h2 id="answer-sheet">解答欄</h2>
      <ol className="answer-sheet">
        {question.items.map((item, i) => {
          const mark = marks?.[i];
          return (
            <li key={item.label} className={mark === true ? 'sheet-ok' : mark === false ? 'sheet-ng' : ''}>
              <label className="sheet-label" htmlFor={`item-${i}`}>
                {item.label}
                <span className="hint">{item.kind === 'exact' ? '自動採点' : '自己採点'}</span>
              </label>
              {item.kind === 'free' ? (
                <textarea
                  id={`item-${i}`}
                  rows={2}
                  value={inputs[i]}
                  readOnly={graded}
                  onChange={(e) => setInputs((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                />
              ) : (
                <input
                  id={`item-${i}`}
                  type="text"
                  value={inputs[i]}
                  readOnly={graded}
                  onChange={(e) => setInputs((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                />
              )}
              {graded && (
                <div className="sheet-answer">
                  <span>
                    解答例: <strong>{item.answer}</strong>
                    {item.accept && ` (別解: ${item.accept.join('、')})`}
                    {item.unordered && '(順不同)'}
                  </span>
                  <span className="mark-buttons" role="group" aria-label={`${item.label} の採点`}>
                    <button className={mark === true ? 'mark mark-on-ok' : 'mark'} onClick={() => setMark(i, true)}>
                      ○
                    </button>
                    <button className={mark === false ? 'mark mark-on-ng' : 'mark'} onClick={() => setMark(i, false)}>
                      ×
                    </button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {graded && (
        <div className="feedback feedback-ok">
          <p className="feedback-title">
            {allMarked
              ? `${correct} / ${question.items.length} 欄正解(${percent(correct, question.items.length)}%)`
              : '文章の設問は、解答例と見比べて ○ / × を付けてください'}
          </p>
          <p className="hint">
            自動採点の結果も ○ / × で修正できます。得点は解答欄の数による目安で、本試験の配点とは異なります。
          </p>
          <h3>出題趣旨</h3>
          <p>{question.aim}</p>
        </div>
      )}

      <div className="actions">
        <button className="link" onClick={onBack}>
          午後問題一覧へ
        </button>
        {!graded ? (
          <button className="primary" onClick={grade}>
            採点する
          </button>
        ) : (
          <button className="primary" onClick={save} disabled={!allMarked || saved}>
            {saved ? '記録しました' : '結果を記録する'}
          </button>
        )}
      </div>
    </div>
  );
}
