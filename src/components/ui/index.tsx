import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, type LucideIcon } from 'lucide-react';

/** 円形の進捗表示。value は 0〜100 */
export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  label,
  tone = 'primary',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  tone?: 'primary' | 'ok' | 'tech' | 'mgmt' | 'strat';
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span className={`ring ring-${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">{label ?? `${Math.round(clamped)}%`}</span>
    </span>
  );
}

/** ページの見出し。back を渡すと戻るリンクを表示する */
export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      {back && (
        <Link to={back.to} className="back-link">
          <ChevronLeft size={18} aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  );
}

/** 数値を大きく見せるタイル */
export function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  tone = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: 'primary' | 'ok' | 'warn' | 'ng';
}) {
  return (
    <div className={`stat-tile tone-${tone}`}>
      <span className="stat-icon">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </span>
    </div>
  );
}

/** 横長の進捗バー。value は 0〜100 */
export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'ok' | 'tech' | 'mgmt' | 'strat' }) {
  return (
    <span className={`pbar pbar-${tone}`} aria-hidden="true">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}
