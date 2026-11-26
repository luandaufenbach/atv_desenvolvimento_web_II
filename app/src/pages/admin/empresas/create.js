import Axios from 'axios';
import { useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EmpresaCampos from '@/components/campos/EmpresaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

const VAZIA = { nome: '', cnpj: '', email: '', telefone: '', endereco: '' };

export default function CreateEmpresa() {
  const API_URL = `${API}/empresas`;

  const [empresa, setEmpresa] = useState(VAZIA);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEmpresa({
      ...empresa,
      [name]: value,
    });
  };

  const handleCreateEmpresa = async () => {
    try {
      const response = await Axios.post(API_URL, empresa);
      setMensagem({ message: `Empresa "${response.data.nome}" cadastrada com sucesso.`, status: 'ok' });
      setEmpresa(VAZIA);
    } catch (error) {
      console.log('Erro ao criar a empresa:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao criar a empresa!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Nova empresa" ativo="empresas">
      <FormLayout
        voltar="/admin/empresas"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleCreateEmpresa}>
            Salvar
          </Button>
        }
      >
        <EmpresaCampos empresa={empresa} onChange={handleChange} />
      </FormLayout>
    </AdminLayout>
  );
}
