import type { Question, Table } from '../data/types';

/** public/ 配下の図を、サブパス配信でも解決できる URL にする */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

function QuestionTable({ table }: { table: Table }) {
  return (
    <figure className="q-table">
      {table.caption && <figcaption>{table.caption}</figcaption>}
      <table className="table table-bordered">
        {table.header && (
          <thead>
            <tr>
              {table.header.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** 問題文・表・図をまとめて表示する(選択肢は呼び出し側で描画) */
export default function QuestionBody({ question }: { question: Question }) {
  return (
    <>
      <p className="question">{question.question}</p>
      {question.tables?.map((t, i) => <QuestionTable key={i} table={t} />)}
      {question.figures?.map((src) => (
        <img key={src} className="q-figure" src={assetUrl(src)} alt="問題の図" loading="lazy" />
      ))}
      {question.choiceFigure && (
        <img className="q-figure" src={assetUrl(question.choiceFigure)} alt="選択肢の図" loading="lazy" />
      )}
    </>
  );
}
