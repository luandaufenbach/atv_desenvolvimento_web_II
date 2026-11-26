const { mongoose } = require('../db/db');

const TIPOS_ESPACO = ['COWORKING', 'LAB', 'MEETING_ROOM'];

const espacoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: TIPOS_ESPACO },
    capacidade: { type: Number, required: true, min: 1 },
    descricao: { type: String, default: '', trim: true },
    ativo: { type: Boolean, default: true },
  },
  { versionKey: false }
);

const Espaco = mongoose.model('Espaco', espacoSchema, 'espacos');
Espaco.TIPOS = TIPOS_ESPACO;

module.exports = Espaco;
