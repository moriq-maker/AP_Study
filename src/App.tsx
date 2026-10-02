import { useEffect, useState } from 'react';
import { EXAMS, PM_EXAMS, QUESTIONS, WRITTEN_QUESTIONS } from './data';
import type { Question, WrittenQuestion } from './data/types';
import { buildQuiz, type AnswerRecord, type QuizSettings } from './lib/quiz';
import { clearHistory, loadHistory, recordAnswer, saveHistory, type History } from './lib/storage';
import {
  clearWrittenHistory,
  loadWrittenHistory,
  recordWritten,
  saveWrittenHistory,
  type WrittenHistory,
} from './lib/written';
import Home from './components/Home';
import Library from './components/Library';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Stats from './components/Stats';
import WrittenList from './components/WrittenList';
import WrittenQuiz from './components/WrittenQuiz';

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; questions: Question[] }
  | { name: 'result'; questions: Question[]; answers: AnswerRecord[] }
  | { name: 'stats' }
  | { name: 'library' }
  | { name: 'written-list' }
  | { name: 'written'; question: WrittenQuestion };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [history, setHistory] = useState<History>(() => loadHistory());
  const [writtenHistory, setWrittenHistory] = useState<WrittenHistory>(() => loadWrittenHistory());

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveWrittenHistory(writtenHistory);
  }, [writtenHistory]);

  // 画面を切り替えたら先頭から表示する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const start = (settings: QuizSettings) => {
    const questions = buildQuiz(QUESTIONS, settings, history);
    if (questions.length > 0) setScreen({ name: 'quiz', questions });
  };

  const handleAnswer = (record: AnswerRecord) => {
    setHistory((h) => recordAnswer(h, record.questionId, record.correct));
  };

  const reset = () => {
    clearHistory();
    clearWrittenHistory();
    setHistory({});
    setWrittenHistory({});
  };

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => setScreen({ name: 'home' })}>
          AP Study
          <span className="brand-sub">応用情報技術者試験 問題演習</span>
        </button>
        <nav className="nav">
          <button className="link" onClick={() => setScreen({ name: 'library' })}>
            午前一覧
          </button>
          <button className="link" onClick={() => setScreen({ name: 'written-list' })}>
            午後問題
          </button>
          <button className="link" onClick={() => setScreen({ name: 'stats' })}>
            学習記録
          </button>
        </nav>
      </header>
      <main>
        {screen.name === 'home' && <Home exams={EXAMS} questions={QUESTIONS} history={history} onStart={start} />}
        {screen.name === 'quiz' && (
          <Quiz
            questions={screen.questions}
            onAnswer={handleAnswer}
            onFinish={(answers) => setScreen({ name: 'result', questions: screen.questions, answers })}
            onQuit={() => setScreen({ name: 'home' })}
          />
        )}
        {screen.name === 'result' && (
          <Result
            questions={screen.questions}
            answers={screen.answers}
            onRetryWrong={(qs) => setScreen({ name: 'quiz', questions: qs })}
            onHome={() => setScreen({ name: 'home' })}
          />
        )}
        {screen.name === 'library' && (
          <Library exams={EXAMS} questions={QUESTIONS} history={history} onHome={() => setScreen({ name: 'home' })} />
        )}
        {screen.name === 'written-list' && (
          <WrittenList
            exams={PM_EXAMS}
            questions={WRITTEN_QUESTIONS}
            history={writtenHistory}
            onOpen={(question) => setScreen({ name: 'written', question })}
          />
        )}
        {screen.name === 'written' && (
          <WrittenQuiz
            key={screen.question.id}
            question={screen.question}
            previous={writtenHistory[screen.question.id]}
            onSubmit={(inputs, marks) => setWrittenHistory((h) => recordWritten(h, screen.question.id, inputs, marks))}
            onBack={() => setScreen({ name: 'written-list' })}
          />
        )}
        {screen.name === 'stats' && (
          <Stats
            questions={QUESTIONS}
            history={history}
            writtenQuestions={WRITTEN_QUESTIONS}
            writtenHistory={writtenHistory}
            onReset={reset}
            onHome={() => setScreen({ name: 'home' })}
          />
        )}
      </main>
    </div>
  );
}
