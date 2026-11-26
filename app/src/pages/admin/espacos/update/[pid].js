import Axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AdminLayout from '@/components/AdminLayout';
import EspacoCampos from '@/components/campos/EspacoCampos';
import FormLayout from '@/components/FormLayout';
import Button from '@/components/ui/Button';
import { API, mensagemDeErro } from '@/services/api';

export default function UpdateEspaco() {
  const API_URL = `${API}/espacos/`;

  const [espaco, setEspaco] = useState({ nome: '', tipo: '', capacidade: '', descricao: '', ativo: true });
  const [mensagem, setMensagem] = useState({ message: '', status: '' });
  const [carregado, setCarregado] = useState(false);

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

  const handleUpdateEspaco = async () => {
    try {
      const { nome, tipo, capacidade, descricao, ativo } = espaco;
      const response = await Axios.put(API_URL + pid, { nome, tipo, capacidade, descricao, ativo });
      setEspaco(response.data);
      setMensagem({ message: 'Espaço alterado com sucesso.', status: 'ok' });
    } catch (error) {
      console.log('Erro ao alterar o espaço:', error);
      setMensagem({ message: mensagemDeErro(error, 'Erro ao alterar o espaço!'), status: 'error' });
    }
  };

  return (
    <AdminLayout titulo="Editar espaço" ativo="espacos">
      <FormLayout
        voltar="/admin/espacos"
        mensagem={mensagem}
        acoes={
          <Button caps onClick={handleUpdateEspaco} disabled={!carregado}>
            Salvar
          </Button>
        }
      >
        <EspacoCampos espaco={espaco} onChange={handleChange} onChangeAtivo={handleChangeAtivo} />
      </FormLayout>
    </AdminLayout>
  );
}
