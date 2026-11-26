import { useState } from 'react';
import Field from './Field';

export default function Textarea({ label, hint, error, id, rows = 4, disabled, readOnly, style, ...rest }) {
  const [focus, setFocus] = useState(false);
  const fid = id || rest.name;

  let borderColor = 'var(--border-default)';
  if (error) borderColor = 'var(--status-error)';
  else if (focus && !readOnly) borderColor = 'var(--gold-400)';

  return (
    <Field label={label} htmlFor={fid} hint={hint} error={typeof error === 'string' ? error : undefined} style={style}>
      <textarea
        id={fid}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          resize: 'vertical',
          background: readOnly ? 'var(--surface-raised)' : 'var(--surface-sunken)',
          border: '1px solid ' + borderColor,
          boxShadow: focus && !error && !readOnly ? '0 0 0 3px rgba(220,188,154,.12)' : 'none',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          color: 'var(--text-primary)',
          font: '400 14px/22px var(--font-sans)',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color var(--dur-fast) var(--ease-standard)',
        }}
        {...rest}
      />
    </Field>
  );
}
