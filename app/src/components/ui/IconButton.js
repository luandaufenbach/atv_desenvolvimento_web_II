import { useState } from 'react';
import Icon from './Icon';

export default function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled = false, onClick, style, ...rest }) {
  const [hover, setHover] = useState(false);
  const dim = size === 'sm' ? 28 : size === 'lg' ? 40 : 32;
  const glyph = size === 'sm' ? 16 : size === 'lg' ? 22 : 20;
  const base =
    variant === 'outlined'
      ? { background: hover ? 'var(--surface-hover)' : 'var(--surface-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }
      : { background: hover ? 'var(--surface-hover)' : 'transparent', border: '1px solid transparent', color: hover ? 'var(--text-primary)' : 'var(--text-secondary)' };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: dim,
        height: dim,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast)',
        ...base,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={glyph} />
    </button>
  );
}
