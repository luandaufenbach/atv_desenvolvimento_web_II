// Interruptor liga/desliga. onChange recebe o novo valor (true/false)
export default function Switch({ checked, onChange, label, disabled = false, style }) {
  const alternar = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.6 : 1, ...style }}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        aria-label={typeof label === 'string' ? label : undefined}
        onClick={alternar}
        disabled={disabled}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          padding: 0,
          borderRadius: 999,
          border: 'none',
          cursor: disabled ? 'default' : 'pointer',
          background: checked ? 'var(--primary)' : 'var(--ink-600)',
          transition: 'background var(--dur-base) var(--ease-standard)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 19 : 3,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: checked ? 'var(--gold-800)' : 'var(--ink-100)',
            transition: 'left var(--dur-base) var(--ease-emphasized)',
          }}
        />
      </button>
      {label && <span style={{ font: '500 14px/20px var(--font-sans)', color: 'var(--text-primary)' }}>{label}</span>}
    </span>
  );
}
