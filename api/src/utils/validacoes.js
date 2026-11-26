const mongoose = require('mongoose');

// Valida o formato "HH:MM"
function horaValida(hora) {
  return typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

// Valida "AAAA-MM-DD" e se a data realmente existe (ex.: rejeita 2026-02-31)
function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T00:00:00`);
  return !isNaN(d.getTime()) && d.toLocaleDateString('en-CA') === data;
}

// Data de hoje no formato AAAA-MM-DD (fuso local)
function hoje() {
  return new Date().toLocaleDateString('en-CA');
}

// Dia da semana (0 = Domingo ... 6 = Sábado)
function diaDaSemana(data) {
  return new Date(`${data}T00:00:00`).getDay();
}

// Verifica se o texto é um ObjectId válido do MongoDB
function idValido(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
}

// Escapa caracteres especiais para usar o texto dentro de uma RegExp
function escaparRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Verifica se uma reserva cabe em alguma das disponibilidades informadas.
 * Retorna a disponibilidade encontrada ou undefined.
 */
function disponibilidadeQueCobre(reserva, disponibilidades) {
  const dia = diaDaSemana(reserva.data);
  return disponibilidades.find(
    (d) =>
      String(d.espacoId) === String(reserva.espacoId) &&
      d.diaSemana === dia &&
      reserva.horaInicio >= d.horaInicio &&
      reserva.horaFim <= d.horaFim &&
      // reserva sem empresa é externa: precisa de disponibilidade que permita externo
      (reserva.empresaId ? true : d.permiteExterno)
  );
}

module.exports = {
  horaValida,
  dataValida,
  hoje,
  diaDaSemana,
  idValido,
  escaparRegex,
  disponibilidadeQueCobre,
};
