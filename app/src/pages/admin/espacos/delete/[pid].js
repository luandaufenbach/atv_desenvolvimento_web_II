import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EspacoCampos from '@/components/campos/EspacoCampos';
import FormLayout from '@/components/FormLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function DeleteEspaco() {
  const API_URL = `${API}/espacos/`;

  const [espaco, setEspaco] = useState({ nome: '', tipo: '', capacidade: '', descricao: '', ativo: true });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregado, setCarregado] = useState(false);
  const [excluido, setExcluido] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getEspaco = async () => {
      try {
        const response = await Axios.get(API_URL + pid);
        setEspaco(response.data);
        setCarregado(true);
      } catch (error) {
        console.log('Erro ao buscar o espaço:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar o espaço!'), status: 'error' });
      }
    };

    getEspaco();
  }, [router.isReady, pid]);

  const handleDeleteEspaco = async () => {
    try {
      await Axios.delete(API_URL + pid);
      setExcluido(true);
      setMensagem({ message: 'Espaço excluído com sucesso!', status: 'ok' });
    } catch (error) {
      console.log('Erro ao deletar o espaço:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao deletar o espaço!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Excluir espaço" ativo="espacos">
      <FormLayout
        titulo={espaco.nome || 'Espaço'}
        icone="meeting_room"
        voltar="/admin/espacos"
        mensagem={mensagem}
        aviso={
          !excluido && (
            <Alert
              mensagem={{
                message: 'Confira os dados. A exclusão não pode ser desfeita. Espaços com disponibilidades ou reservas não podem ser excluídos — se quiser só tirar de uso, edite e marque como inativo.',
                status: 'info',
              }}
            />
          )
        }
        acoes={
          <Button variant="danger" caps icon="delete" onClick={handleDeleteEspaco} disabled={!carregado || excluido}>
            Deletar
          </Button>
        }
      >
        <EspacoCampos espaco={espaco} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
