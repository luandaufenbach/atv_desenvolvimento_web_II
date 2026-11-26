// Número de destaque com rótulo (usado no início do Admin)
export default function StatCard({ label, value, style }) {
  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
        ...style,
      }}
    >
      <span style={{ font: '700 11px/14px var(--font-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ font: '600 28px/34px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
