import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import {
  Bookmark,
  ChartColumn,
  Cloud,
  CloudOff,
  House,
  Layers,
  Library,
  PenLine,
  RefreshCw,
  WifiOff,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOnline } from '../lib/useOnline';
import { useSync } from '../store/SyncContext';
import { assetUrl } from './QuestionBody';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** スマホの下部タブに出すか */
  tab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'ホーム', icon: House, tab: true },
  { to: '/exams', label: '過去問倉庫', icon: Library, tab: true },
  { to: '/fields', label: '分野別', icon: Layers, tab: true },
  { to: '/practice', label: '演習', icon: PenLine, tab: true },
  { to: '/stats', label: '記録', icon: ChartColumn, tab: true },
  { to: '/search', label: '検索', icon: Search },
  { to: '/bookmarks', label: 'ブックマーク', icon: Bookmark },
];

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

/** ライト/ダークで画像を切り替える */
function ThemedImg({ light, dark, alt, className }: { light: string; dark?: string; alt: string; className: string }) {
  return (
    <picture>
      {dark && <source srcSet={assetUrl(dark)} media="(prefers-color-scheme: dark)" />}
      <img className={className} src={assetUrl(light)} alt={alt} />
    </picture>
  );
}

/** ロゴ。PC のサイドバーは縦組みのロゴ、スマホの上部バーはマーク + 文字の横組み */
function Brand({ variant }: { variant: 'full' | 'compact' }) {
  return (
    <Link to="/" className={`brand brand-${variant}`} aria-label="AP Study ホーム">
      {variant === 'full' ? (
        <ThemedImg className="brand-logo" light="brand/logo.webp" dark="brand/logo-dark.webp" alt="AP Study" />
      ) : (
        <>
          <ThemedImg className="brand-mark-img" light="brand/mark.webp" alt="" />
          <ThemedImg className="brand-wordmark" light="brand/wordmark.webp" dark="brand/wordmark-dark.webp" alt="AP Study" />
        </>
      )}
    </Link>
  );
}

/** ログイン・同期状態のバッジ */
function AccountBadge({ compact = false }: { compact?: boolean }) {
  const { account, status } = useSync();
  const label = !account ? 'ログイン' : status === 'error' ? '同期エラー' : status === 'offline' ? 'オフライン' : status === 'syncing' ? '同期中' : '同期済み';
  const Icon = !account ? UserRound : status === 'error' || status === 'offline' ? CloudOff : Cloud;
  return (
    <NavLink to="/account" className={({ isActive }) => `account-badge ${isActive ? 'active' : ''} sync-${account ? status : 'none'}`}>
      <Icon size={18} aria-hidden="true" />
      {!compact && <span>{account ? account.email : label}</span>}
      {compact && <span className="sr-only">{label}</span>}
    </NavLink>
  );
}

/** 圏外のときの帯と、新しいバージョンが届いたときの更新案内 */
function StatusToasts() {
  const online = useOnline();
  // 圏外になったときに数秒だけ知らせる
  const [showOffline, setShowOffline] = useState(false);
  useEffect(() => {
    setShowOffline(!online);
    if (online) return;
    const timer = setTimeout(() => setShowOffline(false), 6000);
    return () => clearTimeout(timer);
  }, [online]);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  return (
    <div className="toasts" aria-live="polite">
      {showOffline && (
        <div className="toast toast-muted">
          <WifiOff size={16} aria-hidden="true" />
          <span>オフラインです。解いた記録は端末に保存され、つながったら同期されます。</span>
        </div>
      )}
      {needRefresh && (
        <div className="toast">
          <RefreshCw size={16} aria-hidden="true" />
          <span>新しいバージョンがあります</span>
          <button className="btn btn-primary btn-sm" onClick={() => void updateServiceWorker(true)}>
            更新
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setNeedRefresh(false)}>
            あとで
          </button>
        </div>
      )}
    </div>
  );
}

/** PC はサイドバー、スマホは上部バー + 下部タブのレイアウト */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="メインメニュー">
        <Brand variant="full" />
        <nav className="side-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navClass}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <AccountBadge />
        </div>
      </aside>

      <header className="topbar">
        <Brand variant="compact" />
        <div className="topbar-actions">
          <NavLink to="/search" className={navClass} aria-label="検索">
            <Search size={20} />
          </NavLink>
          <NavLink to="/bookmarks" className={navClass} aria-label="ブックマーク">
            <Bookmark size={20} />
          </NavLink>
          <AccountBadge compact />
        </div>
      </header>

      <main className="content">{children}</main>
      <StatusToasts />

      <nav className="tabbar" aria-label="メインメニュー">
        {NAV_ITEMS.filter((item) => item.tab).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass}>
            <Icon size={22} aria-hidden="true" />
            <span>{label === '過去問倉庫' ? '倉庫' : label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
