import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import PracticeSettings from '../components/PracticeSettings';
import Quiz from '../components/Quiz';
import Result from '../components/Result';
import { EXAMS, QUESTIONS } from '../data';
import type { Question } from '../data/types';
import { buildQuiz, type AnswerRecord, type QuizSettings } from '../lib/quiz';
import { useUserData } from '../store/UserDataContext';

type Step =
  | { name: 'settings' }
  | { name: 'quiz'; questions: Question[]; round: number }
  | { name: 'result'; questions: Question[]; answers: AnswerRecord[] };

/** URL の ?exam=…&order=number&count=80&category=…&mode=weak から初期設定を作る */
function initialFromParams(params: URLSearchParams): Partial<QuizSettings> {
  const initial: Partial<QuizSettings> = {};
  const exam = params.get('exam');
  if (exam) initial.examIds = [exam];
  const category = params.get('category');
  if (category) initial.categories = [category];
  if (params.get('order') === 'number') initial.order = 'number';
  const mode = params.get('mode');
  if (mode === 'weak' || mode === 'unanswered') initial.mode = mode;
  const count = Number(params.get('count'));
  if ([5, 10, 20, 80].includes(count)) initial.count = count;
  return initial;
}

/** 演習: 条件を選んで連続で解く */
export default function PracticePage() {
  const [params] = useSearchParams();
  const { data, recordAm } = useUserData();
  const [step, setStep] = useState<Step>({ name: 'settings' });

  const start = (settings: QuizSettings) => {
    const questions = buildQuiz(QUESTIONS, settings, data.am);
    if (questions.length > 0) setStep({ name: 'quiz', questions, round: 0 });
  };

  const onAnswer = useCallback((r: AnswerRecord) => recordAm(r.questionId, r.correct), [recordAm]);

  if (step.name === 'quiz') {
    return (
      <Quiz
        key={step.round}
        questions={step.questions}
        onAnswer={onAnswer}
        onFinish={(answers) => setStep({ name: 'result', questions: step.questions, answers })}
        onQuit={() => setStep({ name: 'settings' })}
      />
    );
  }
  if (step.name === 'result') {
    return (
      <Result
        questions={step.questions}
        answers={step.answers}
        onRetryWrong={(questions) => setStep({ name: 'quiz', questions, round: Date.now() })}
        onHome={() => setStep({ name: 'settings' })}
      />
    );
  }
  return (
    <PracticeSettings
      key={params.toString()}
      exams={EXAMS}
      questions={QUESTIONS}
      history={data.am}
      initial={initialFromParams(params)}
      onStart={start}
    />
  );
}
