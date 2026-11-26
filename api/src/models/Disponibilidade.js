const { mongoose } = require('../db/db');

const disponibilidadeSchema = new mongoose.Schema(
  {
    espacoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Espaco', required: true },
    diaSemana: { type: Number, required: true, min: 0, max: 6 }, // 0 = Domingo ... 6 = Sábado
    horaInicio: { type: String, required: true }, // HH:MM
    horaFim: { type: String, required: true }, // HH:MM
    permiteExterno: { type: Boolean, default: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Disponibilidade', disponibilidadeSchema, 'disponibilidades');
