import Axios from 'axios';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import DisponibilidadeCampos from '@/components/campos/DisponibilidadeCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

const VAZIA = { espacoId: '', diaSemana: '', horaInicio: '08:00', horaFim: '18:00', permiteExterno: true };

export default function CreateDisponibilidade() {
  const API_URL = `${API}/disponibilidades`;

  const [disponibilidade, setDisponibilidade] = useState(VAZIA);
  const [espacos, setEspacos] = useState([]);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  useEffect(() => {
    const getEspacos = async () => {
      try {
        const response = await Axios.get(`${API}/espacos`);
        // só espaços ativos podem receber disponibilidade
        setEspacos(response.data.filter((e) => e.ativo));
      } catch (error) {
        console.log('Erro ao buscar os espaços:', error);
        setMensagem({ message: mensagemDeErro(error, 'Erro ao buscar os espaços!'), status: 'error' });
      }
    };

    getEspacos();
  }, []);

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

  const handleCreateDisponibilidade = async () => {
    try {
      await Axios.post(API_URL, disponibilidade);
      setMensagem({ message: 'Disponibilidade cadastrada com sucesso.', status: 'ok' });
      setDisponibilidade({ ...VAZIA, espacoId: disponibilidade.espacoId });
    } catch (error) {
      console.log('Erro ao criar a disponibilidade:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao criar a disponibilidade!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Nova disponibilidade" ativo="disponibilidades">
      <FormLayout
        voltar="/admin/disponibilidades"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleCreateDisponibilidade}>
            Salvar
          </Button>
        }
      >
        <DisponibilidadeCampos disponibilidade={disponibilidade} espacos={espacos} onChange={handleChange} onChangeExterno={handleChangeExterno} />
      </FormLayout>
    </AdminLayout>
  );
}
