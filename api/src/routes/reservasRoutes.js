const express = require('express');

const Reserva = require('../models/Reserva');
const Espaco = require('../models/Espaco');
const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Disponibilidade = require('../models/Disponibilidade');
const {
  idValido,
  horaValida,
  dataValida,
  hoje,
  diaDaSemana,
} = require('../utils/validacoes');

const router = express.Router();

const ORDEM = { data: 1, horaInicio: 1 };

// Hora atual no formato HH:MM
function horaAgora() {
  return new Date().toTimeString().slice(0, 5);
}

// Verdadeiro se a reserva começa antes deste momento
function jaComecou(r) {
  return r.data < hoje() || (r.data === hoje() && r.horaInicio <= horaAgora());
}

/**
 * Aplica todas as regras de negócio a uma reserva.
 * Retorna { status, mensagem } se houver erro, ou null se estiver tudo certo.
 * idIgnorar: id da própria reserva (usado no PUT para não conflitar consigo mesma).
 */
async function validarReserva(r, idIgnorar = null) {
  if (!idValido(String(r.espacoId))) return { status: 404, mensagem: 'Espaço não encontrado' };
  if (!idValido(String(r.usuarioId))) return { status: 404, mensagem: 'Usuário não encontrado' };
  if (r.empresaId !== null && !idValido(String(r.empresaId))) {
    return { status: 404, mensagem: 'Empresa não encontrada' };
  }

  const espaco = await Espaco.findById(r.espacoId);
  if (!espaco) return { status: 404, mensagem: 'Espaço não encontrado' };

  if (!(await Usuario.exists({ _id: r.usuarioId }))) {
    return { status: 404, mensagem: 'Usuário não encontrado' };
  }

  if (r.empresaId !== null && !(await Empresa.exists({ _id: r.empresaId }))) {
    return { status: 404, mensagem: 'Empresa não encontrada' };
  }

  if (!dataValida(r.data)) {
    return { status: 400, mensagem: 'data deve estar no formato AAAA-MM-DD e ser válida' };
  }

  if (!horaValida(r.horaInicio) || !horaValida(r.horaFim)) {
    return { status: 400, mensagem: 'Horários devem estar no formato HH:MM' };
  }

  if (r.horaInicio >= r.horaFim) {
    return { status: 400, mensagem: 'horaInicio deve ser anterior a horaFim' };
  }

  if (!Reserva.STATUS.includes(r.status)) {
    return { status: 400, mensagem: 'status inválido. Use CONFIRMADA ou CANCELADA' };
  }

  // Reserva cancelada não ocupa o espaço, então não precisa das regras abaixo
  if (r.status === 'CANCELADA') return null;

  if (!espaco.ativo) {
    return { status: 400, mensagem: 'Não é possível reservar um espaço inativo' };
  }

  if (jaComecou(r)) {
    return { status: 400, mensagem: 'Não é possível confirmar uma reserva para data/horário que já passou' };
  }

  // A reserva precisa caber dentro de alguma disponibilidade do espaço naquele dia da semana
  const disponibilidade = await Disponibilidade.findOne({
    espacoId: r.espacoId,
    diaSemana: diaDaSemana(r.data),
    horaInicio: { $lte: r.horaInicio },
    horaFim: { $gte: r.horaFim },
  });

  if (!disponibilidade) {
    return { status: 400, mensagem: 'O espaço não tem disponibilidade para esta data e horário' };
  }

  // Externo = reserva feita sem empresa vinculada
  if (!disponibilidade.permiteExterno && r.empresaId === null) {
    return {
      status: 403,
      mensagem: 'Esta disponibilidade não permite reservas externas (informe a empresa)',
    };
  }

  // Sem sobreposição com outra reserva confirmada no mesmo espaço e data
  const conflito = await Reserva.exists({
    _id: { $ne: idIgnorar },
    status: 'CONFIRMADA',
    espacoId: r.espacoId,
    data: r.data,
    horaInicio: { $lt: r.horaFim },
    horaFim: { $gt: r.horaInicio },
  });

  if (conflito) {
    return { status: 409, mensagem: 'Já existe uma reserva neste espaço que conflita com este horário' };
  }

  return null;
}

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Reservas de espaços
 *
 * components:
 *   schemas:
 *     Reserva:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34cd
 *         espacoId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34aa
 *         usuarioId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34bb
 *         empresaId:
 *           type: string
 *           nullable: true
 *           example: null
 *         data:
 *           type: string
 *           format: date
 *           example: "2026-12-14"
 *         horaInicio:
 *           type: string
 *           example: "09:00"
 *         horaFim:
 *           type: string
 *           example: "11:00"
 *         status:
 *           type: string
 *           enum: [CONFIRMADA, CANCELADA]
 *           example: CONFIRMADA
 *         dataCadastro:
 *           type: string
 *           format: date
 *           example: "2026-11-26"
 *     ReservaInput:
 *       type: object
 *       required:
 *         - espacoId
 *         - usuarioId
 *         - data
 *         - horaInicio
 *         - horaFim
 *       properties:
 *         espacoId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34aa
 *         usuarioId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34bb
 *         empresaId:
 *           type: string
 *           nullable: true
 *           description: Opcional. Sem empresa a reserva é considerada externa
 *           example: null
 *         data:
 *           type: string
 *           format: date
 *           example: "2026-12-14"
 *         horaInicio:
 *           type: string
 *           example: "09:00"
 *         horaFim:
 *           type: string
 *           example: "11:00"
 *         status:
 *           type: string
 *           enum: [CONFIRMADA, CANCELADA]
 *           example: CONFIRMADA
 */

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Lista todas as reservas
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de reservas ordenada por data e horário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 */
router.get('/', async (req, res) => {
  res.json(await Reserva.find().sort(ORDEM));
});

/**
 * @swagger
 * /reservas/data/{data}:
 *   get:
 *     summary: Busca as reservas de uma data
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         description: Data no formato AAAA-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-12-14"
 *     responses:
 *       200:
 *         description: Reservas da data, ordenadas por horário (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Data inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/data/:data', async (req, res) => {
  if (!dataValida(req.params.data)) {
    return res.status(400).json({ mensagem: 'data deve estar no formato AAAA-MM-DD e ser válida' });
  }

  res.json(await Reserva.find({ data: req.params.data }).sort(ORDEM));
});

/**
 * @swagger
 * /reservas/espaco/{espacoId}:
 *   get:
 *     summary: Lista as reservas de um espaço
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: espacoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservas do espaço (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Espaço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/espaco/:espacoId', async (req, res) => {
  const { espacoId } = req.params;

  if (!idValido(espacoId) || !(await Espaco.exists({ _id: espacoId }))) {
    return res.status(404).json({ mensagem: 'Espaço não encontrado' });
  }

  res.json(await Reserva.find({ espacoId }).sort(ORDEM));
});

/**
 * @swagger
 * /reservas/usuario/{usuarioId}:
 *   get:
 *     summary: Lista as reservas de um usuário
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservas do usuário (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/usuario/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  if (!idValido(usuarioId) || !(await Usuario.exists({ _id: usuarioId }))) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  res.json(await Reserva.find({ usuarioId }).sort(ORDEM));
});

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Busca uma reserva pelo id
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
  const reserva = idValido(req.params.id) ? await Reserva.findById(req.params.id) : null;

  if (!reserva) {
    return res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }

  res.json(reserva);
});

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Cria uma reserva
 *     description: |
 *       Regras: espaço ativo; usuário (e empresa, se informada) existentes; data/horário ainda
 *       não passados; dentro de uma disponibilidade do espaço; reserva externa só onde
 *       permiteExterno; sem conflito com outra reserva confirmada.
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaInput'
 *     responses:
 *       201:
 *         description: Reserva criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Campos inválidos, espaço inativo, data passada ou fora da disponibilidade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Disponibilidade não permite reserva externa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Espaço, usuário ou empresa não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Conflito de horário com outra reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { espacoId, usuarioId, empresaId, data, horaInicio, horaFim, status } = req.body || {};

  if (!espacoId || !usuarioId || !data || !horaInicio || !horaFim) {
    return res.status(400).json({
      mensagem: 'espacoId, usuarioId, data, horaInicio e horaFim são obrigatórios',
    });
  }

  const nova = {
    espacoId: String(espacoId),
    usuarioId: String(usuarioId),
    empresaId: empresaId ? String(empresaId) : null,
    data,
    horaInicio,
    horaFim,
    status: status || 'CONFIRMADA',
  };

  // Uma reserva nova sempre nasce confirmada
  if (nova.status !== 'CONFIRMADA') {
    return res.status(400).json({ mensagem: 'Uma nova reserva deve ser criada como CONFIRMADA' });
  }

  const erro = await validarReserva(nova);
  if (erro) {
    return res.status(erro.status).json({ mensagem: erro.mensagem });
  }

  const reserva = await Reserva.create({ ...nova, dataCadastro: hoje() });
  res.status(201).json(reserva);
});

/**
 * @swagger
 * /reservas/{id}/cancelar:
 *   put:
 *     summary: Cancela uma reserva (passo obrigatório antes de excluir)
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Reserva já está cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id/cancelar', async (req, res) => {
  const reserva = idValido(req.params.id) ? await Reserva.findById(req.params.id) : null;

  if (!reserva) {
    return res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }

  if (reserva.status === 'CANCELADA') {
    return res.status(409).json({ mensagem: 'A reserva já está cancelada' });
  }

  reserva.status = 'CANCELADA';
  await reserva.save();
  res.json(reserva);
});

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Atualiza uma reserva (envie só os campos que quer alterar)
 *     description: |
 *       Reservas que já começaram só podem ser canceladas. Reconfirmar uma reserva
 *       cancelada passa por todas as regras de novo (disponibilidade, conflito etc.).
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaInput'
 *     responses:
 *       200:
 *         description: Reserva atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Campos inválidos, espaço inativo, data passada ou fora da disponibilidade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Disponibilidade não permite reserva externa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Reserva, espaço, usuário ou empresa não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Conflito de horário ou reserva já iniciada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
  const reserva = idValido(req.params.id) ? await Reserva.findById(req.params.id) : null;

  if (!reserva) {
    return res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }

  const { espacoId, usuarioId, empresaId, data, horaInicio, horaFim, status } = req.body || {};

  // id e dataCadastro não podem ser alterados; campos ausentes mantêm o valor atual
  const atualizada = {
    espacoId: espacoId !== undefined ? String(espacoId) : String(reserva.espacoId),
    usuarioId: usuarioId !== undefined ? String(usuarioId) : String(reserva.usuarioId),
    empresaId:
      empresaId !== undefined
        ? empresaId
          ? String(empresaId)
          : null
        : reserva.empresaId
          ? String(reserva.empresaId)
          : null,
    data: data !== undefined ? data : reserva.data,
    horaInicio: horaInicio !== undefined ? horaInicio : reserva.horaInicio,
    horaFim: horaFim !== undefined ? horaFim : reserva.horaFim,
    status: status !== undefined ? status : reserva.status,
  };

  // Reserva que já começou: só é permitido cancelar
  if (jaComecou(reserva)) {
    const mudouAlgoAlemDoStatus = ['espacoId', 'usuarioId', 'empresaId', 'data', 'horaInicio', 'horaFim'].some(
      (campo) => String(atualizada[campo]) !== String(reserva[campo] ?? null)
    );
    const reconfirmando = atualizada.status === 'CONFIRMADA' && reserva.status === 'CANCELADA';
    if (mudouAlgoAlemDoStatus || reconfirmando) {
      return res.status(409).json({ mensagem: 'Esta reserva já começou ou passou: só é possível cancelá-la' });
    }
  }

  const erro = await validarReserva(atualizada, reserva._id);
  if (erro) {
    return res.status(erro.status).json({ mensagem: erro.mensagem });
  }

  reserva.set(atualizada);
  await reserva.save();
  res.json(reserva);
});

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Remove uma reserva
 *     description: Regra: só é possível excluir reservas canceladas.
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva removida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Reserva ainda confirmada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
  const reserva = idValido(req.params.id) ? await Reserva.findById(req.params.id) : null;

  if (!reserva) {
    return res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }

  if (reserva.status !== 'CANCELADA') {
    return res.status(409).json({ mensagem: 'Cancele a reserva antes de excluir.' });
  }

  await reserva.deleteOne();
  res.json(reserva);
});

module.exports = router;
