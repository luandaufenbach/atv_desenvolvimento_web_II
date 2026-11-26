import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import NavAdmin from '@/components/NavAdmin';
import { encerrarSessao, obterSessao } from '@/services/auth';

/**
 * Estrutura das páginas do Admin: barra lateral + topo com título + conteúdo.
 * Também protege as páginas: sem login, volta para /login.
 */
export default function AdminLayout({ titulo, ativo, acoes, children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      router.replace('/login');
      return;
    }
    setUsuario(sessao);
  }, [router]);

  const handleSair = () => {
    encerrarSessao();
    router.push('/login');
  };

  // Enquanto confere a sessão não mostra nada (evita "piscar" a página protegida)
  if (!usuario) return null;

  return (
    <>
      <Head>
        <title>{`${titulo} | Gestão de Espaços`}</title>
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <NavAdmin ativo={ativo} usuario={usuario} onSair={handleSair} />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              height: 'var(--topbar-height)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '0 40px',
              background: 'var(--surface-base)',
              borderBottom: '1px solid var(--border-default)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <h1 style={{ margin: 0, font: '500 26px/32px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {titulo}
            </h1>
            <div style={{ flex: 1 }} />
            {acoes && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{acoes}</div>}
          </header>

          <div style={{ flex: 1, padding: '32px 40px 48px', background: 'var(--bg-canvas)' }}>{children}</div>
        </main>
      </div>
    </>
  );
}
