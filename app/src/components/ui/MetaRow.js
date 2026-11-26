// Linha "RÓTULO .......... valor" usada nas telas de detalhe
export default function MetaRow({ label, value, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border-subtle)', ...style }}>
      <span style={{ font: '700 11px/14px var(--font-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ font: '500 15px/20px var(--font-sans)', color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
