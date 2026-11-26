import { useState } from 'react';

/**
 * Tabela do design system.
 * columns: [{ key, label, width, align, mono, render(row) }]
 */
export default function DataTable({ columns = [], rows = [], rowKey = '_id', isDimmed, vazio = 'Nenhum registro encontrado.', style }) {
  const [hoverRow, setHoverRow] = useState(null);
  const th = {
    font: '700 11px/14px var(--font-sans)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    padding: '14px 18px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={{ ...th, textAlign: c.align || 'left', width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr style={{ borderTop: '1px solid var(--border-default)' }}>
              <td colSpan={columns.length} style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {vazio}
              </td>
            </tr>
          )}
          {rows.map((r, i) => {
            const k = r[rowKey] != null ? r[rowKey] : i;
            const dim = isDimmed && isDimmed(r);
            return (
              <tr
                key={k}
                onMouseEnter={() => setHoverRow(k)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  borderTop: '1px solid var(--border-default)',
                  background: hoverRow === k ? 'var(--surface-hover)' : 'transparent',
                  opacity: dim ? 0.55 : 1,
                  transition: 'background var(--dur-fast)',
                }}
              >
                {columns.map((c, ci) => (
                  <td
                    key={c.key}
                    style={{
                      padding: '0 18px',
                      height: 60,
                      textAlign: c.align || 'left',
                      color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                      font: c.mono ? '600 12px/16px var(--font-mono)' : (ci === 0 ? '600' : '400') + ' 14px/20px var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
