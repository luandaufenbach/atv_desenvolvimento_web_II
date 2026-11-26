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
import { obterSessao } from '@/services/auth';
import { formatarData, formatarTelefone } from '@/services/formatos';

export default function Usuarios() {
  const API_URL = `${API}/usuarios`;

  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [logadoId, setLogadoId] = useState(null);

  const getUsuarios = async (nome = '') => {
    try {
      // com nome usa a rota GET /usuarios/nome/:nome, senão lista todos
      const url = nome ? `${API_URL}/nome/${encodeURIComponent(nome)}` : API_URL;
      const response = await Axios.get(url);
      setUsuarios(response.data);
      setMensagem({ message: '', status: '' });
    } catch (error) {
      console.log('Erro ao buscar os usuários:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os usuários!'), status: 'error' });
    }
  };

  useEffect(() => {
    const sessao = obterSessao();
    setLogadoId(sessao ? sessao._id : null);
    getUsuarios();
  }, []);

  const colunas = [
    {
      key: 'nome',
      label: 'Nome',
      render: (u) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          {u.nome}
          {u._id === logadoId && <Badge tone="premium">Você</Badge>}
        </span>
      ),
    },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone', render: (u) => formatarTelefone(u.telefone) },
    { key: 'dataCadastro', label: 'Cadastro', render: (u) => formatarData(u.dataCadastro) },
    { key: 'acoes', label: 'Ações', align: 'right', render: (u) => <RegistroAction base="/admin/usuarios" pid={u._id} /> },
  ];

  return (
    <AdminLayout
      titulo="Usuários"
      ativo="usuarios"
      acoes={
        <Button caps icon="person_add" href="/admin/usuarios/create">
          Novo usuário
        </Button>
      }
    >
      <BarraBusca
        valor={busca}
        onChange={(e) => setBusca(e.target.value)}
        onBuscar={() => getUsuarios(busca.trim())}
        onLimpar={() => {
          setBusca('');
          getUsuarios();
        }}
      />
      <Alert mensagem={mensagem} style={{ marginBottom: 20 }} />
      <DataTable columns={colunas} rows={usuarios} vazio="Nenhum usuário encontrado." />
    </AdminLayout>
  );
}
