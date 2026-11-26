import Link from 'next/link';
import { useState } from 'react';

import Icon from '@/components/ui/Icon';
import Marca from '@/components/Marca';

// Menu da página Admin, que leva para as páginas de cadastro
export const ITENS_MENU = [
  { id: 'inicio', label: 'Início', icon: 'space_dashboard', href: '/admin' },
  { id: 'empresas', label: 'Empresas', icon: 'apartment', href: '/admin/empresas' },
  { id: 'espacos', label: 'Espaços', icon: 'meeting_room', href: '/admin/espacos' },
  { id: 'disponibilidades', label: 'Disponibilidades', icon: 'event_available', href: '/admin/disponibilidades' },
  { id: 'reservas', label: 'Reservas', icon: 'calendar_month', href: '/admin/reservas' },
  { id: 'usuarios', label: 'Usuários', icon: 'group', href: '/admin/usuarios' },
];

function ItemMenu({ item, ativo, onClick }) {
  const [hover, setHover] = useState(false);

  const estilo = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    height: 40,
    padding: '0 14px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    background: ativo || hover ? 'var(--surface-active)' : 'transparent',
    boxShadow: ativo ? 'inset 3px 0 0 var(--primary)' : 'none',
    color: ativo ? 'var(--text-primary)' : 'var(--text-secondary)',
    font: (ativo ? '600' : '500') + ' 14px/1 var(--font-sans)',
    transition: 'background var(--dur-fast) var(--ease-standard)',
  };

  const conteudo = (
    <>
      <Icon name={item.icon} size={20} />
      <span style={{ flex: 1 }}>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} aria-current={ativo ? 'page' : undefined} style={estilo} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {conteudo}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} style={estilo} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {conteudo}
    </button>
  );
}

export default function NavAdmin({ ativo, usuario, onSair }) {
  return (
    <nav
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-sidebar)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      <div style={{ padding: '22px 20px 26px' }}>
        <Marca />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
        {ITENS_MENU.map((item) => (
          <ItemMenu key={item.id} item={item} ativo={item.id === ativo} />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 8px 16px', borderTop: '1px solid var(--border-default)' }}>
        {usuario && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 10px', minWidth: 0 }}>
            <Icon name="account_circle" size={22} color="var(--text-secondary)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '600 13px/18px var(--font-sans)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {usuario.nome}
              </div>
              <div style={{ font: '400 12px/16px var(--font-sans)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {usuario.email}
              </div>
            </div>
          </div>
        )}
        <ItemMenu item={{ id: 'sair', label: 'Sair', icon: 'logout' }} onClick={onSair} />
      </div>
    </nav>
  );
}
