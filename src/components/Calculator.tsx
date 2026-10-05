import { useEffect, useRef, useState } from 'react';
import { Calculator as CalculatorIcon, Delete, X } from 'lucide-react';
import { CalcError, evaluate, formatNumber, plainNumber } from '../lib/calc';

type Key = { label: string; insert?: string; action?: 'clear' | 'back' | 'equals'; kind?: 'op' | 'fn' | 'eq'; wide?: boolean; aria?: string };

// 5 列で並べる(スマホで問題文をなるべく隠さないように段数を減らす)
const KEYS: Key[] = [
  { label: '7', insert: '7' },
  { label: '8', insert: '8' },
  { label: '9', insert: '9' },
  { label: '÷', insert: '÷', kind: 'op', aria: '割る' },
  { label: 'C', action: 'clear', kind: 'fn', aria: 'クリア' },
  { label: '4', insert: '4' },
  { label: '5', insert: '5' },
  { label: '6', insert: '6' },
  { label: '×', insert: '×', kind: 'op', aria: 'かける' },
  { label: '⌫', action: 'back', kind: 'fn', aria: '1 文字消す' },
  { label: '1', insert: '1' },
  { label: '2', insert: '2' },
  { label: '3', insert: '3' },
  { label: '−', insert: '−', kind: 'op', aria: '引く' },
  { label: '(', insert: '(', kind: 'fn' },
  { label: '0', insert: '0' },
  { label: '.', insert: '.', aria: '小数点' },
  { label: '%', insert: '%', kind: 'fn', aria: 'パーセント' },
  { label: '+', insert: '+', kind: 'op', aria: '足す' },
  { label: ')', insert: ')', kind: 'fn' },
  { label: 'xʸ', insert: '^', kind: 'fn', aria: 'べき乗' },
  { label: '=', action: 'equals', kind: 'eq', wide: true, aria: '計算する' },
];

/** キーボードで打った記号を表示用の記号にそろえる */
const toDisplay = (s: string) => s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');

/** 式の途中結果(計算できないときは空) */
function preview(expr: string): string {
  try {
    return formatNumber(evaluate(expr));
  } catch {
    return '';
  }
}

/**
 * 計算問題用の電卓。右下のボタンで開閉する。
 * 開いている間は問題を移動しても式が残る。
 */
export default function Calculator() {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // = の直後か(続けて数字を押すと新しい式、演算子を押すと結果の続きから計算する)
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  const insert = (s: string) => {
    setError(null);
    setExpr((cur) => (done && /^[0-9.(]/.test(s) ? s : cur + s));
    setDone(false);
  };

  const run = () => {
    if (!expr.trim()) return;
    try {
      const value = evaluate(expr);
      setHistory(`${expr} =`);
      setExpr(plainNumber(value));
      setError(null);
      setDone(true);
    } catch (e) {
      setError(e instanceof CalcError ? e.message : '計算できませんでした');
    }
  };

  const press = (key: Key) => {
    if (key.action === 'clear') {
      setExpr('');
      setHistory(null);
      setError(null);
      setDone(false);
    } else if (key.action === 'back') {
      setExpr((cur) => cur.slice(0, -1));
      setError(null);
      setDone(false);
    } else if (key.action === 'equals') {
      run();
    } else if (key.insert) {
      insert(key.insert);
    }
    inputRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (done && e.key.length === 1 && /[0-9.(]/.test(e.key)) {
      // = の直後に数字を打ったら新しい式にする
      e.preventDefault();
      insert(e.key);
    }
  };

  const live = done ? '' : preview(expr);

  return (
    <>
      <button
        type="button"
        className={`calc-fab ${open ? 'calc-fab-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="calculator"
        aria-label={open ? '電卓を閉じる' : '電卓を開く'}
        title="電卓"
      >
        {open ? <X size={22} /> : <CalculatorIcon size={22} />}
      </button>

      {open && (
        <section id="calculator" className="calc" role="dialog" aria-label="電卓" data-calculator>
          <div className="calc-head">
            <span className="calc-title">
              <CalculatorIcon size={16} aria-hidden="true" />
              電卓
            </span>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="電卓を閉じる">
              <X size={18} />
            </button>
          </div>
          <div className="calc-screen">
            <div className="calc-history" aria-live="polite">
              {history ?? ' '}
            </div>
            <input
              ref={inputRef}
              className="calc-input"
              value={done ? formatNumber(Number(expr)) : expr}
              onChange={(e) => {
                setExpr(toDisplay(e.target.value));
                setError(null);
                setDone(false);
              }}
              onKeyDown={onKeyDown}
              inputMode="none"
              autoComplete="off"
              spellCheck={false}
              aria-label="式"
              placeholder="0"
            />
            <div className={`calc-sub ${error ? 'calc-error' : ''}`} role={error ? 'alert' : undefined}>
              {error ?? (live && live !== expr ? `= ${live}` : ' ')}
            </div>
          </div>
          <div className="calc-keys">
            {KEYS.map((k) => (
              <button
                key={k.label}
                type="button"
                className={`calc-key ${k.kind ? `calc-key-${k.kind}` : ''} ${k.wide ? 'calc-key-wide' : ''}`}
                // ボタンを押しても入力欄からフォーカスを外さない(キーボード入力を続けられるように)
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => press(k)}
                aria-label={k.aria ?? k.label}
              >
                {k.action === 'back' ? <Delete size={18} aria-hidden="true" /> : k.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
