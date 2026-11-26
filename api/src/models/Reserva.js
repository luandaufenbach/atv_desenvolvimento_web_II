const { mongoose } = require('../db/db');

const STATUS_RESERVA = ['CONFIRMADA', 'CANCELADA'];

const reservaSchema = new mongoose.Schema(
  {
    espacoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Espaco', required: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    // sem empresa a reserva é considerada externa
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', default: null },
    data: { type: String, required: true }, // AAAA-MM-DD
    horaInicio: { type: String, required: true }, // HH:MM
    horaFim: { type: String, required: true }, // HH:MM
    status: { type: String, enum: STATUS_RESERVA, default: 'CONFIRMADA' },
    dataCadastro: { type: String, required: true }, // AAAA-MM-DD
  },
  { versionKey: false }
);

const Reserva = mongoose.model('Reserva', reservaSchema, 'reservas');
Reserva.STATUS = STATUS_RESERVA;

module.exports = Reserva;
