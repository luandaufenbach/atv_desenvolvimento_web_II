// Funções de formatação e listas usadas nas telas

export const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const TIPOS_ESPACO = [
  { value: 'COWORKING', label: 'Coworking' },
  { value: 'LAB', label: 'Laboratório' },
  { value: 'MEETING_ROOM', label: 'Sala de reunião' },
];

export function nomeTipoEspaco(tipo) {
  const t = TIPOS_ESPACO.find((x) => x.value === tipo);
  return t ? t.label : tipo;
}

// 1 -> "1 pessoa", 10 -> "10 pessoas"
export function pessoas(n) {
  return `${n} ${Number(n) === 1 ? 'pessoa' : 'pessoas'}`;
}

// "2026-10-13" -> "13/10/2026"
export function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).split('-');
  return `${dia}/${mes}/${ano}`;
}

// "12345678000190" -> "12.345.678/0001-90"
export function formatarCnpj(cnpj) {
  const n = String(cnpj || '').replace(/\D/g, '');
  if (n.length !== 14) return cnpj || '';
  return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// "48999990000" -> "(48) 99999-0000"
export function formatarTelefone(tel) {
  const n = String(tel || '').replace(/\D/g, '');
  if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (n.length === 10) return n.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return tel || '';
}

// Data de hoje no formato AAAA-MM-DD
export function hoje() {
  return new Date().toLocaleDateString('en-CA');
}

// Monta um mapa { _id: registro } para achar nomes rapidamente nas listagens
export function mapaPorId(lista) {
  const mapa = {};
  lista.forEach((item) => {
    mapa[item._id] = item;
  });
  return mapa;
}
