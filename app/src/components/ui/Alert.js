import Icon from './Icon';

// Mensagem de retorno da API: { message, status: 'ok' | 'error' | 'info' }
const TONS = {
  ok: { fg: 'var(--status-success)', bg: 'var(--status-success-bg)', bd: 'var(--status-success-border)', icon: 'check_circle' },
  error: { fg: 'var(--status-error)', bg: 'var(--status-error-bg)', bd: 'var(--status-error-border)', icon: 'error' },
  info: { fg: 'var(--status-premium)', bg: 'var(--status-premium-bg)', bd: 'var(--status-premium-border)', icon: 'info' },
};

export default function Alert({ mensagem, style }) {
  if (!mensagem || !mensagem.message) return null;
  const t = TONS[mensagem.status] || TONS.info;
  return (
    <div
      role={mensagem.status === 'error' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: t.bg,
        border: '1px solid ' + t.bd,
        color: t.fg,
        font: '500 14px/20px var(--font-sans)',
        ...style,
      }}
    >
      <Icon name={t.icon} size={20} />
      <span>{mensagem.message}</span>
    </div>
  );
}
