import Axios from 'axios';
import { useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import UsuarioCampos from '@/components/campos/UsuarioCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

const VAZIO = { nome: '', email: '', telefone: '', senha: '' };

export default function CreateUsuario() {
  const API_URL = `${API}/usuarios`;

  const [usuario, setUsuario] = useState(VAZIO);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUsuario({
      ...usuario,
      [name]: value,
    });
  };

  const handleCreateUsuario = async () => {
    try {
      const response = await Axios.post(API_URL, usuario);
      setMensagem({ message: `Usuário "${response.data.nome}" cadastrado com sucesso.`, status: 'ok' });
      setUsuario(VAZIO);
    } catch (error) {
      console.log('Erro ao criar o usuário:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao criar o usuário!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Novo usuário" ativo="usuarios">
      <FormLayout
        voltar="/admin/usuarios"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleCreateUsuario}>
            Salvar
          </Button>
        }
      >
        <UsuarioCampos usuario={usuario} onChange={handleChange} modo="create" />
      </FormLayout>
    </AdminLayout>
  );
}
