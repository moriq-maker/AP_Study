import { useEffect, useState } from 'react';
import { QUESTIONS } from './data/questions';
import type { Question } from './data/types';
import { buildQuiz, type AnswerRecord, type QuizSettings } from './lib/quiz';
import { clearHistory, loadHistory, recordAnswer, saveHistory, type History } from './lib/storage';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Stats from './components/Stats';

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; questions: Question[] }
  | { name: 'result'; questions: Question[]; answers: AnswerRecord[] }
  | { name: 'stats' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [history, setHistory] = useState<History>(() => loadHistory());

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const start = (settings: QuizSettings) => {
    const questions = buildQuiz(QUESTIONS, settings, history);
    if (questions.length > 0) setScreen({ name: 'quiz', questions });
  };

  const handleAnswer = (record: AnswerRecord) => {
    setHistory((h) => recordAnswer(h, record.questionId, record.correct));
  };

  const reset = () => {
    clearHistory();
    setHistory({});
  };

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => setScreen({ name: 'home' })}>
          AP Study
          <span className="brand-sub">応用情報技術者試験 午前問題演習</span>
        </button>
        <nav>
          <button className="link" onClick={() => setScreen({ name: 'stats' })}>
            学習記録
          </button>
        </nav>
      </header>
      <main>
        {screen.name === 'home' && <Home questions={QUESTIONS} history={history} onStart={start} />}
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
        {screen.name === 'stats' && (
          <Stats questions={QUESTIONS} history={history} onReset={reset} onHome={() => setScreen({ name: 'home' })} />
        )}
      </main>
    </div>
  );
}
