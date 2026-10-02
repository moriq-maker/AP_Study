import { useState } from 'react';
import type { WrittenItem, WrittenQuestion } from '../data/types';
import { percent } from '../lib/quiz';
import { autoGrade, normalize } from '../lib/written';
import { pmItemKey, type UserData } from '../lib/userData';

const KATAKANA = 'アイウエオカキクケコサシスセソタチツテト';

/** 解答例が記号 1 文字(ア〜ト)の解答欄は選択式として扱う */
export function isSymbolItem(item: WrittenItem): boolean {
  return item.kind === 'exact' && item.answer.length === 1 && KATAKANA.includes(item.answer);
}

/**
 * 選択式の解答欄に並べる記号。解答群の大きさはデータに無いため、
 * その問の記号解答のうち最も後ろの記号まで(最低でもエまで)を並べる。
 */
export function symbolOptions(question: WrittenQuestion): string[] {
  const last = Math.max(
    3,
    ...question.items.filter(isSymbolItem).map((item) => KATAKANA.indexOf(item.answer)),
  );
  return [...KATAKANA.slice(0, last + 1)];
}

function answerText(item: WrittenItem): string {
  return `${item.answer}${item.accept ? `(別解: ${item.accept.join('、')})` : ''}${item.unordered ? '(順不同)' : ''}`;
}

interface ItemQuizProps {
  question: WrittenQuestion;
  data: UserData;
  onRecord: (itemIndex: number, correct: boolean, replace: boolean) => void;
}

/** 午後問題を解答欄ごとに一問一答で解く */
export function ItemQuiz({ question, data, onRecord }: ItemQuizProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  // 解答済みなら判定結果(free は自己採点前が null)
  const [result, setResult] = useState<{ answered: boolean; mark: boolean | null }>({ answered: false, mark: null });
  // この欄の結果を既に記録したか(採点を修正したときは記録を置き換える)
  const [recorded, setRecorded] = useState(false);
  const [sessionMarks, setSessionMarks] = useState<(boolean | undefined)[]>(() => question.items.map(() => undefined));

  const item = question.items[index];
  const options = symbolOptions(question);
  const done = sessionMarks.every((m) => m !== undefined);

  const go = (i: number) => {
    setIndex(i);
    setInput('');
    setRecorded(false);
    setResult({ answered: false, mark: null });
  };

  const finalize = (mark: boolean) => {
    setResult({ answered: true, mark });
    setSessionMarks((ms) => ms.map((m, i) => (i === index ? mark : m)));
    onRecord(index, mark, recorded);
    setRecorded(true);
  };

  const submit = (value: string) => {
    setInput(value);
    if (item.kind === 'free') {
      setResult({ answered: true, mark: null });
      return;
    }
    // 順不同の欄は単独では判定できないので、同じグループの解答例のどれかと一致すれば正解とする
    const correct = item.unordered
      ? question.items.some((other) => other.unordered === item.unordered && autoGrade([other], [value])[0])
      : autoGrade([item], [value])[0] === true;
    finalize(correct);
  };

  const nextIndex = question.items.findIndex((_, i) => i > index && sessionMarks[i] === undefined);
  const firstUnanswered = sessionMarks.findIndex((m) => m === undefined);

  return (
    <div className="item-quiz">
      <div className="item-chips" role="tablist" aria-label="解答欄">
        {question.items.map((it, i) => {
          const m = sessionMarks[i];
          const saved = data.pm[pmItemKey(question.id, i)];
          const cls = m === true ? 'chip-ok' : m === false ? 'chip-ng' : saved ? (saved.lastCorrect ? 'chip-was-ok' : 'chip-was-ng') : '';
          return (
            <button
              key={it.label}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`chip ${cls} ${i === index ? 'chip-current' : ''}`}
              onClick={() => go(i)}
            >
              {it.label.replace(/^設問/, '')}
            </button>
          );
        })}
      </div>

      <div className="item-card">
        <p className="item-label">
          {item.label}
          <span className="hint">
            {isSymbolItem(item) ? '記号を選択' : item.kind === 'exact' ? '自動採点' : '記述・自己採点'}
          </span>
        </p>

        {isSymbolItem(item) ? (
          <div className="symbol-options">
            {options.map((s) => {
              const cls = !result.answered
                ? ''
                : s === item.answer
                  ? 'symbol-correct'
                  : s === input
                    ? 'symbol-wrong'
                    : 'symbol-dim';
              return (
                <button key={s} type="button" className={`symbol ${cls}`} disabled={result.answered} onClick={() => submit(s)}>
                  {s}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="item-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!result.answered) submit(input);
            }}
          >
            {item.kind === 'free' ? (
              <textarea rows={3} value={input} readOnly={result.answered} onChange={(e) => setInput(e.target.value)} />
            ) : (
              <input type="text" value={input} readOnly={result.answered} onChange={(e) => setInput(e.target.value)} />
            )}
            {!result.answered && (
              <button className="primary" type="submit">
                {item.kind === 'free' ? '解答例を見る' : '解答する'}
              </button>
            )}
          </form>
        )}

        {result.answered && (
          <div
            className={`feedback ${result.mark === true ? 'feedback-ok' : result.mark === false ? 'feedback-ng' : 'feedback-neutral'}`}
            role="status"
          >
            <p className="feedback-title">
              {result.mark === true ? '正解！' : result.mark === false ? '不正解' : '解答例と見比べて採点してください'}
            </p>
            <p>
              解答例: <strong>{answerText(item)}</strong>
            </p>
            {item.kind === 'exact' && !isSymbolItem(item) && result.mark === false && normalize(input) !== '' && (
              <p className="hint">表記の違いで不正解になった場合は、下のボタンで正解にできます。</p>
            )}
            {!isSymbolItem(item) && (
              <div className="mark-buttons">
                <button type="button" className={result.mark === true ? 'mark mark-on-ok' : 'mark'} onClick={() => finalize(true)}>
                  ○ 正解
                </button>
                <button type="button" className={result.mark === false ? 'mark mark-on-ng' : 'mark'} onClick={() => finalize(false)}>
                  × 不正解
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="actions">
        <button className="link" disabled={index === 0} onClick={() => go(index - 1)}>
          ← 前の欄
        </button>
        {result.answered && result.mark !== null && (nextIndex >= 0 || firstUnanswered >= 0) && (
          <button className="primary" onClick={() => go(nextIndex >= 0 ? nextIndex : firstUnanswered)}>
            次の欄へ
          </button>
        )}
        {index < question.items.length - 1 && !(result.answered && result.mark !== null) && (
          <button className="link" onClick={() => go(index + 1)}>
            次の欄 →
          </button>
        )}
      </div>

      {done && (
        <div className="feedback feedback-ok">
          <p className="feedback-title">
            全欄に解答しました: {sessionMarks.filter((m) => m === true).length} / {question.items.length} 欄正解(
            {percent(sessionMarks.filter((m) => m === true).length, question.items.length)}%)
          </p>
          <p className="hint">得点は解答欄の数による目安で、本試験の配点とは異なります。</p>
          <h3>出題趣旨</h3>
          <p>{question.aim}</p>
        </div>
      )}
    </div>
  );
}

interface AnswerSheetProps {
  question: WrittenQuestion;
  /** replace = true は採点を修正して記録し直した場合 */
  onSubmit: (marks: boolean[], replace: boolean) => void;
}

/** 午後問題の全解答欄をまとめて解いて採点する(解答用紙モード) */
export function AnswerSheet({ question, onSubmit }: AnswerSheetProps) {
  const [inputs, setInputs] = useState<string[]>(() => question.items.map(() => ''));
  // null: 未採点(自己採点待ち)。採点前は配列自体が null
  const [marks, setMarks] = useState<(boolean | null)[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  const graded = marks !== null;
  const allMarked = graded && marks.every((m) => m !== null);
  const correct = graded ? marks.filter((m) => m === true).length : 0;

  const setMark = (i: number, value: boolean) => {
    setMarks((ms) => ms && ms.map((m, j) => (j === i ? value : m)));
    setSaved(false);
  };

  const save = () => {
    if (!marks || !allMarked) return;
    onSubmit(marks as boolean[], savedOnce);
    setSaved(true);
    setSavedOnce(true);
  };

  return (
    <>
      <ol className="answer-sheet">
        {question.items.map((item, i) => {
          const mark = marks?.[i];
          const change = (value: string) => setInputs((xs) => xs.map((x, j) => (j === i ? value : x)));
          return (
            <li key={item.label} className={mark === true ? 'sheet-ok' : mark === false ? 'sheet-ng' : ''}>
              <label className="sheet-label" htmlFor={`item-${i}`}>
                {item.label}
                <span className="hint">{item.kind === 'exact' ? '自動採点' : '自己採点'}</span>
              </label>
              {item.kind === 'free' ? (
                <textarea id={`item-${i}`} rows={2} value={inputs[i]} readOnly={graded} onChange={(e) => change(e.target.value)} />
              ) : (
                <input id={`item-${i}`} type="text" value={inputs[i]} readOnly={graded} onChange={(e) => change(e.target.value)} />
              )}
              {graded && (
                <div className="sheet-answer">
                  <span>
                    解答例: <strong>{answerText(item)}</strong>
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
          <p className="hint">自動採点の結果も ○ / × で修正できます。得点は解答欄の数による目安で、本試験の配点とは異なります。</p>
          <h3>出題趣旨</h3>
          <p>{question.aim}</p>
        </div>
      )}

      <div className="actions">
        <span />
        {!graded ? (
          <button className="primary" onClick={() => setMarks(autoGrade(question.items, inputs))}>
            採点する
          </button>
        ) : (
          <button className="primary" onClick={save} disabled={!allMarked || saved}>
            {saved ? '記録しました' : '結果を記録する'}
          </button>
        )}
      </div>
    </>
  );
}
