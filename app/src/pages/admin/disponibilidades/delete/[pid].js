import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import DisponibilidadeCampos from '@/components/campos/DisponibilidadeCampos';
import FormLayout from '@/components/FormLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function DeleteDisponibilidade() {
  const API_URL = `${API}/disponibilidades/`;

  const [disponibilidade, setDisponibilidade] = useState({ espacoId: '', diaSemana: '', horaInicio: '', horaFim: '', permiteExterno: true });
  const [espacos, setEspacos] = useState([]);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);
  const [excluida, setExcluida] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getDisponibilidade = async () => {
      try {
        const [response, respEspacos] = await Promise.all([Axios.get(API_URL + pid), Axios.get(`${API}/espacos`)]);
        setEspacos(respEspacos.data);
        setDisponibilidade(response.data);
        setCarregada(true);
      } catch (error) {
        console.log('Erro ao buscar a disponibilidade:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a disponibilidade!'), status: 'error' });
      }
    };

    getDisponibilidade();
  }, [router.isReady, pid]);

  const handleDeleteDisponibilidade = async () => {
    try {
      await Axios.delete(API_URL + pid);
      setExcluida(true);
      setMensagem({ message: 'Disponibilidade excluída com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao deletar a disponibilidade:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao deletar a disponibilidade!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Excluir disponibilidade" ativo="disponibilidades">
      <FormLayout
        titulo="Disponibilidade"
        voltar="/admin/disponibilidades"
        mensagem={mensagem}
        aviso={
          !excluida && (
            <Alert
              mensagem={{
                message: 'Esta ação não pode ser desfeita.',
                status: 'info',
              }}
            />
          )
        }
        acoes={
          <Button variant="danger" caps onClick={handleDeleteDisponibilidade} disabled={!carregada || excluida}>
            Deletar
          </Button>
        }
      >
        <DisponibilidadeCampos disponibilidade={disponibilidade} espacos={espacos} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
