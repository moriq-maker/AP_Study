import { Link } from 'react-router';
import { House, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page">
      <div className="panel empty-state">
        <SearchX size={48} aria-hidden="true" />
        <h1>ページが見つかりません</h1>
        <p className="hint">URL が間違っているか、問題が削除された可能性があります。</p>
        <Link className="btn btn-primary" to="/">
          <House size={18} aria-hidden="true" />
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
