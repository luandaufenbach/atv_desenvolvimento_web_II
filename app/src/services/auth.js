// Sessão do usuário logado, guardada no localStorage do navegador
const CHAVE = 'gestaoEspacos.usuario';

export function salvarSessao(usuario) {
  localStorage.setItem(CHAVE, JSON.stringify(usuario));
}

export function obterSessao() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE);
}
