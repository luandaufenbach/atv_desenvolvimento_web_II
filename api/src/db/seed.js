/**
 * Importa os dados dos arquivos JSON da parte 1 para o MongoDB.
 * Converte os ids numéricos em ObjectId e refaz as referências entre as coleções.
 * As senhas são gravadas com hash (bcrypt).
 *
 * Uso: npm run seed            (só importa se o banco estiver vazio)
 *      npm run seed -- --force (APAGA as 5 coleções e importa de novo)
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { conectar, mongoose } = require('./db');

const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Espaco = require('../models/Espaco');
const Disponibilidade = require('../models/Disponibilidade');
const Reserva = require('../models/Reserva');

const usuariosJson = require('./usuarios.json');
const empresasJson = require('./empresas.json');
const espacosJson = require('./espacos.json');
const disponibilidadesJson = require('./disponibilidades.json');
const reservasJson = require('./reservas.json');

// Gera um ObjectId novo para cada id numérico e devolve o mapa id -> ObjectId
function mapearIds(lista) {
  const mapa = new Map();
  lista.forEach((item) => mapa.set(item.id, new mongoose.Types.ObjectId()));
  return mapa;
}

async function main() {
  await conectar();

  const forcar = process.argv.includes('--force');
  const modelos = [Usuario, Empresa, Espaco, Disponibilidade, Reserva];
  const totais = await Promise.all(modelos.map((m) => m.estimatedDocumentCount()));

  if (totais.some((t) => t > 0) && !forcar) {
    console.log('O banco já tem dados. Nada foi importado. Use "npm run seed -- --force" para apagar e importar de novo.');
    return;
  }

  if (forcar) {
    await Promise.all(modelos.map((m) => m.deleteMany({})));
    console.log('Coleções limpas.');
  }

  // garante os índices únicos (email, cnpj) antes de inserir
  await Promise.all(modelos.map((m) => m.init()));

  const idsUsuarios = mapearIds(usuariosJson);
  const idsEmpresas = mapearIds(empresasJson);
  const idsEspacos = mapearIds(espacosJson);

  const usuarios = await Promise.all(
    usuariosJson.map(async ({ id, ...u }) => ({
      ...u,
      _id: idsUsuarios.get(id),
      email: u.email.toLowerCase(),
      senha: await bcrypt.hash(String(u.senha), 10),
    }))
  );

  const empresas = empresasJson.map(({ id, ...e }) => ({ ...e, _id: idsEmpresas.get(id) }));
  const espacos = espacosJson.map(({ id, ...e }) => ({ ...e, _id: idsEspacos.get(id) }));

  const disponibilidades = disponibilidadesJson.map(({ id, ...d }) => ({
    ...d,
    espacoId: idsEspacos.get(d.espacoId),
  }));

  const reservas = reservasJson.map(({ id, ...r }) => ({
    ...r,
    espacoId: idsEspacos.get(r.espacoId),
    usuarioId: idsUsuarios.get(r.usuarioId),
    empresaId: r.empresaId ? idsEmpresas.get(r.empresaId) : null,
  }));

  await Usuario.insertMany(usuarios);
  await Empresa.insertMany(empresas);
  await Espaco.insertMany(espacos);
  await Disponibilidade.insertMany(disponibilidades);
  await Reserva.insertMany(reservas);

  console.log(
    `Importado: ${usuarios.length} usuários, ${empresas.length} empresas, ${espacos.length} espaços, ` +
      `${disponibilidades.length} disponibilidades, ${reservas.length} reservas.`
  );
}

main()
  .catch((erro) => {
    console.error('Erro no seed:', erro.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
