import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import DisponibilidadeCampos from '@/components/campos/DisponibilidadeCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function UpdateDisponibilidade() {
  const API_URL = `${API}/disponibilidades/`;

  const [disponibilidade, setDisponibilidade] = useState({ espacoId: '', diaSemana: '', horaInicio: '', horaFim: '', permiteExterno: true });
  const [espacos, setEspacos] = useState([]);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregada, setCarregada] = useState(false);

  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const getDisponibilidade = async () => {
      try {
        const [response, respEspacos] = await Promise.all([Axios.get(API_URL + pid), Axios.get(`${API}/espacos`)]);
        // mantém na lista o espaço atual, mesmo se estiver inativo, mais os ativos
        setEspacos(respEspacos.data.filter((e) => e.ativo || e._id === response.data.espacoId));
        setDisponibilidade(response.data);
        setCarregada(true);
      } catch (error) {
        console.log('Erro ao buscar a disponibilidade:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar a disponibilidade!'), status: 'error' });
      }
    };

    getDisponibilidade();
  }, [router.isReady, pid]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDisponibilidade({
      ...disponibilidade,
      [name]: value,
    });
  };

  const handleChangeExterno = (permiteExterno) => {
    setDisponibilidade({ ...disponibilidade, permiteExterno });
  };

  const handleUpdateDisponibilidade = async () => {
    try {
      const { espacoId, diaSemana, horaInicio, horaFim, permiteExterno } = disponibilidade;
      const response = await Axios.put(API_URL + pid, { espacoId, diaSemana, horaInicio, horaFim, permiteExterno });
      setDisponibilidade(response.data);
      setMensagem({ message: 'Disponibilidade alterada com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao alterar a disponibilidade:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao alterar a disponibilidade!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Editar disponibilidade" ativo="disponibilidades">
      <FormLayout
        voltar="/admin/disponibilidades"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleUpdateDisponibilidade} disabled={!carregada}>
            Salvar
          </Button>
        }
      >
        <DisponibilidadeCampos disponibilidade={disponibilidade} espacos={espacos} onChange={handleChange} onChangeExterno={handleChangeExterno} />
      </FormLayout>
    </AdminLayout>
  );
}
