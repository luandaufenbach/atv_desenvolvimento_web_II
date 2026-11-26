// Endereço da API publicada no Render
const API_PUBLICADA = 'https://gestao-espacos-api.onrender.com/api';

// Rodando no próprio computador usa a API local; publicado, usa a do Render.
// Também pode ser trocado com NEXT_PUBLIC_API_URL (arquivo .env.local ou painel da Vercel).
function enderecoDaApi() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return API_PUBLICADA;
  }
  return 'http://localhost:8080/api';
}

export const API = enderecoDaApi();

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
