import Axios from 'axios';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import BarraBusca from '@/components/BarraBusca';
import RegistroAction from '@/components/RegistroAction';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import { API, mensagemDeErro } from '@/services/api';
import { formatarCnpj, formatarData, formatarTelefone } from '@/services/formatos';

export default function Empresas() {
  const API_URL = `${API}/empresas`;

  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState('');
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const getEmpresas = async (nome = '') => {
    try {
      // com nome usa a rota GET /empresas/nome/:nome, senão lista todas
      const url = nome ? `${API_URL}/nome/${encodeURIComponent(nome)}` : API_URL;
      const response = await Axios.get(url);
      setEmpresas(response.data);
      setMensagem({ message: '', status: '' });
    } catch (error) {
      console.log('Erro ao buscar as empresas:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar as empresas!'), status: 'error' });
    }
  };

  useEffect(() => {
    getEmpresas();
  }, []);

  const colunas = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ', mono: true, render: (e) => formatarCnpj(e.cnpj) },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone', render: (e) => formatarTelefone(e.telefone) },
    { key: 'dataCadastro', label: 'Cadastro', render: (e) => formatarData(e.dataCadastro) },
    { key: 'acoes', label: 'Ações', align: 'right', render: (e) => <RegistroAction base="/admin/empresas" pid={e._id} /> },
  ];

  return (
    <AdminLayout
      titulo="Empresas"
      ativo="empresas"
      acoes={
        <Button caps icon="add" href="/admin/empresas/create">
          Nova empresa
        </Button>
      }
    >
      <BarraBusca
        valor={busca}
        onChange={(e) => setBusca(e.target.value)}
        onBuscar={() => getEmpresas(busca.trim())}
        onLimpar={() => {
          setBusca('');
          getEmpresas();
        }}
      />
      <Alert mensagem={mensagem} style={{ marginBottom: 20 }} />
      <DataTable columns={colunas} rows={empresas} vazio="Nenhuma empresa encontrada." />
    </AdminLayout>
  );
}
