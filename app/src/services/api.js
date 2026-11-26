// Endereço base da API REST (pode ser trocado no arquivo .env.local com NEXT_PUBLIC_API_URL)
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Extrai a mensagem de erro devolvida pela API ({ mensagem }) ou uma mensagem padrão
export function mensagemDeErro(error, padrao) {
  if (error && error.response && error.response.data && error.response.data.mensagem) {
    return error.response.data.mensagem;
  }
  if (error && error.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar à API. Verifique se ela está rodando.';
  }
  return padrao;
}
