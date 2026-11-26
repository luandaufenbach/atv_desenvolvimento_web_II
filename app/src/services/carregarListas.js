import Axios from 'axios';

import { API } from '@/services/api';

// Busca de uma vez as listas usadas nos selects e nomes das reservas
export async function carregarListasReserva() {
  const [espacos, usuarios, empresas, disponibilidades] = await Promise.all([
    Axios.get(`${API}/espacos`),
    Axios.get(`${API}/usuarios`),
    Axios.get(`${API}/empresas`),
    Axios.get(`${API}/disponibilidades`),
  ]);

  return {
    espacos: espacos.data,
    usuarios: usuarios.data,
    empresas: empresas.data,
    disponibilidades: disponibilidades.data,
  };
}
