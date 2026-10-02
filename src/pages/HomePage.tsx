import { Link } from 'react-router';
import { ProgressSummary } from '../components/QuestionLists';
import { EXAMS, PM_EXAMS, QUESTIONS, WRITTEN_QUESTIONS, getQuestion, getWrittenQuestion, questionLabel } from '../data';
import { amStatus, isBookmarked, pmItemKey } from '../lib/userData';
import { useUserData } from '../store/UserDataContext';

/** ホーム: 進捗と各機能への入口 */
export default function HomePage() {
  const { data } = useUserData();
  const answered = QUESTIONS.filter((q) => amStatus(data, q.id) !== 'unanswered').length;
  const correct = QUESTIONS.filter((q) => amStatus(data, q.id) === 'correct').length;
  const wrong = answered - correct;
  const pmItemsTotal = WRITTEN_QUESTIONS.reduce((n, q) => n + q.items.length, 0);
  const pmItemsAnswered = WRITTEN_QUESTIONS.reduce(
    (n, q) => n + q.items.filter((_, i) => data.pm[pmItemKey(q.id, i)]).length,
    0,
  );
  const pmItemsCorrect = WRITTEN_QUESTIONS.reduce(
    (n, q) => n + q.items.filter((_, i) => data.pm[pmItemKey(q.id, i)]?.lastCorrect).length,
    0,
  );
  const bookmarks = Object.keys(data.bookmarks).filter((id) => isBookmarked(data, id)).length;

  // 最近解いた問題(午前・午後をまとめて新しい順に 5 件)
  const recent = [
    ...Object.entries(data.am).map(([id, s]) => ({ id, at: s.updatedAt, pm: false })),
    ...Object.entries(data.pm).map(([key, s]) => ({ id: key.split('#')[0], at: s.updatedAt, pm: true })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i)
    .slice(0, 5);

  return (
    <>
      <div className="card">
        <h1>応用情報技術者試験 過去問演習</h1>
        <p className="hint">
          午前 {EXAMS.length} 回分 {QUESTIONS.length} 問 ・ 午後 {PM_EXAMS.length} 回分 {WRITTEN_QUESTIONS.length} 問を収録
        </p>
        <h2>午前の進捗</h2>
        <ProgressSummary answered={answered} total={QUESTIONS.length} correct={correct} />
        <h2>午後の進捗</h2>
        <ProgressSummary answered={pmItemsAnswered} total={pmItemsTotal} correct={pmItemsCorrect} />
        <p className="hint">午後は解答欄の数で数えています。</p>
      </div>

      <ul className="menu-grid">
        <li>
          <Link to="/exams" className="menu-card">
            <strong>過去問倉庫</strong>
            <span className="hint">年度ごとに問題を一覧・個別に解く</span>
          </Link>
        </li>
        <li>
          <Link to="/fields" className="menu-card">
            <strong>分野別</strong>
            <span className="hint">全年度を分野ごとに横断して解く</span>
          </Link>
        </li>
        <li>
          <Link to="/practice" className="menu-card">
            <strong>演習</strong>
            <span className="hint">条件を選んでランダム・本番形式で解く</span>
          </Link>
        </li>
        <li>
          <Link to="/practice?mode=weak&count=10" className="menu-card">
            <strong>苦手を復習</strong>
            <span className="hint">前回間違えた問題 {wrong} 問</span>
          </Link>
        </li>
        <li>
          <Link to="/bookmarks" className="menu-card">
            <strong>ブックマーク</strong>
            <span className="hint">{bookmarks} 件</span>
          </Link>
        </li>
        <li>
          <Link to="/search" className="menu-card">
            <strong>検索</strong>
            <span className="hint">キーワードで問題を探す</span>
          </Link>
        </li>
      </ul>

      {recent.length > 0 && (
        <div className="card">
          <h2>最近解いた問題</h2>
          <ul className="library">
            {recent.map((r) => {
              const q = r.pm ? getWrittenQuestion(r.id) : getQuestion(r.id);
              if (!q) return null;
              return (
                <li key={r.id}>
                  <Link className="library-row" to={r.pm ? `/pm/${r.id}` : `/q/${r.id}`}>
                    <span className="library-meta">
                      <span>{questionLabel(q)}</span>
                      <span className="tag">{q.category}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
