// Estilo da "caixa" dos campos (input, select) conforme o estado
export function controlStyle({ size = 'md', focus, hover, error, disabled, readOnly }) {
  const h = size === 'sm' ? 32 : size === 'lg' ? 44 : 40;

  let borderColor = 'var(--border-default)';
  if (error) borderColor = 'var(--status-error)';
  else if (focus && !readOnly) borderColor = 'var(--gold-400)';
  else if (hover && !readOnly) borderColor = 'var(--border-strong)';

  return {
    height: h,
    background: readOnly ? 'var(--surface-raised)' : 'var(--surface-sunken)',
    border: '1px solid ' + borderColor,
    borderRadius: 'var(--radius-md)',
    boxShadow: focus && !error && !readOnly ? '0 0 0 3px rgba(220,188,154,.12)' : 'none',
    opacity: disabled ? 0.5 : 1,
  };
}
