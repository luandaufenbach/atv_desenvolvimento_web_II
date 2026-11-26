import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EspacoCampos from '@/components/campos/EspacoCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function ReadEspaco() {
  const API_URL = `${API}/espacos/`;

  const [espaco, setEspaco] = useState({ nome: '', tipo: '', capacidade: '', descricao: '', ativo: true });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getEspaco = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setEspaco(response.data);
      } catch (error) {
        console.log('Erro ao buscar o espaço:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar o espaço!'), status: 'error' });
      }
    };

    getEspaco();
  }, [router.isReady, pid]);

  return (
    <AdminLayout titulo="Detalhes do espaço" ativo="espacos">
      <FormLayout
        titulo={espaco.nome || 'Espaço'}
        icone="meeting_room"
        voltar="/admin/espacos"
        mensagem={mensagem}
        acoes={
          <>
            <Button variant="secondary" icon="edit" href={`/admin/espacos/update/${pid}`}>
              Editar
            </Button>
            <Button variant="subtle" icon="event_available" href={`/admin/disponibilidades?espaco=${pid}`}>
              Disponibilidades
            </Button>
          </>
        }
      >
        <EspacoCampos espaco={espaco} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
