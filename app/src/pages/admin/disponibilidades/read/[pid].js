import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import DisponibilidadeCampos from '@/components/campos/DisponibilidadeCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function ReadDisponibilidade() {
  const API_URL = `${API}/disponibilidades/`;

  const [disponibilidade, setDisponibilidade] = useState({ espacoId: '', diaSemana: '', horaInicio: '', horaFim: '', permiteExterno: true });
  const [espacos, setEspacos] = useState([]);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getDisponibilidade = async () => {
      try {
        const [response, respEspacos] = await Promise.all([Axios.get(API_URL + pid), Axios.get(`${API}/espacos`)]);
        setEspacos(respEspacos.data);
        setDisponibilidade(response.data);
      } catch (error) {
        console.log('Erro ao buscar a disponibilidade:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a disponibilidade!'), status: 'error' });
      }
    };

    getDisponibilidade();
  }, [router.isReady, pid]);

  return (
    <AdminLayout titulo="Detalhes da disponibilidade" ativo="disponibilidades">
      <FormLayout
        titulo="Disponibilidade"
        voltar="/admin/disponibilidades"
        mensagem={mensagem}
        acoes={
          <Button variant="secondary" href={`/admin/disponibilidades/update/${pid}`}>
            Editar
          </Button>
        }
      >
        <DisponibilidadeCampos disponibilidade={disponibilidade} espacos={espacos} readOnly />
      </FormLayout>
    </AdminLayout>
  );
}
