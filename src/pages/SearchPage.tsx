import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { AmQuestionList, PmQuestionList } from '../components/QuestionLists';
import { EXAMS, QUESTIONS, WRITTEN_QUESTIONS } from '../data';
import { FIELD_LABELS, type Field } from '../data/types';
import { useUserData } from '../store/UserDataContext';

const PAGE_SIZE = 50;

/** 問題検索: 試験・分野・キーワードで午前問題を絞り込み、午後問題はテーマ・分野で検索する */
export default function SearchPage() {
  const { data } = useUserData();
  // キーワードは URL に残して、戻ったときに検索結果を復元できるようにする
  const [params, setParams] = useSearchParams();
  const keyword = params.get('q') ?? '';
  const [examId, setExamId] = useState('');
  const [field, setField] = useState<Field | ''>('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const kw = keyword.trim().toLowerCase();
  const am = useMemo(
    () =>
      QUESTIONS.filter(
        (q) =>
          (!examId || q.examId === examId) &&
          (!field || q.field === field) &&
          (!kw || [q.question, q.category, ...q.choices, q.explanation].some((t) => t.toLowerCase().includes(kw))),
      ),
    [examId, field, kw],
  );
  const pm = useMemo(
    () => (kw ? WRITTEN_QUESTIONS.filter((q) => [q.theme, q.category, q.aim].some((t) => t.toLowerCase().includes(kw))) : []),
    [kw],
  );

  return (
    <div className="page">
      <PageHeader title="検索" subtitle="キーワード・試験・分野で問題を探せます。" />
      <div className="search-bar">
        <label className="search-input">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            placeholder="キーワード(例: ハッシュ, SQL, EVM)"
            value={keyword}
            onChange={(e) => {
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
              setLimit(PAGE_SIZE);
            }}
            aria-label="キーワード"
            autoFocus
          />
        </label>
        <div className="search-filters">
          <select value={examId} onChange={(e) => setExamId(e.target.value)} aria-label="試験">
            <option value="">すべての試験</option>
            {EXAMS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <select value={field} onChange={(e) => setField(e.target.value as Field | '')} aria-label="分野">
            <option value="">すべての分野</option>
            {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
              <option key={f} value={f}>
                {FIELD_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>午前({am.length} 問)</h2>
        </div>
        <div className="panel panel-flush">
          <AmQuestionList questions={am.slice(0, limit)} data={data} showExam />
          {am.length > limit && (
            <button className="more-button" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              さらに表示(残り {am.length - limit} 問)
            </button>
          )}
        </div>
      </section>

      {kw && (
        <section className="section">
          <div className="section-head">
            <h2>午後({pm.length} 問)</h2>
          </div>
          <p className="hint">午後問題は問題文が画像のため、テーマ・分野・出題趣旨から検索します。</p>
          <div className="panel panel-flush">
            <PmQuestionList questions={pm} data={data} showExam />
          </div>
        </section>
      )}
    </div>
  );
}
