const express = require('express');

const Espaco = require('../models/Espaco');
const Disponibilidade = require('../models/Disponibilidade');
const Reserva = require('../models/Reserva');
const { idValido, escaparRegex, hoje } = require('../utils/validacoes');

const router = express.Router();

// Converte capacidade para inteiro positivo (ou NaN se inválida)
function lerCapacidade(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : NaN;
}

/**
 * @swagger
 * tags:
 *   name: Espaços
 *   description: Cadastro de espaços
 *
 * components:
 *   schemas:
 *     Espaco:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34cd
 *         nome:
 *           type: string
 *           example: Sala de Coworking 01
 *         tipo:
 *           type: string
 *           enum: [COWORKING, LAB, MEETING_ROOM]
 *           example: COWORKING
 *         capacidade:
 *           type: integer
 *           example: 10
 *         descricao:
 *           type: string
 *           example: Sala compartilhada com mesas individuais e internet rápida.
 *         ativo:
 *           type: boolean
 *           example: true
 *     EspacoInput:
 *       type: object
 *       required:
 *         - nome
 *         - tipo
 *         - capacidade
 *       properties:
 *         nome:
 *           type: string
 *           example: Sala de Coworking 01
 *         tipo:
 *           type: string
 *           enum: [COWORKING, LAB, MEETING_ROOM]
 *           example: COWORKING
 *         capacidade:
 *           type: integer
 *           example: 10
 *         descricao:
 *           type: string
 *           example: Sala compartilhada com mesas individuais e internet rápida.
 *         ativo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /espacos:
 *   get:
 *     summary: Lista todos os espaços
 *     tags: [Espaços]
 *     responses:
 *       200:
 *         description: Lista de espaços ordenada por nome
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Espaco'
 */
router.get('/', async (req, res) => {
  res.json(await Espaco.find().sort({ nome: 1 }));
});

/**
 * @swagger
 * /espacos/nome/{nome}:
 *   get:
 *     summary: Busca espaços pelo nome (parcial, sem diferenciar maiúsculas)
 *     tags: [Espaços]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         example: sala
 *     responses:
 *       200:
 *         description: Espaços encontrados (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Espaco'
 */
router.get('/nome/:nome', async (req, res) => {
  const espacos = await Espaco.find({
    nome: { $regex: escaparRegex(req.params.nome), $options: 'i' },
  }).sort({ nome: 1 });

  res.json(espacos);
});

/**
 * @swagger
 * /espacos/{id}:
 *   get:
 *     summary: Busca um espaço pelo id
 *     tags: [Espaços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espaço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Espaco'
 *       404:
 *         description: Espaço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
  const espaco = idValido(req.params.id) ? await Espaco.findById(req.params.id) : null;

  if (!espaco) {
    return res.status(404).json({ mensagem: 'Espaço não encontrado' });
  }

  res.json(espaco);
});

/**
 * @swagger
 * /espacos:
 *   post:
 *     summary: Cadastra um novo espaço
 *     tags: [Espaços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspacoInput'
 *     responses:
 *       201:
 *         description: Espaço criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Espaco'
 *       400:
 *         description: Campos obrigatórios faltando, tipo ou capacidade inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { nome, tipo, capacidade, descricao, ativo } = req.body || {};

  if (!nome || !tipo || capacidade === undefined || capacidade === '') {
    return res.status(400).json({ mensagem: 'Nome, tipo e capacidade são obrigatórios' });
  }

  if (!Espaco.TIPOS.includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido. Use COWORKING, LAB ou MEETING_ROOM' });
  }

  const cap = lerCapacidade(capacidade);
  if (isNaN(cap)) {
    return res.status(400).json({ mensagem: 'Capacidade deve ser um número inteiro maior que zero' });
  }

  const espaco = await Espaco.create({
    nome,
    tipo,
    capacidade: cap,
    descricao: descricao || '',
    ativo: ativo === undefined ? true : Boolean(ativo),
  });

  res.status(201).json(espaco);
});

/**
 * @swagger
 * /espacos/{id}:
 *   put:
 *     summary: Atualiza um espaço (envie só os campos que quer alterar)
 *     description: Regra: não é possível inativar um espaço com reservas confirmadas a partir de hoje.
 *     tags: [Espaços]
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
 *             $ref: '#/components/schemas/EspacoInput'
 *     responses:
 *       200:
 *         description: Espaço atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Espaco'
 *       400:
 *         description: Tipo ou capacidade inválidos
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
 *         description: Espaço possui reservas confirmadas futuras e não pode ser inativado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
  const espaco = idValido(req.params.id) ? await Espaco.findById(req.params.id) : null;

  if (!espaco) {
    return res.status(404).json({ mensagem: 'Espaço não encontrado' });
  }

  const { nome, tipo, capacidade, descricao, ativo } = req.body || {};

  if (nome !== undefined && !String(nome).trim()) {
    return res.status(400).json({ mensagem: 'Nome não pode ficar vazio' });
  }

  if (tipo !== undefined && !Espaco.TIPOS.includes(tipo)) {
    return res.status(400).json({ mensagem: 'Tipo inválido. Use COWORKING, LAB ou MEETING_ROOM' });
  }

  if (capacidade !== undefined) {
    const cap = lerCapacidade(capacidade);
    if (isNaN(cap)) {
      return res.status(400).json({ mensagem: 'Capacidade deve ser um número inteiro maior que zero' });
    }
    espaco.capacidade = cap;
  }

  // Inativar só se não houver reservas confirmadas de hoje em diante
  if (ativo !== undefined && !ativo && espaco.ativo) {
    const futuras = await Reserva.countDocuments({
      espacoId: espaco._id,
      status: 'CONFIRMADA',
      data: { $gte: hoje() },
    });
    if (futuras > 0) {
      return res.status(409).json({
        mensagem: "Este espaço tem reservas futuras. Cancele as reservas antes de inativar.",
      });
    }
  }

  if (nome !== undefined) espaco.nome = nome;
  if (tipo !== undefined) espaco.tipo = tipo;
  if (descricao !== undefined) espaco.descricao = descricao;
  if (ativo !== undefined) espaco.ativo = Boolean(ativo);

  await espaco.save();
  res.json(espaco);
});

/**
 * @swagger
 * /espacos/{id}:
 *   delete:
 *     summary: Remove um espaço
 *     description: Regra: não é possível excluir um espaço que tenha disponibilidades ou reservas.
 *     tags: [Espaços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espaço removido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Espaco'
 *       404:
 *         description: Espaço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Espaço possui disponibilidades ou reservas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
  const espaco = idValido(req.params.id) ? await Espaco.findById(req.params.id) : null;

  if (!espaco) {
    return res.status(404).json({ mensagem: 'Espaço não encontrado' });
  }

  const totalReservas = await Reserva.countDocuments({ espacoId: espaco._id });
  if (totalReservas > 0) {
    return res.status(409).json({
      mensagem: "Este espaço tem reservas e não pode ser excluído.",
    });
  }

  const totalDisponibilidades = await Disponibilidade.countDocuments({ espacoId: espaco._id });
  if (totalDisponibilidades > 0) {
    return res.status(409).json({
      mensagem: "Este espaço tem disponibilidades cadastradas. Exclua as disponibilidades antes.",
    });
  }

  await espaco.deleteOne();
  res.json(espaco);
});

module.exports = router;
