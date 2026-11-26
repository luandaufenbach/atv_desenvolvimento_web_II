import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import UsuarioCampos from '@/components/campos/UsuarioCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { obterSessao, salvarSessao } from '@/services/auth';

export default function UpdateUsuario() {
  const API_URL = `${API}/usuarios/`;

  const [usuario, setUsuario] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregado, setCarregado] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getUsuario = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setUsuario({ ...response.data, senha: '' });
        setCarregado(true);
      } catch (error) {
        console.log('Erro ao buscar o usuário:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar o usuário!'), status: 'error' });
      }
    };

    getUsuario();
  }, [router.isReady, pid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUsuario({
      ...usuario,
      [name]: value,
    });
  };

  const handleUpdateUsuario = async () => {
    try {
      const { nome, email, telefone, senha } = usuario;
      // senha vazia não é enviada: a API mantém a atual
      const dados = senha ? { nome, email, telefone, senha } : { nome, email, telefone };
      const response = await Axios.put(API_URL + pid, dados);
      setUsuario({ ...response.data, senha: '' });

      // se alterou o próprio usuário, atualiza o nome/e-mail da sessão
      const sessao = obterSessao();
      if (sessao && sessao._id === response.data._id) salvarSessao(response.data);

      setMensagem({ message: 'Usuário alterado com sucesso!', status: 'ok' });
    } catch (error) {
      console.log('Erro ao alterar o usuário:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao alterar o usuário!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Editar usuário" ativo="usuarios">
      <FormLayout
        titulo="Dados do usuário"
        icone="person"
        voltar="/admin/usuarios"
        mensagem={mensagem}
        acoes={
          <Button caps icon="save" onClick={handleUpdateUsuario} disabled={!carregado}>
            Salvar
          </Button>
        }
      >
        <UsuarioCampos usuario={usuario} onChange={handleChange} modo="update" />
      </FormLayout>
    </AdminLayout>
  );
}
