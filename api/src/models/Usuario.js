const { mongoose } = require('../db/db');

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // senha guardada com hash (bcrypt) e nunca devolvida nas consultas
    senha: { type: String, required: true, select: false },
    telefone: { type: String, default: '', trim: true },
    dataCadastro: { type: String, required: true }, // AAAA-MM-DD
  },
  { versionKey: false }
);

// Garante que a senha nunca saia no JSON da resposta
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.senha;
    return ret;
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
