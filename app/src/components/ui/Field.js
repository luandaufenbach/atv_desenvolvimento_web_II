// Rótulo + campo + dica/erro (usado por todos os campos de formulário)
export default function Field({ label, htmlFor, hint, error, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{ font: '700 11px/14px var(--font-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span style={{ font: '400 12px/16px var(--font-sans)', color: error ? 'var(--status-error)' : 'var(--text-muted)' }}>{error || hint}</span>
      )}
    </div>
  );
}
