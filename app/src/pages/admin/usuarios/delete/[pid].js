import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import UsuarioCampos from '@/components/campos/UsuarioCampos';
import FormLayout from '@/components/FormLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { obterSessao } from '@/services/auth';

export default function DeleteUsuario() {
  const API_URL = `${API}/usuarios/`;

  const [usuario, setUsuario] = useState({ nome: '', email: '', telefone: '', dataCadastro: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregado, setCarregado] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [logadoId, setLogadoId] = useState(null);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const sessao = obterSessao();
    setLogadoId(sessao ? sessao._id : null);

    const getUsuario = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setUsuario(response.data);
        setCarregado(true);
      } catch (error) {
        console.log('Erro ao buscar o usuário:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar o usuário!'), status: 'error' });
      }
    };

    getUsuario();
  }, [router.isReady, pid]);

  const ehVoceMesmo = logadoId === pid;

  const handleDeleteUsuario = async () => {
    try {
      // o header informa à API quem está logado (ninguém pode excluir a si mesmo)
      await Axios.delete(API_URL + pid, { headers: { 'x-usuario-id': logadoId || '' } });
      setExcluido(true);
      setMensagem({ message: 'Usuário excluído com sucesso!', status: 'ok' });
    } catch (error) {
      console.log('Erro ao deletar o usuário:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao deletar o usuário!'), status: 'error' });
    }
  };

  let aviso = null;
  if (ehVoceMesmo) {
    aviso = <Alert mensagem={{ message: 'Este é o seu usuário. Você não pode excluir a si mesmo.', status: 'error' }} />;
  } else if (!excluido) {
    aviso = (
      <Alert
        mensagem={{
          message: 'Confira os dados. A exclusão não pode ser desfeita. Usuários com reservas (mesmo canceladas) não podem ser excluídos: cancele e exclua as reservas antes.',
          status: 'info',
        }}
      />
    );
  }

  return (
    <AdminLayout titulo="Excluir usuário" ativo="usuarios">
      <FormLayout
        titulo={usuario.nome || 'Usuário'}
        icone="person"
        voltar="/admin/usuarios"
        mensagem={mensagem}
        aviso={aviso}
        acoes={
          <Button variant="danger" caps icon="delete" onClick={handleDeleteUsuario} disabled={!carregado || excluido || ehVoceMesmo}>
            Deletar
          </Button>
        }
      >
        <UsuarioCampos usuario={usuario} modo="read" />
      </FormLayout>
    </AdminLayout>
  );
}
