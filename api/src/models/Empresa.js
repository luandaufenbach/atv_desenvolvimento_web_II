const { mongoose } = require('../db/db');

const empresaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    cnpj: { type: String, required: true, unique: true, match: /^\d{14}$/ },
    email: { type: String, default: '', trim: true, lowercase: true },
    telefone: { type: String, default: '', trim: true },
    endereco: { type: String, default: '', trim: true },
    dataCadastro: { type: String, required: true }, // AAAA-MM-DD
  },
  { versionKey: false }
);

module.exports = mongoose.model('Empresa', empresaSchema, 'empresas');
