import Axios from 'axios';
import { useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EspacoCampos from '@/components/campos/EspacoCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

const VAZIO = { nome: '', tipo: '', capacidade: '', descricao: '', ativo: true };

export default function CreateEspaco() {
  const API_URL = `${API}/espacos`;

  const [espaco, setEspaco] = useState(VAZIO);
  const [mensagem, setMensagem] = useState({ message: '', status: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEspaco({
      ...espaco,
      [name]: value,
    });
  };

  const handleChangeAtivo = (ativo) => {
    setEspaco({ ...espaco, ativo });
  };

  const handleCreateEspaco = async () => {
    try {
      const response = await Axios.post(API_URL, espaco);
      setMensagem({ message: `Espaço "${response.data.nome}" cadastrado com sucesso.`, status: 'ok' });
      setEspaco(VAZIO);
    } catch (error) {
      console.log('Erro ao criar o espaço:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao criar o espaço!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Novo espaço" ativo="espacos">
      <FormLayout
        voltar="/admin/espacos"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleCreateEspaco}>
            Salvar
          </Button>
        }
      >
        <EspacoCampos espaco={espaco} onChange={handleChange} onChangeAtivo={handleChangeAtivo} />
      </FormLayout>
    </AdminLayout>
  );
}
