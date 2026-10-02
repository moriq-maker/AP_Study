import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="card">
      <h1>ページが見つかりません</h1>
      <p>URL が間違っているか、問題が削除された可能性があります。</p>
      <Link to="/">ホームへ戻る</Link>
    </div>
  );
}
