import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  requirement?: string;
  reassurance?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  tone?: 'dark' | 'light';
}

export default function EmptyState({
  icon,
  title,
  description,
  requirement,
  reassurance,
  actionLabel,
  actionHref,
  onAction,
  tone = 'dark',
}: EmptyStateProps) {
  const isLight = tone === 'light';
  const cardClass = isLight
    ? 'border-luna-ink/10 bg-white text-luna-ink'
    : 'border-white/10 bg-white/[0.055] text-luna-cream';
  const mutedClass = isLight ? 'text-luna-ink/64' : 'text-luna-whisper/72';
  const quietClass = isLight ? 'text-luna-ink/54' : 'text-luna-whisper/60';
  const metaClass = isLight
    ? 'border-luna-ink/10 bg-luna-aurora-mint/14 text-luna-ink/68'
    : 'border-luna-whisper/10 bg-luna-whisper/[0.04] text-luna-whisper/72';
  const buttonClass = isLight
    ? 'bg-luna-ink text-white hover:bg-luna-ink/88'
    : 'bg-luna-cream text-luna-ink hover:bg-white';

  const action =
    actionLabel && actionHref ? (
      <Link href={actionHref} className={`inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${buttonClass}`}>
        {actionLabel}
      </Link>
    ) : actionLabel && onAction ? (
      <button type="button" onClick={onAction} className={`inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${buttonClass}`}>
        {actionLabel}
      </button>
    ) : null;

  return (
    <div className={`rounded-lg border p-5 text-center sm:p-6 ${cardClass}`}>
      {icon && (
        <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${isLight ? 'bg-luna-aurora-mint/18 text-luna-storm' : 'bg-luna-whisper/[0.06] text-luna-aurora-mint'}`}>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold leading-7">{title}</h3>
      <p className={`mx-auto mt-2 max-w-sm text-sm leading-6 ${mutedClass}`}>
        {description}
      </p>
      {(requirement || reassurance) && (
        <div className={`mx-auto mt-4 max-w-sm rounded-lg border px-3 py-2 text-xs leading-5 ${metaClass}`}>
          {requirement && <p>{requirement}</p>}
          {reassurance && <p className={requirement ? `mt-1 ${quietClass}` : quietClass}>{reassurance}</p>}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
