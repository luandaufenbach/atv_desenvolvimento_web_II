import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';

const SIZES = {
  sm: { height: 28, padding: '0 12px', font: 12, icon: 16, gap: 6, radius: 'var(--radius-sm)' },
  md: { height: 36, padding: '0 16px', font: 13, icon: 18, gap: 8, radius: 'var(--radius-md)' },
  lg: { height: 44, padding: '0 22px', font: 14, icon: 20, gap: 10, radius: 'var(--radius-md)' },
};

// Cores de cada variante (primary, secondary, subtle, accent, danger, ghost)
function palette(variant, hover, press) {
  switch (variant) {
    case 'secondary':
      return { background: hover ? 'rgba(220,188,154,.08)' : 'transparent', color: 'var(--gold-100)', border: '1px solid var(--gold-300)' };
    case 'subtle':
      return { background: hover ? 'var(--surface-hover)' : 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' };
    case 'accent':
      return { background: press ? 'var(--accent-pressed)' : hover ? 'var(--accent-hover)' : 'var(--accent)', color: 'var(--text-on-accent)', border: '1px solid transparent' };
    case 'danger':
      return { background: hover ? 'var(--red-950)' : 'transparent', color: 'var(--status-error)', border: '1px solid var(--status-error-border)' };
    case 'ghost':
      return { background: hover ? 'var(--surface-hover)' : 'transparent', color: hover ? 'var(--text-primary)' : 'var(--text-secondary)', border: '1px solid transparent' };
    default:
      return { background: press ? 'var(--primary-pressed)' : hover ? 'var(--primary-hover)' : 'var(--primary)', color: 'var(--text-on-primary)', border: '1px solid transparent' };
  }
}

/**
 * Botão do design system. Com "href" vira um Link do Next com a mesma aparência.
 */
export default function Button({ variant = 'primary', size = 'md', icon, iconRight, caps = false, fullWidth = false, disabled = false, type = 'button', href, onClick, style, children, ...rest }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const p = palette(variant, hover && !disabled, press && !disabled);

  const estilo = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    borderRadius: s.radius,
    fontFamily: 'var(--font-sans)',
    fontSize: s.font,
    fontWeight: 500,
    letterSpacing: caps ? '0.02em' : 'normal',
    textTransform: caps ? 'uppercase' : 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    outline: 'none',
    transform: press && !disabled ? 'scale(0.98)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
    ...p,
    ...style,
  };

  const eventos = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
  };

  const conteudo = (
    <>
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} style={estilo} {...eventos} {...rest}>
        {conteudo}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} style={estilo} {...eventos} {...rest}>
      {conteudo}
    </button>
  );
}
