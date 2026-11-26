import Axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import { ITENS_MENU } from '@/components/NavAdmin';
import Alert from '@/components/ui/Alert';
import Icon from '@/components/ui/Icon';
import { API, mensagemDeErro } from '@/services/api';
import { hoje } from '@/services/formatos';

const DESCRICOES = {
  empresas: 'Empresas que podem fazer reservas internas.',
  espacos: 'Salas, laboratórios e coworkings disponíveis.',
  disponibilidades: 'Dias e horários em que cada espaço abre.',
  reservas: 'Agendamentos dos espaços pelos usuários.',
  usuarios: 'Pessoas com acesso ao sistema.',
};

function CartaoCadastro({ item, total }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 20,
        textDecoration: 'none',
        background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
        border: '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-default)'),
        borderRadius: 'var(--radius-xl)',
        transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--surface-icon)',
            color: 'var(--gold-100)',
          }}
        >
          <Icon name={item.icon} size={22} />
        </span>
        <span style={{ font: '600 28px/34px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{total ?? '–'}</span>
      </div>
      <div>
        <div style={{ font: '500 16px/22px var(--font-sans)', color: 'var(--text-primary)' }}>{item.label}</div>
        <div style={{ font: '400 13px/18px var(--font-sans)', color: 'var(--text-muted)', marginTop: 2 }}>{DESCRICOES[item.id]}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '700 11px/14px var(--font-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-gold)' }}>
        Abrir cadastro <Icon name="arrow_forward" size={16} />
      </div>
    </Link>
  );
}

export default function Admin() {
  const [totais, setTotais] = useState({});
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  useEffect(() => {
    const getTotais = async () => {
      try {
        const nomes = ['empresas', 'espacos', 'disponibilidades', 'reservas', 'usuarios'];
        const respostas = await Promise.all(nomes.map((n) => Axios.get(`${API}/${n}`)));
        const novo = {};
        nomes.forEach((n, i) => {
          novo[n] = respostas[i].data.length;
        });
        // reservas confirmadas de hoje em diante
        novo.proximas = respostas[3].data.filter((r) => r.status === 'CONFIRMADA' && r.data >= hoje()).length;
        setTotais(novo);
      } catch (error) {
        console.log('Erro ao buscar os totais:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os dados da API!'), status: 'error' });
      }
    };

    getTotais();
  }, []);

  return (
    <AdminLayout titulo="Início" ativo="inicio">
      <p style={{ margin: '0 0 24px', font: '400 14px/20px var(--font-sans)', color: 'var(--text-muted)' }}>
        Escolha um cadastro para listar, criar, visualizar, editar ou apagar registros.
        {totais.proximas !== undefined && (
          <>
            {' '}Há <strong style={{ color: 'var(--text-gold)' }}>{totais.proximas}</strong> reserva(s) confirmada(s) a partir de hoje.
          </>
        )}
      </p>

      <Alert mensagem={mensagem} style={{ marginBottom: 24 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        {ITENS_MENU.filter((item) => item.id !== 'inicio').map((item) => (
          <CartaoCadastro key={item.id} item={item} total={totais[item.id]} />
        ))}
      </div>
    </AdminLayout>
  );
}
