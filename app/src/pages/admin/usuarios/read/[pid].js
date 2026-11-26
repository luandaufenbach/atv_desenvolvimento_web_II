import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import UsuarioCampos from '@/components/campos/UsuarioCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function ReadUsuario() {
  const API_URL = `${API}/usuarios/`;

  const [usuario, setUsuario] = useState({ nome: '', email: '', telefone: '', dataCadastro: '' });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getUsuario = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setUsuario(response.data);
      } catch (error) {
        console.log('Erro ao buscar o usuário:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar o usuário!'), status: 'error' });
      }
    };

    getUsuario();
  }, [router.isReady, pid]);

  return (
    <AdminLayout titulo="Detalhes do usuário" ativo="usuarios">
      <FormLayout
        titulo={usuario.nome || 'Usuário'}
        icone="person"
        voltar="/admin/usuarios"
        mensagem={mensagem}
        acoes={
          <>
            <Button variant="secondary" icon="edit" href={`/admin/usuarios/update/${pid}`}>
              Editar
            </Button>
            <Button variant="subtle" icon="calendar_month" href={`/admin/reservas?usuario=${pid}`}>
              Reservas
            </Button>
          </>
        }
      >
        <UsuarioCampos usuario={usuario} modo="read" />
      </FormLayout>
    </AdminLayout>
  );
}
