import { useState } from 'react';
import Field from './Field';
import Icon from './Icon';
import { controlStyle } from './inputStyle';

export default function TextField({ label, hint, error, id, size = 'md', prefixIcon, suffix, disabled, readOnly, style, inputStyle, ...rest }) {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const fid = id || rest.name;
  const box = controlStyle({ size, focus, hover, error: !!error, disabled, readOnly });

  return (
    <Field label={label} htmlFor={fid} hint={hint} error={typeof error === 'string' ? error : undefined} style={style}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast)', ...box }}
      >
        {prefixIcon && <Icon name={prefixIcon} size={18} color="var(--text-muted)" />}
        <input
          id={fid}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            font: '400 14px/20px var(--font-sans)',
            padding: 0,
            ...inputStyle,
          }}
          {...rest}
        />
        {suffix}
      </div>
    </Field>
  );
}
