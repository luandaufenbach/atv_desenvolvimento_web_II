import Icon from './Icon';

// Status sempre como trio: texto + fundo tingido + borda de 1px
const TONES = {
  success: { fg: 'var(--status-success)', bg: 'var(--status-success-bg)', bd: 'var(--status-success-border)' },
  neutral: { fg: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)', bd: 'var(--status-neutral-border)' },
  error: { fg: 'var(--status-error)', bg: 'var(--status-error-bg)', bd: 'var(--status-error-border)' },
  premium: { fg: 'var(--status-premium)', bg: 'var(--status-premium-bg)', bd: 'var(--status-premium-border)' },
};

export default function Badge({ tone = 'neutral', icon, children, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: icon ? '0 11px 0 9px' : '0 11px',
        borderRadius: 'var(--radius-pill)',
        background: t.bg,
        border: '1px solid ' + t.bd,
        color: t.fg,
        font: '700 11px/1 var(--font-sans)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14} weight={500} />}
      {children}
    </span>
  );
}
