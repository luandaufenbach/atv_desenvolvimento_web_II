const mongoose = require('mongoose');

// Nome do banco no Atlas. A string de conexão fica no arquivo .env (MONGODB_URI)
const DB_NAME = process.env.DB_NAME || 'gestao_espacos';

async function conectar() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI não definida. Crie o arquivo .env na pasta api.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
  console.log(`MongoDB conectado (banco: ${DB_NAME})`);
}

module.exports = { conectar, mongoose };
