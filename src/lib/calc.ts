/**
 * 電卓の式の計算。eval を使わず、四則演算・かっこ・べき乗(^)・パーセント(%)だけを解釈する。
 * 表示用の記号(×, ÷, −)と全角の数字・記号も受け付ける。
 */

export class CalcError extends Error {}

type Token = { type: 'num'; value: number } | { type: 'op'; value: string };

/** 表示用の記号や全角文字を計算用の ASCII にそろえる */
export function normalize(expr: string): string {
  return expr
    .replace(/[０-９．（）＋＊／＾％]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[×＊]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/[−ー－]/g, '-')
    .replace(/,/g, '')
    .replace(/\s+/g, '');
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
      if (!m) throw new CalcError('数の書き方が正しくありません');
      tokens.push({ type: 'num', value: Number(m[1]) });
      i += m[1].length;
    } else if ('+-*/^()%'.includes(c)) {
      tokens.push({ type: 'op', value: c });
      i++;
    } else {
      throw new CalcError(`使えない文字があります: ${c}`);
    }
  }
  return tokens;
}

/** 式を計算する。式が正しくないときは CalcError を投げる */
export function evaluate(expr: string): number {
  const tokens = tokenize(normalize(expr));
  if (tokens.length === 0) throw new CalcError('式を入力してください');
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v: string) => peek()?.type === 'op' && peek().value === v;

  // expr = term (('+' | '-') term)*
  const parseExpr = (): number => {
    let v = parseTerm();
    while (isOp('+') || isOp('-')) {
      const op = tokens[pos++].value;
      const r = parseTerm();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };

  // term = unary (('*' | '/') unary | かっこの前の省略されたかけ算)*
  const parseTerm = (): number => {
    let v = parseUnary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = tokens[pos++].value;
        const r = parseUnary();
        if (op === '/' && r === 0) throw new CalcError('0 で割ることはできません');
        v = op === '*' ? v * r : v / r;
      } else if (isOp('(')) {
        // 2(3+4) や (1+2)(3+4) のような、かっこの前の省略されたかけ算
        v *= parseUnary();
      } else {
        return v;
      }
    }
  };

  // unary = ('-' | '+') unary | power
  const parseUnary = (): number => {
    if (isOp('-')) {
      pos++;
      return -parseUnary();
    }
    if (isOp('+')) {
      pos++;
      return parseUnary();
    }
    return parsePower();
  };

  // power = postfix ('^' unary)?  (右結合)
  const parsePower = (): number => {
    const base = parsePostfix();
    if (isOp('^')) {
      pos++;
      return base ** parseUnary();
    }
    return base;
  };

  // postfix = primary '%'*
  const parsePostfix = (): number => {
    let v = parsePrimary();
    while (isOp('%')) {
      pos++;
      v /= 100;
    }
    return v;
  };

  // primary = number | '(' expr ')'  (末尾の閉じかっこは省略可)
  const parsePrimary = (): number => {
    const t = peek();
    if (!t) throw new CalcError('式が途中で終わっています');
    if (t.type === 'num') {
      pos++;
      return t.value;
    }
    if (t.value === '(') {
      pos++;
      const v = parseExpr();
      if (isOp(')')) pos++;
      else if (pos < tokens.length) throw new CalcError('かっこの対応が正しくありません');
      return v;
    }
    throw new CalcError('式が正しくありません');
  };

  const value = parseExpr();
  if (pos < tokens.length) throw new CalcError('式が正しくありません');
  if (!Number.isFinite(value)) throw new CalcError('計算できない値です');
  return value;
}

/** 計算結果を表示用の文字列にする(桁区切りあり、誤差は 12 桁で丸める) */
export function formatNumber(value: number): string {
  const rounded = Number(value.toPrecision(12));
  if (Object.is(rounded, -0)) return '0';
  const abs = Math.abs(rounded);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) return rounded.toExponential(6).replace(/\.?0+e/, 'e');
  return rounded.toLocaleString('ja-JP', { maximumFractionDigits: 10 });
}

/** 式の続きに使うための、桁区切りなしの結果 */
export function plainNumber(value: number): string {
  return String(Number(value.toPrecision(12)));
}
