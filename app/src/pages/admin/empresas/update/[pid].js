import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EmpresaCampos from '@/components/campos/EmpresaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function UpdateEmpresa() {
  const API_URL = `${API}/empresas/`;

  const [empresa, setEmpresa] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEmpresa({
      ...empresa,
      [name]: value,
    });
  };

  const handleUpdateEmpresa = async () => {
    try {
      const { nome, cnpj, email, telefone, endereco } = empresa;
      const response = await Axios.put(API_URL + pid, { nome, cnpj, email, telefone, endereco });
      setEmpresa(response.data);
      setMensagem({ message: 'Empresa alterada com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao alterar a empresa:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao alterar a empresa!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Editar empresa" ativo="empresas">
      <FormLayout
        voltar="/admin/empresas"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleUpdateEmpresa} disabled={!carregada}>
            Salvar
          </Button>
        }
      >
        <EmpresaCampos empresa={empresa} onChange={handleChange} />
      </FormLayout>
    </AdminLayout>
  );
}
