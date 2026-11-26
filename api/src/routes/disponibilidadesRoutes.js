const express = require('express');

const Disponibilidade = require('../models/Disponibilidade');
const Espaco = require('../models/Espaco');
const Reserva = require('../models/Reserva');
const { idValido, horaValida, hoje, disponibilidadeQueCobre } = require('../utils/validacoes');

const router = express.Router();

/**
 * Valida os campos de uma disponibilidade e o conflito com outras do mesmo espaço/dia.
 * Retorna { status, mensagem } se houver erro, ou null se estiver tudo certo.
 */
async function validarDisponibilidade(d, idIgnorar = null) {
  if (!idValido(String(d.espacoId))) return { status: 404, mensagem: 'Espaço não encontrado' };

  const espaco = await Espaco.findById(d.espacoId);
  if (!espaco) return { status: 404, mensagem: 'Espaço não encontrado' };
  if (!espaco.ativo) {
    return { status: 400, mensagem: 'Não é possível cadastrar disponibilidade para um espaço inativo' };
  }

  if (!Number.isInteger(d.diaSemana) || d.diaSemana < 0 || d.diaSemana > 6) {
    return { status: 400, mensagem: 'diaSemana deve estar entre 0 (Domingo) e 6 (Sábado)' };
  }

  if (!horaValida(d.horaInicio) || !horaValida(d.horaFim)) {
    return { status: 400, mensagem: 'Horários devem estar no formato HH:MM' };
  }

  if (d.horaInicio >= d.horaFim) {
    return { status: 400, mensagem: 'horaInicio deve ser anterior a horaFim' };
  }

  // Não pode sobrepor outra disponibilidade do mesmo espaço no mesmo dia
  const conflito = await Disponibilidade.exists({
    _id: { $ne: idIgnorar },
    espacoId: d.espacoId,
    diaSemana: d.diaSemana,
    horaInicio: { $lt: d.horaFim },
    horaFim: { $gt: d.horaInicio },
  });

  if (conflito) {
    return { status: 409, mensagem: 'Já existe uma disponibilidade para este espaço neste dia e horário' };
  }

  return null;
}

/**
 * Conta as reservas confirmadas de hoje em diante do espaço que deixariam de caber
 * em alguma disponibilidade, considerando a lista de disponibilidades resultante.
 */
async function reservasSemCobertura(espacoId, disponibilidadesResultantes) {
  const reservas = await Reserva.find({
    espacoId,
    status: 'CONFIRMADA',
    data: { $gte: hoje() },
  });

  return reservas.filter((r) => !disponibilidadeQueCobre(r, disponibilidadesResultantes)).length;
}

/**
 * @swagger
 * tags:
 *   name: Disponibilidades
 *   description: Regras de disponibilidade semanal dos espaços
 *
 * components:
 *   schemas:
 *     Disponibilidade:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34cd
 *         espacoId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34aa
 *         diaSemana:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           example: 1
 *         horaInicio:
 *           type: string
 *           example: "08:00"
 *         horaFim:
 *           type: string
 *           example: "18:00"
 *         permiteExterno:
 *           type: boolean
 *           example: true
 *     DisponibilidadeInput:
 *       type: object
 *       required:
 *         - espacoId
 *         - diaSemana
 *         - horaInicio
 *         - horaFim
 *       properties:
 *         espacoId:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34aa
 *         diaSemana:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           example: 1
 *         horaInicio:
 *           type: string
 *           example: "08:00"
 *         horaFim:
 *           type: string
 *           example: "18:00"
 *         permiteExterno:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /disponibilidades:
 *   get:
 *     summary: Lista todas as disponibilidades
 *     tags: [Disponibilidades]
 *     responses:
 *       200:
 *         description: Lista de disponibilidades ordenada por dia e horário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disponibilidade'
 */
router.get('/', async (req, res) => {
  res.json(await Disponibilidade.find().sort({ diaSemana: 1, horaInicio: 1 }));
});

/**
 * @swagger
 * /disponibilidades/espaco/{espacoId}:
 *   get:
 *     summary: Lista as disponibilidades de um espaço
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: espacoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disponibilidades do espaço (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disponibilidade'
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

  res.json(await Disponibilidade.find({ espacoId }).sort({ diaSemana: 1, horaInicio: 1 }));
});

/**
 * @swagger
 * /disponibilidades/dia/{diaSemana}:
 *   get:
 *     summary: Lista as disponibilidades de um dia da semana
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: diaSemana
 *         required: true
 *         description: 0 = Domingo ... 6 = Sábado
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disponibilidades do dia (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disponibilidade'
 */
router.get('/dia/:diaSemana', async (req, res) => {
  const dia = Number(req.params.diaSemana);
  res.json(await Disponibilidade.find({ diaSemana: dia }).sort({ horaInicio: 1 }));
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   get:
 *     summary: Busca uma disponibilidade pelo id
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disponibilidade encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disponibilidade'
 *       404:
 *         description: Disponibilidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
  const disponibilidade = idValido(req.params.id) ? await Disponibilidade.findById(req.params.id) : null;

  if (!disponibilidade) {
    return res.status(404).json({ mensagem: 'Disponibilidade não encontrada' });
  }

  res.json(disponibilidade);
});

/**
 * @swagger
 * /disponibilidades:
 *   post:
 *     summary: Cadastra uma nova disponibilidade
 *     tags: [Disponibilidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisponibilidadeInput'
 *     responses:
 *       201:
 *         description: Disponibilidade criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disponibilidade'
 *       400:
 *         description: Campos inválidos ou espaço inativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Espaço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Conflito com outra disponibilidade do mesmo espaço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { espacoId, diaSemana, horaInicio, horaFim, permiteExterno } = req.body || {};

  if (!espacoId || diaSemana === undefined || diaSemana === '' || !horaInicio || !horaFim) {
    return res.status(400).json({ mensagem: 'espacoId, diaSemana, horaInicio e horaFim são obrigatórios' });
  }

  const nova = {
    espacoId: String(espacoId),
    diaSemana: Number(diaSemana),
    horaInicio,
    horaFim,
    permiteExterno: permiteExterno === undefined ? true : Boolean(permiteExterno),
  };

  const erro = await validarDisponibilidade(nova);
  if (erro) {
    return res.status(erro.status).json({ mensagem: erro.mensagem });
  }

  res.status(201).json(await Disponibilidade.create(nova));
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   put:
 *     summary: Atualiza uma disponibilidade (envie só os campos que quer alterar)
 *     description: Regra: a alteração não pode deixar reservas confirmadas futuras fora de uma disponibilidade.
 *     tags: [Disponibilidades]
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
 *             $ref: '#/components/schemas/DisponibilidadeInput'
 *     responses:
 *       200:
 *         description: Disponibilidade atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disponibilidade'
 *       400:
 *         description: Campos inválidos ou espaço inativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Disponibilidade ou espaço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Conflito com outra disponibilidade ou reservas ficariam sem cobertura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
  const disponibilidade = idValido(req.params.id) ? await Disponibilidade.findById(req.params.id) : null;

  if (!disponibilidade) {
    return res.status(404).json({ mensagem: 'Disponibilidade não encontrada' });
  }

  const { espacoId, diaSemana, horaInicio, horaFim, permiteExterno } = req.body || {};

  const atualizada = {
    espacoId: espacoId !== undefined ? String(espacoId) : String(disponibilidade.espacoId),
    diaSemana: diaSemana !== undefined && diaSemana !== '' ? Number(diaSemana) : disponibilidade.diaSemana,
    horaInicio: horaInicio !== undefined ? horaInicio : disponibilidade.horaInicio,
    horaFim: horaFim !== undefined ? horaFim : disponibilidade.horaFim,
    permiteExterno: permiteExterno !== undefined ? Boolean(permiteExterno) : disponibilidade.permiteExterno,
  };

  const erro = await validarDisponibilidade(atualizada, disponibilidade._id);
  if (erro) {
    return res.status(erro.status).json({ mensagem: erro.mensagem });
  }

  // Reservas do espaço antigo precisam continuar cobertas pelas disponibilidades que sobram
  const espacoAntigo = String(disponibilidade.espacoId);
  const outras = await Disponibilidade.find({ espacoId: espacoAntigo, _id: { $ne: disponibilidade._id } });
  const resultantes = atualizada.espacoId === espacoAntigo ? [...outras, atualizada] : outras;
  const descobertas = await reservasSemCobertura(espacoAntigo, resultantes);

  if (descobertas > 0) {
    return res.status(409).json({
      mensagem: "Existem reservas futuras nesse horário. Cancele essas reservas antes de alterar.",
    });
  }

  disponibilidade.set(atualizada);
  await disponibilidade.save();
  res.json(disponibilidade);
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   delete:
 *     summary: Remove uma disponibilidade
 *     description: Regra: não é possível excluir se reservas confirmadas futuras dependerem dela.
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disponibilidade removida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disponibilidade'
 *       404:
 *         description: Disponibilidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Reservas confirmadas futuras dependem desta disponibilidade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
  const disponibilidade = idValido(req.params.id) ? await Disponibilidade.findById(req.params.id) : null;

  if (!disponibilidade) {
    return res.status(404).json({ mensagem: 'Disponibilidade não encontrada' });
  }

  const outras = await Disponibilidade.find({
    espacoId: disponibilidade.espacoId,
    _id: { $ne: disponibilidade._id },
  });
  const descobertas = await reservasSemCobertura(disponibilidade.espacoId, outras);

  if (descobertas > 0) {
    return res.status(409).json({
      mensagem: "Existem reservas futuras nesse horário. Cancele essas reservas antes de excluir.",
    });
  }

  await disponibilidade.deleteOne();
  res.json(disponibilidade);
});

module.exports = router;
