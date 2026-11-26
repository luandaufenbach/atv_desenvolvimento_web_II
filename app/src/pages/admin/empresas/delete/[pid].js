import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EmpresaCampos from '@/components/campos/EmpresaCampos';
import FormLayout from '@/components/FormLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function DeleteEmpresa() {
  const API_URL = `${API}/empresas/`;

  const [empresa, setEmpresa] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '', dataCadastro: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);
  const [excluida, setExcluida] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getEmpresa = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setEmpresa(response.data);
        setCarregada(true);
      } catch (error) {
        console.log('Erro ao buscar a empresa:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a empresa!'), status: 'error' });
      }
    };

    getEmpresa();
  }, [router.isReady, pid]);

  const handleDeleteEmpresa = async () => {
    try {
      await Axios.delete(API_URL + pid);
      setExcluida(true);
      setMensagem({ message: 'Empresa excluída com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao deletar a empresa:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao deletar a empresa!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Excluir empresa" ativo="empresas">
      <FormLayout
        titulo={empresa.nome || 'Empresa'}
        voltar="/admin/empresas"
        mensagem={mensagem}
        aviso={
          !excluida && (
            <Alert mensagem={{ message: 'Esta ação não pode ser desfeita.', status: 'info' }} />
          )
        }
        acoes={
          <Button variant="danger" caps onClick={handleDeleteEmpresa} disabled={!carregada || excluida}>
            Deletar
          </Button>
        }
      >
        <EmpresaCampos empresa={empresa} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
