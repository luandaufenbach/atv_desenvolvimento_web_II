import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import { BadgeStatus } from '@/components/campos/ReservaCampos';
import RegistroAction from '@/components/RegistroAction';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import TextField from '@/components/ui/TextField';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';
import { formatarData, mapaPorId } from '@/services/formatos';

const FILTRO_VAZIO = { data: '', espaco: '', usuario: '', status: '' };

export default function Reservas() {
  const API_URL = `${API}/reservas`;
  const router = useRouter();

  const [reservas, setReservas] = useState([]);
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [] });
  const [filtro, setFiltro] = useState(FILTRO_VAZIO);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const getReservas = async ({ data, espaco, usuario, status }) => {
    try {
      // usa as rotas GET /reservas/data/:data, /reservas/espaco/:id e /reservas/usuario/:id
      let url = API_URL;
      if (data) url = `${API_URL}/data/${data}`;
      else if (espaco) url = `${API_URL}/espaco/${espaco}`;
      else if (usuario) url = `${API_URL}/usuario/${usuario}`;

      const response = await Axios.get(url);

      // os demais filtros combinados são aplicados aqui com array.filter
      const lista = response.data
        .filter((r) => !espaco || r.espacoId === espaco)
        .filter((r) => !usuario || r.usuarioId === usuario)
        .filter((r) => !status || r.status === status);

      setReservas(lista);
      setMensagem({ message: '', status: '' });
    } catch (error) {
      console.log('Erro ao buscar as reservas:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar as reservas!'), status: 'error' });
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const carregar = async () => {
      try {
        setListas(await carregarListasReserva());
      } catch (error) {
        console.log('Erro ao buscar os cadastros:', error);
      }
    };

    // permite abrir já filtrado: /admin/reservas?usuario=<id>
    const inicial = { ...FILTRO_VAZIO, usuario: router.query.usuario || '' };
    setFiltro(inicial);
    carregar();
    getReservas(inicial);
  }, [router.isReady]);

  const handleFiltro = (event) => {
    const { name, value } = event.target;
    const novo = { ...filtro, [name]: value };
    setFiltro(novo);
    getReservas(novo);
  };

  const limparFiltros = () => {
    setFiltro(FILTRO_VAZIO);
    getReservas(FILTRO_VAZIO);
  };

  const espacos = mapaPorId(listas.espacos);
  const usuarios = mapaPorId(listas.usuarios);
  const empresas = mapaPorId(listas.empresas);

  const colunas = [
    { key: 'data', label: 'Data', render: (r) => formatarData(r.data) },
    { key: 'horario', label: 'Horário', mono: true, render: (r) => `${r.horaInicio} - ${r.horaFim}` },
    { key: 'espaco', label: 'Espaço', render: (r) => (espacos[r.espacoId] ? espacos[r.espacoId].nome : '-') },
    { key: 'usuario', label: 'Usuário', render: (r) => (usuarios[r.usuarioId] ? usuarios[r.usuarioId].nome : '-') },
    {
      key: 'empresa',
      label: 'Empresa',
      render: (r) => (r.empresaId ? (empresas[r.empresaId] ? empresas[r.empresaId].nome : '-') : <span style={{ color: 'var(--text-muted)' }}>Externa</span>),
    },
    { key: 'status', label: 'Situação', render: (r) => <BadgeStatus status={r.status} /> },
    { key: 'acoes', label: 'Ações', align: 'right', render: (r) => <RegistroAction base="/admin/reservas" pid={r._id} /> },
  ];

  return (
    <AdminLayout
      titulo="Reservas"
      ativo="reservas"
      acoes={
        <Button caps icon="add" href="/admin/reservas/create">
          Nova reserva
        </Button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <TextField label="Data" type="date" name="data" size="sm" value={filtro.data} onChange={handleFiltro} style={{ width: 170 }} />
        <Select
          label="Espaço"
          name="espaco"
          size="sm"
          placeholder="Todos"
          options={listas.espacos.map((e) => ({ value: e._id, label: e.nome }))}
          value={filtro.espaco}
          onChange={handleFiltro}
          style={{ width: 220 }}
        />
        <Select
          label="Usuário"
          name="usuario"
          size="sm"
          placeholder="Todos"
          options={listas.usuarios.map((u) => ({ value: u._id, label: u.nome }))}
          value={filtro.usuario}
          onChange={handleFiltro}
          style={{ width: 200 }}
        />
        <Select
          label="Situação"
          name="status"
          size="sm"
          placeholder="Todas"
          options={[
            { value: 'CONFIRMADA', label: 'Confirmadas' },
            { value: 'CANCELADA', label: 'Canceladas' },
          ]}
          value={filtro.status}
          onChange={handleFiltro}
          style={{ width: 160 }}
        />
        <Button variant="ghost" style={{ height: 32 }} onClick={limparFiltros}>
          Limpar filtros
        </Button>
      </div>
      <Alert mensagem={mensagem} style={{ marginBottom: 20 }} />
      <DataTable columns={colunas} rows={reservas} isDimmed={(r) => r.status === 'CANCELADA'} vazio="Nenhuma reserva encontrada." />
    </AdminLayout>
  );
}
