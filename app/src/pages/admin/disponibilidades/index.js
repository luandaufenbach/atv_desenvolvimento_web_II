import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import RegistroAction from '@/components/RegistroAction';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import { API, mensagemDeErro } from '@/services/api';
import { DIAS_SEMANA, mapaPorId } from '@/services/formatos';

export default function Disponibilidades() {
  const API_URL = `${API}/disponibilidades`;
  const router = useRouter();

  const [disponibilidades, setDisponibilidades] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [filtro, setFiltro] = useState({ espaco: '', dia: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const getDisponibilidades = async ({ espaco, dia }) => {
    try {
      // usa as rotas GET /disponibilidades/espaco/:id e /disponibilidades/dia/:dia
      let url = API_URL;
      if (espaco) url = `${API_URL}/espaco/${espaco}`;
      else if (dia !== '') url = `${API_URL}/dia/${dia}`;

      const response = await Axios.get(url);
      // com os dois filtros, a API filtra o espaço e aqui filtramos o dia
      const lista = espaco && dia !== '' ? response.data.filter((d) => d.diaSemana === Number(dia)) : response.data;
      setDisponibilidades(lista);
      setMensagem({ message: '', status: '' });
    } catch (error) {
      console.log('Erro ao buscar as disponibilidades:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar as disponibilidades!'), status: 'error' });
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const getEspacos = async () => {
      try {
        const response = await Axios.get(`${API}/espacos`);
        setEspacos(response.data);
      } catch (error) {
        console.log('Erro ao buscar os espaços:', error);
      }
    };

    // permite abrir já filtrado: /admin/disponibilidades?espaco=<id>
    const inicial = { espaco: router.query.espaco || '', dia: '' };
    setFiltro(inicial);
    getEspacos();
    getDisponibilidades(inicial);
  }, [router.isReady]);

  const handleFiltro = (event) => {
    const { name, value } = event.target;
    const novo = { ...filtro, [name]: value };
    setFiltro(novo);
    getDisponibilidades(novo);
  };

  const espacosPorId = mapaPorId(espacos);

  const colunas = [
    { key: 'espaco', label: 'Espaço', render: (d) => (espacosPorId[d.espacoId] ? espacosPorId[d.espacoId].nome : '-') },
    { key: 'diaSemana', label: 'Dia', render: (d) => DIAS_SEMANA[d.diaSemana] },
    { key: 'horario', label: 'Horário', mono: true, render: (d) => `${d.horaInicio} - ${d.horaFim}` },
    {
      key: 'permiteExterno',
      label: 'Reservas externas',
      render: (d) => (d.permiteExterno ? <Badge tone="success">Permite</Badge> : <Badge tone="premium">Só empresas</Badge>),
    },
    { key: 'acoes', label: 'Ações', align: 'right', render: (d) => <RegistroAction base="/admin/disponibilidades" pid={d._id} /> },
  ];

  return (
    <AdminLayout
      titulo="Disponibilidades"
      ativo="disponibilidades"
      acoes={
        <Button caps icon="add" href="/admin/disponibilidades/create">
          Nova disponibilidade
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Select
          label="Espaço"
          name="espaco"
          size="sm"
          placeholder="Todos os espaços"
          options={espacos.map((e) => ({ value: e._id, label: e.nome }))}
          value={filtro.espaco}
          onChange={handleFiltro}
          style={{ width: 280 }}
        />
        <Select
          label="Dia da semana"
          name="dia"
          size="sm"
          placeholder="Todos os dias"
          options={DIAS_SEMANA.map((nome, i) => ({ value: String(i), label: nome }))}
          value={filtro.dia}
          onChange={handleFiltro}
          style={{ width: 200 }}
        />
      </div>
      <Alert mensagem={mensagem} style={{ marginBottom: 20 }} />
      <DataTable columns={colunas} rows={disponibilidades} vazio="Nenhuma disponibilidade encontrada." />
    </AdminLayout>
  );
}
