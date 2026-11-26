import { useState } from 'react';
import Field from './Field';
import Icon from './Icon';
import { controlStyle } from './inputStyle';

/**
 * options: [{ value, label }]. Com readOnly o select fica bloqueado, com aparência de leitura.
 */
export default function Select({ label, hint, error, id, options = [], placeholder, size = 'md', disabled, readOnly, style, ...rest }) {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const fid = id || rest.name;
  const box = controlStyle({ size, focus, hover, error: !!error, disabled, readOnly });

  return (
    <Field label={label} htmlFor={fid} hint={hint} error={typeof error === 'string' ? error : undefined} style={style}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: 'relative', display: 'flex', alignItems: 'center', ...box }}>
        <select
          id={fid}
          disabled={disabled || readOnly}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            opacity: 1,
            font: '400 14px/20px var(--font-sans)',
            padding: '0 36px 0 12px',
            cursor: disabled || readOnly ? 'default' : 'pointer',
          }}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: 'var(--ink-800)' }}>
              {o.label}
            </option>
          ))}
        </select>
        {!readOnly && <Icon name="expand_more" size={20} color="var(--text-secondary)" style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} />}
      </div>
    </Field>
  );
}
