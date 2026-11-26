import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import ReservaCampos from '@/components/campos/ReservaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';

export default function UpdateReserva() {
  const API_URL = `${API}/reservas/`;

  const [reserva, setReserva] = useState({ espacoId: '', usuarioId: '', empresaId: '', data: '', horaInicio: '', horaFim: '', status: 'CONFIRMADA' });
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [], disponibilidades: [] });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getReserva = async () => {
      try {
        const [response, dados] = await Promise.all([Axios.get(API_URL + pid), carregarListasReserva()]);
        // espaços ativos + o espaço atual da reserva (mesmo se inativo)
        setListas({ ...dados, espacos: dados.espacos.filter((e) => e.ativo || e._id === response.data.espacoId) });
        setReserva({ ...response.data, empresaId: response.data.empresaId || '' });
        setCarregada(true);
      } catch (error) {
        console.log('Erro ao buscar a reserva:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a reserva!'), status: 'error' });
      }
    };

    getReserva();
  }, [router.isReady, pid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReserva({
      ...reserva,
      [name]: value,
    });
  };

  const handleUpdateReserva = async () => {
    try {
      const { espacoId, usuarioId, empresaId, data, horaInicio, horaFim, status } = reserva;
      const response = await Axios.put(API_URL + pid, { espacoId, usuarioId, empresaId: empresaId || null, data, horaInicio, horaFim, status });
      setReserva({ ...response.data, empresaId: response.data.empresaId || '' });
      setMensagem({ message: 'Reserva alterada com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao alterar a reserva:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao alterar a reserva!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Editar reserva" ativo="reservas">
      <FormLayout
        voltar="/admin/reservas"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleUpdateReserva} disabled={!carregada}>
            Salvar
          </Button>
        }
      >
        <ReservaCampos reserva={reserva} {...listas} onChange={handleChange} modo="update" />
      </FormLayout>
    </AdminLayout>
  );
}
