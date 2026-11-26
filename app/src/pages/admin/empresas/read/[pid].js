import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EmpresaCampos from '@/components/campos/EmpresaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function ReadEmpresa() {
  const API_URL = `${API}/empresas/`;

  const [empresa, setEmpresa] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '', dataCadastro: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getEmpresa = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setEmpresa(response.data);
      } catch (error) {
        console.log('Erro ao buscar a empresa:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a empresa!'), status: 'error' });
      }
    };

    getEmpresa();
  }, [router.isReady, pid]);

  return (
    <AdminLayout titulo="Detalhes da empresa" ativo="empresas">
      <FormLayout
        titulo={empresa.nome || 'Empresa'}
        icone="apartment"
        voltar="/admin/empresas"
        mensagem={mensagem}
        acoes={
          <Button variant="secondary" icon="edit" href={`/admin/empresas/update/${pid}`}>
            Editar
          </Button>
        }
      >
        <EmpresaCampos empresa={empresa} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
