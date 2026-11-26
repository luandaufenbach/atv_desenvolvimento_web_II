import Axios from 'axios';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import ReservaCampos from '@/components/campos/ReservaCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';
import { carregarListasReserva } from '@/services/carregarListas';

const VAZIA = { espacoId: '', usuarioId: '', empresaId: '', data: '', horaInicio: '', horaFim: '' };

export default function CreateReserva() {
  const API_URL = `${API}/reservas`;

  const [reserva, setReserva] = useState(VAZIA);
  const [listas, setListas] = useState({ espacos: [], usuarios: [], empresas: [], disponibilidades: [] });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await carregarListasReserva();
        // só espaços ativos podem ser reservados
        setListas({ ...dados, espacos: dados.espacos.filter((e) => e.ativo) });
      } catch (error) {
        console.log('Erro ao buscar os cadastros:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os cadastros!'), status: 'error' });
      }
    };

    carregar();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReserva({
      ...reserva,
      [name]: value,
    });
  };

  const handleCreateReserva = async () => {
    try {
      await Axios.post(API_URL, { ...reserva, empresaId: reserva.empresaId || null });
      setMensagem({ message: 'Reserva confirmada com sucesso!', status: 'ok' });
      setReserva(VAZIA);
    } catch (error) {
      console.log('Erro ao criar a reserva:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao criar a reserva!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Nova reserva" ativo="reservas">
      <FormLayout
        titulo="Dados da reserva"
        icone="calendar_month"
        voltar="/admin/reservas"
        mensagem={mensagem}
        acoes={
          <Button caps icon="event_available" onClick={handleCreateReserva}>
            Reservar
          </Button>
        }
      >
        <ReservaCampos reserva={reserva} {...listas} onChange={handleChange} modo="create" />
      </FormLayout>
    </AdminLayout>
  );
}
