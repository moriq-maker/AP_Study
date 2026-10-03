import { useEffect, useState } from 'react';
import { Download, Smartphone, Trash2 } from 'lucide-react';
import { clearPmPages, countCachedPmPages, downloadPmPages, offlineSupported, pmPageUrls } from '../lib/offline';
import { useOnline } from '../lib/useOnline';
import { percent } from '../lib/quiz';
import { ProgressBar } from './ui';

/** 午後の問題冊子(全ページ)の合計サイズの目安 */
const PM_TOTAL_MB = 21;

/** オフライン用のダウンロードと、ホーム画面への追加の案内 */
export default function OfflinePanel() {
  const online = useOnline();
  const total = pmPageUrls().length;
  const [cached, setCached] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void countCachedPmPages().then(setCached);
  }, []);

  if (!offlineSupported()) return null;

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      await downloadPmPages((done) => setCached(done));
    } catch {
      setError('ダウンロードが途中で止まりました。通信環境を確認して、もう一度お試しください。');
      setCached(await countCachedPmPages());
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!window.confirm('保存した午後の問題文を削除します。よろしいですか？(開いた問題は自動でまた保存されます)')) return;
    await clearPmPages();
    setCached(0);
  };

  const done = cached ?? 0;
  return (
    <section className="panel offline-panel">
      <h2>オフラインで使う</h2>
      <p className="hint">
        アプリ本体と午前の問題は、一度開くと自動で端末に保存され、圏外でも解けます。午後の問題文(画像)は開いたものから保存されます。
      </p>
      <div className="offline-progress">
        <span>
          午後の問題文 {done} / {total} ページ保存済み
        </span>
        <ProgressBar value={percent(done, total)} tone={done === total ? 'ok' : 'primary'} />
      </div>
      <div className="auth-actions">
        {done < total && (
          <button className="btn btn-primary" onClick={() => void download()} disabled={busy || !online}>
            <Download size={16} aria-hidden="true" />
            {busy ? `保存中… ${percent(done, total)}%` : `すべて保存(約 ${PM_TOTAL_MB}MB)`}
          </button>
        )}
        {done > 0 && !busy && (
          <button className="btn btn-ghost" onClick={() => void clear()}>
            <Trash2 size={16} aria-hidden="true" />
            保存した問題文を削除
          </button>
        )}
      </div>
      {!online && done < total && <p className="hint">ダウンロードは通信できるときに行えます。</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="install-hint">
        <Smartphone size={18} aria-hidden="true" />
        <p className="hint">
          iPhone は Safari の共有ボタン →「ホーム画面に追加」、Android は Chrome のメニュー →「ホーム画面に追加」で、アプリのように全画面で使えます。Wi-Fi のときに「すべて保存」しておくと、通信量を気にせず勉強できます。
        </p>
      </div>
    </section>
  );
}
