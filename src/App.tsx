import { useEffect } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router';
import AccountPage from './pages/AccountPage';
import { BookmarksPage, CategoryPage, ExamPage, ExamsPage, FieldsPage } from './pages/ArchivePages';
import AmQuestionPage from './pages/AmQuestionPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import PmQuestionPage from './pages/PmQuestionPage';
import PracticePage from './pages/PracticePage';
import SearchPage from './pages/SearchPage';
import StatsPage from './pages/StatsPage';
import { SyncProvider, useSync } from './store/SyncContext';
import { UserDataProvider } from './store/UserDataContext';

const NAV_ITEMS = [
  { to: '/exams', label: '過去問倉庫' },
  { to: '/fields', label: '分野別' },
  { to: '/practice', label: '演習' },
  { to: '/search', label: '検索' },
  { to: '/bookmarks', label: 'ブックマーク' },
  { to: '/stats', label: '記録' },
];

/** 画面を移動したら先頭から表示する */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** ヘッダーのアカウント表示(ログイン状態と同期状態) */
function AccountLink() {
  const { account, status } = useSync();
  return (
    <NavLink to="/account" className={({ isActive }) => `nav-link account-link ${isActive ? 'nav-active' : ''}`}>
      {account ? (
        <>
          <span className={`sync-dot sync-${status}`} aria-hidden="true" />
          {status === 'error' ? '同期エラー' : 'アカウント'}
        </>
      ) : (
        'ログイン'
      )}
    </NavLink>
  );
}

function Layout() {
  return (
    <div className="app">
      <ScrollToTop />
      <header className="app-header">
        <Link to="/" className="brand">
          AP Study
          <span className="brand-sub">応用情報技術者試験 過去問演習</span>
        </Link>
        <nav className="nav" aria-label="メインメニュー">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <AccountLink />
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/exams/:examId" element={<ExamPage />} />
          <Route path="/q/:id" element={<AmQuestionPage />} />
          <Route path="/pm/:id" element={<PmQuestionPage />} />
          <Route path="/fields" element={<FieldsPage />} />
          <Route path="/fields/:category" element={<CategoryPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

// 静的ホスティング(GitHub Pages など)でもページ単位の URL が動くようにハッシュ方式のルーティングを使う
export default function App() {
  return (
    <HashRouter>
      <UserDataProvider>
        <SyncProvider>
          <Layout />
        </SyncProvider>
      </UserDataProvider>
    </HashRouter>
  );
}
