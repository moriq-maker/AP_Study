import { useState } from 'react';
import { Cloud, CloudOff, LogOut, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui';
import OfflinePanel from '../components/OfflinePanel';
import { useSync, type SyncStatus } from '../store/SyncContext';

const STATUS_TEXT: Record<SyncStatus, string> = {
  checking: 'ログイン状態を確認中…',
  'signed-out': '未ログイン',
  syncing: '同期中…',
  synced: '同期済み',
  offline: 'オフライン(つながったら自動で同期します)',
  error: '同期エラー',
};

function errorText(e: unknown): string {
  const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  if (/rate limit/i.test(msg)) return '短時間に何度も送信したため制限されています。しばらく待ってから再度お試しください。';
  if (/expired|invalid/i.test(msg)) return 'コードが正しくないか、有効期限が切れています。もう一度コードを送信してください。';
  if (/fetch|network/i.test(msg)) return 'サーバに接続できませんでした。通信環境を確認してください。';
  return msg;
}

/** ログインと端末間同期 */
export default function AccountPage() {
  const sync = useSync();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (sync.account) {
    return (
      <div className="page page-narrow">
        <PageHeader title="アカウント" />
        <section className="panel auth-card">
          <span className={`auth-icon sync-${sync.status}`}>
            {sync.status === 'error' || sync.status === 'offline' ? <CloudOff size={28} aria-hidden="true" /> : <Cloud size={28} aria-hidden="true" />}
          </span>
          <p className="auth-email">{sync.account.email}</p>
          <p className={`sync-status sync-${sync.status}`}>
            {STATUS_TEXT[sync.status]}
            {sync.lastSyncedAt && sync.status === 'synced' && `(${sync.lastSyncedAt.toLocaleTimeString()})`}
          </p>
          {sync.error && <p className="error">エラー: {errorText(sync.error)}</p>}
          <p className="hint">
            解答履歴・ブックマーク・メモは自動で同期されます。別の端末で同じメールアドレスでログインすると、記録が統合されます。
          </p>
          <div className="auth-actions">
            <button className="btn btn-secondary" onClick={() => void run(sync.syncNow)} disabled={busy}>
              <RefreshCw size={16} aria-hidden="true" />
              今すぐ同期
            </button>
            <button
              className="btn btn-danger-ghost"
              disabled={busy}
              onClick={() => {
                if (window.confirm('ログアウトします。この端末の学習データは消えますが、サーバには残ります。よろしいですか？')) {
                  void run(sync.signOut);
                }
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              ログアウト
            </button>
          </div>
        </section>
        <OfflinePanel />
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <PageHeader title="ログイン" />
      <section className="panel auth-card">
        <span className="auth-icon">
          {step === 'email' ? <Mail size={28} aria-hidden="true" /> : <ShieldCheck size={28} aria-hidden="true" />}
        </span>
        <p className="hint">
          ログインすると、学習記録・ブックマーク・メモが端末間で同期されます。ログインしなくても、この端末の中で記録は保存されます。
        </p>
        {sync.status === 'checking' ? (
          <p className="hint">{STATUS_TEXT.checking}</p>
        ) : step === 'email' ? (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await sync.sendCode(email.trim());
                setStep('code');
              });
            }}
          >
            <label htmlFor="email">メールアドレス</label>
            <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-primary" type="submit" disabled={busy || !email.trim()}>
              {busy ? '送信中…' : 'ログインコードを送る'}
            </button>
            <p className="hint">初めての場合はアカウントが作成されます。パスワードは不要です。</p>
          </form>
        ) : (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => sync.verifyCode(email.trim(), code));
            }}
          >
            <p>
              <strong>{email}</strong> にメールを送りました。メールに書かれた数字のコード(6〜8 桁)を入力するか、メール内のリンクを開いてください。
            </p>
            <label htmlFor="code">ログインコード</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={busy || code.trim().length < 6}>
              {busy ? '確認中…' : 'ログイン'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setStep('email');
                setCode('');
              }}
            >
              メールアドレスを変更 / 再送する
            </button>
          </form>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
      <OfflinePanel />
    </div>
  );
}
