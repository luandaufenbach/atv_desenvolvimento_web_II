import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import ReservaCampos from '@/components/campos/ReservaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';

export default function ReadReserva() {
  const API_URL = `${API}/reservas/`;

  const [reserva, setReserva] = useState({ espacoId: '', usuarioId: '', empresaId: '', data: '', horaInicio: '', horaFim: '', status: '' });
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [] });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getReserva = async () => {
      try {
        const [response, dados] = await Promise.all([Axios.get(API_URL + pid), carregarListasReserva()]);
        setListas(dados);
        setReserva(response.data);
      } catch (error) {
        console.log('Erro ao buscar a reserva:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a reserva!'), status: 'error' });
      }
    };

    getReserva();
  }, [router.isReady, pid]);

  return (
    <AdminLayout titulo="Detalhes da reserva" ativo="reservas">
      <FormLayout
        titulo="Reserva"
        voltar="/admin/reservas"
        mensagem={mensagem}
        acoes={
          <>
            <Button variant="secondary" href={`/admin/reservas/update/${pid}`}>
              Editar
            </Button>
            <Button variant="danger" href={`/admin/reservas/delete/${pid}`}>
              {reserva.status === 'CONFIRMADA' ? 'Cancelar' : 'Excluir'}
            </Button>
          </>
        }
      >
        <ReservaCampos reserva={reserva} {...listas} modo="read" />
      </FormLayout>
    </AdminLayout>
  );
}
