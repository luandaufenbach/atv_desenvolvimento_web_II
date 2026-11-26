import Icon from '@/components/ui/Icon';

// Identificação do sistema: bloco de ícone + nome (mesmo arranjo do topo da barra lateral)
export default function Marca({ subtitulo = 'Painel administrativo' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          width: 40,
          height: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-icon)',
          color: 'var(--gold-100)',
          flexShrink: 0,
        }}
      >
        <Icon name="meeting_room" size={22} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ font: '700 16px/20px var(--font-sans)', color: 'var(--text-primary)' }}>Gestão de Espaços</div>
        {subtitulo && <div style={{ font: '400 13px/18px var(--font-sans)', color: 'var(--text-secondary)' }}>{subtitulo}</div>}
      </div>
    </div>
  );
}
