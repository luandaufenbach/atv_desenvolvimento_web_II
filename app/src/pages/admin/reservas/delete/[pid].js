import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import ReservaCampos from '@/components/campos/ReservaCampos';
import FormLayout from '@/components/FormLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';

/**
 * Regra: uma reserva confirmada precisa ser CANCELADA primeiro;
 * só depois de cancelada ela pode ser excluída.
 */
export default function DeleteReserva() {
  const API_URL = `${API}/reservas/`;

  const [reserva, setReserva] = useState({ espacoId: '', usuarioId: '', empresaId: '', data: '', horaInicio: '', horaFim: '', status: '' });
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [] });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);
  const [excluida, setExcluida] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getReserva = async () => {
      try {
        const [response, dados] = await Promise.all([Axios.get(API_URL + pid), carregarListasReserva()]);
        setListas(dados);
        setReserva(response.data);
        setCarregada(true);
      } catch (error) {
        console.log('Erro ao buscar a reserva:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a reserva!'), status: 'error' });
      }
    };

    getReserva();
  }, [router.isReady, pid]);

  const handleCancelReserva = async () => {
    try {
      const response = await Axios.put(`${API_URL}${pid}/cancelar`);
      setReserva(response.data);
      setMensagem({ message: 'Reserva cancelada.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao cancelar a reserva:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao cancelar a reserva!'), status: 'error' });
    }
  };

  const handleDeleteReserva = async () => {
    try {
      await Axios.delete(API_URL + pid);
      setExcluida(true);
      setMensagem({ message: 'Reserva excluída com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao deletar a reserva:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao deletar a reserva!'), status: 'error' });
    }
  };

  const confirmada = reserva.status === 'CONFIRMADA';

  let aviso = null;
  if (!excluida && confirmada) {
    aviso = <Alert mensagem={{ message: 'Para excluir, primeiro cancele a reserva.', status: 'info' }} />;
  } else if (!excluida && reserva.status === 'CANCELADA') {
    aviso = <Alert mensagem={{ message: 'Esta ação não pode ser desfeita.', status: 'info' }} />;
  }

  return (
    <AdminLayout titulo={confirmada ? 'Cancelar reserva' : 'Excluir reserva'} ativo="reservas">
      <FormLayout
        titulo="Reserva"
        voltar="/admin/reservas"
        mensagem={mensagem}
        aviso={aviso}
        acoes={
          confirmada ? (
            <Button variant="danger" caps onClick={handleCancelReserva} disabled={!carregada}>
              Cancelar reserva
            </Button>
          ) : (
            <Button variant="danger" caps onClick={handleDeleteReserva} disabled={!carregada || excluida}>
              Deletar
            </Button>
          )
        }
      >
        <ReservaCampos reserva={reserva} {...listas} modo="read" />
      </FormLayout>
    </AdminLayout>
  );
}
