import Axios from 'axios';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import BarraBusca from '@/components/BarraBusca';
import RegistroAction from '@/components/RegistroAction';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import { API, mensagemDeErro } from '@/services/api';
import { nomeTipoEspaco, pessoas } from '@/services/formatos';

export default function Espacos() {
  const API_URL = `${API}/espacos`;

  const [espacos, setEspacos] = useState([]);
  const [busca, setBusca] = useState('');
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const getEspacos = async (nome = '') => {
    try {
      // com nome usa a rota GET /espacos/nome/:nome, senão lista todos
      const url = nome ? `${API_URL}/nome/${encodeURIComponent(nome)}` : API_URL;
      const response = await Axios.get(url);
      setEspacos(response.data);
      setMensagem({ message: '', status: '' });
    } catch (error) {
      console.log('Erro ao buscar os espaços:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os espaços!'), status: 'error' });
    }
  };

  useEffect(() => {
    getEspacos();
  }, []);

  const colunas = [
    { key: 'nome', label: 'Nome' },
    { key: 'tipo', label: 'Tipo', render: (e) => nomeTipoEspaco(e.tipo) },
    { key: 'capacidade', label: 'Capacidade', render: (e) => pessoas(e.capacidade) },
    {
      key: 'ativo',
      label: 'Situação',
      render: (e) => (e.ativo ? <Badge tone="success">Ativo</Badge> : <Badge tone="neutral">Inativo</Badge>),
    },
    { key: 'acoes', label: 'Ações', align: 'right', render: (e) => <RegistroAction base="/admin/espacos" pid={e._id} /> },
  ];

  return (
    <AdminLayout
      titulo="Espaços"
      ativo="espacos"
      acoes={
        <Button caps icon="add" href="/admin/espacos/create">
          Novo espaço
        </Button>
      }
    >
      <BarraBusca
        valor={busca}
        onChange={(e) => setBusca(e.target.value)}
        onBuscar={() => getEspacos(busca.trim())}
        onLimpar={() => {
          setBusca('');
          getEspacos();
        }}
      />
      <Alert mensagem={mensagem} style={{ marginBottom: 20 }} />
      <DataTable columns={colunas} rows={espacos} isDimmed={(e) => !e.ativo} vazio="Nenhum espaço encontrado." />
    </AdminLayout>
  );
}
