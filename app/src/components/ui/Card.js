import Icon from './Icon';

export default function Card({ title, icon, action, children, padding = 20, style, bodyStyle }) {
  const temCabecalho = title || icon || action;
  return (
    <section
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
      }}
    >
      {temCabecalho && (
        <>
          <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${padding}px ${padding}px 0` }}>
            {icon && <Icon name={icon} size={20} color="var(--text-secondary)" />}
            <h3 style={{ margin: 0, flex: 1, font: '500 16px/22px var(--font-sans)', color: 'var(--text-primary)' }}>{title}</h3>
            {action}
          </header>
          <div style={{ height: 1, background: 'var(--border-default)', margin: `14px ${padding}px 0` }} />
        </>
      )}
      <div style={{ padding, display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, ...bodyStyle }}>{children}</div>
    </section>
  );
}
