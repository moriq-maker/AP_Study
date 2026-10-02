import { useEffect } from 'react';
import { getExam } from '../data';
import { CHOICE_LABELS, type Question } from '../data/types';
import QuestionBody from './QuestionBody';

interface Props {
  question: Question;
  /** 選んだ選択肢。未解答なら null */
  selected: number | null;
  onChoose: (index: number) => void;
  /** 解答後に Enter キーで呼ばれる */
  onNext?: () => void;
}

/** 入力欄にフォーカスがあるときはキーボードショートカットを無効にする */
function isTyping(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

/** 午前問題(4 択)の問題文・選択肢・正誤と解説 */
export default function ChoiceAnswer({ question, selected, onChoose, onNext }: Props) {
  const answered = selected !== null;
  const exam = getExam(question.examId);

  // キーボード操作: 1〜4 で解答、Enter で次へ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) onChoose(Number(e.key) - 1);
      else if (answered && e.key === 'Enter' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, onChoose, onNext]);

  const choiceClass = (i: number) => {
    if (!answered) return 'choice';
    if (i === question.answer) return 'choice choice-correct';
    if (i === selected) return 'choice choice-wrong';
    return 'choice choice-dim';
  };

  return (
    <>
      <QuestionBody question={question} />
      <ol className="choices">
        {question.choices.map((c, i) => (
          <li key={i}>
            <button className={choiceClass(i)} onClick={() => onChoose(i)} disabled={answered}>
              <span className="choice-label">{CHOICE_LABELS[i]}</span>
              <span>{c}</span>
            </button>
          </li>
        ))}
      </ol>
      {answered && (
        <div className={`feedback ${selected === question.answer ? 'feedback-ok' : 'feedback-ng'}`} role="status">
          <p className="feedback-title">
            {selected === question.answer ? '正解！' : `不正解 — 正解は「${CHOICE_LABELS[question.answer]}」`}
          </p>
          <p>{question.explanation}</p>
          {exam?.authoredExplanation && <p className="hint">解説は本アプリ独自のものです。</p>}
        </div>
      )}
    </>
  );
}
