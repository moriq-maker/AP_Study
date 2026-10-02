import type { Exam, WrittenQuestion } from '../data/types';
import { percent } from '../lib/quiz';
import type { WrittenHistory } from '../lib/written';

interface Props {
  exams: readonly Exam[];
  questions: readonly WrittenQuestion[];
  history: WrittenHistory;
  onOpen: (question: WrittenQuestion) => void;
}

export default function WrittenList({ exams, questions, history, onOpen }: Props) {
  return (
    <div className="card">
      <h1>午後問題</h1>
      <p className="hint">
        問題冊子のページを見ながら設問に解答し、解答例と照合します。記号・数値・用語は自動採点、文章の設問は解答例を見て自己採点します。
      </p>
      {exams.map((exam) => (
        <section key={exam.id}>
          <h2>{exam.title}</h2>
          <ul className="library">
            {questions
              .filter((q) => q.examId === exam.id)
              .map((q) => {
                const h = history[q.id];
                return (
                  <li key={q.id}>
                    <button className="library-row" onClick={() => onOpen(q)}>
                      <span className="library-meta">
                        <span>
                          問{q.number}
                          {q.required ? '(必須)' : ''}
                        </span>
                        <span className="tag">{q.category}</span>
                        {h ? (
                          <span className={h.lastCorrect / h.total >= 0.6 ? 'status status-ok' : 'status status-ng'}>
                            前回 {percent(h.lastCorrect, h.total)}%
                          </span>
                        ) : (
                          <span className="status">未解答</span>
                        )}
                      </span>
                      <span className="library-title">{q.theme}</span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
