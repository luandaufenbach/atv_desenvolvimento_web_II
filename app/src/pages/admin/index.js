import Axios from 'axios';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';
import { formatarData, hoje, mapaPorId } from '@/services/formatos';

export default function Admin() {
  const [reservas, setReservas] = useState([]);
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [] });
  const [carregado, setCarregado] = useState(false);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  useEffect(() => {
    const getDados = async () => {
      try {
        const [response, dados] = await Promise.all([Axios.get(`${API}/reservas`), carregarListasReserva()]);
        setReservas(response.data);
        setListas(dados);
        setCarregado(true);
      } catch (error) {
        console.log('Erro ao buscar os dados:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os dados da API!'), status: 'error' });
      }
    };

    getDados();
  }, []);

  const confirmadas = reservas.filter((r) => r.status === 'CONFIRMADA');
  const reservasHoje = confirmadas.filter((r) => r.data === hoje());
  const proximas = confirmadas.filter((r) => r.data >= hoje());

  const espacos = mapaPorId(listas.espacos);
  const usuarios = mapaPorId(listas.usuarios);

  const valor = (n) => (carregado ? n : '-');

  const colunas = [
    { key: 'data', label: 'Data', render: (r) => formatarData(r.data) },
    { key: 'horario', label: 'Horário', mono: true, render: (r) => `${r.horaInicio} - ${r.horaFim}` },
    { key: 'espaco', label: 'Espaço', render: (r) => (espacos[r.espacoId] ? espacos[r.espacoId].nome : '-') },
    { key: 'usuario', label: 'Usuário', render: (r) => (usuarios[r.usuarioId] ? usuarios[r.usuarioId].nome : '-') },
  ];

  return (
    <AdminLayout titulo="Início" ativo="inicio">
      <Alert mensagem={mensagem} style={{ marginBottom: 24 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Reservas hoje" value={valor(reservasHoje.length)} />
        <StatCard label="Próximas reservas" value={valor(proximas.length)} />
        <StatCard label="Espaços ativos" value={valor(listas.espacos.filter((e) => e.ativo).length)} />
        <StatCard label="Empresas" value={valor(listas.empresas.length)} />
        <StatCard label="Usuários" value={valor(listas.usuarios.length)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, font: 'var(--type-card-title)', color: 'var(--text-primary)' }}>Próximas reservas</h2>
        <Button variant="ghost" size="sm" href="/admin/reservas">
          Ver todas
        </Button>
      </div>
      <DataTable columns={colunas} rows={proximas.slice(0, 8)} vazio="Nenhuma reserva agendada." />
    </AdminLayout>
  );
}
