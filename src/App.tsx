import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router';
import AppShell from './components/AppShell';
import AccountPage from './pages/AccountPage';
import { BookmarksPage, CategoryPage, ExamPage, ExamsPage, FieldsPage } from './pages/ArchivePages';
import AmQuestionPage from './pages/AmQuestionPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import PmQuestionPage from './pages/PmQuestionPage';
import PracticePage from './pages/PracticePage';
import SearchPage from './pages/SearchPage';
import StatsPage from './pages/StatsPage';
import { SyncProvider } from './store/SyncContext';
import { UserDataProvider } from './store/UserDataContext';

/** 画面を移動したら先頭から表示する */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <AppShell>
      <ScrollToTop />
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
    </AppShell>
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
