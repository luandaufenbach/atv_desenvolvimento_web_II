const express = require('express');

const Empresa = require('../models/Empresa');
const Reserva = require('../models/Reserva');
const { idValido, escaparRegex, hoje } = require('../utils/validacoes');

const router = express.Router();

// Deixa só os números do CNPJ (aceita "12.345.678/0001-90")
function limparCnpj(cnpj) {
  return String(cnpj || '').replace(/\D/g, '');
}

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: Cadastro de empresas
 *
 * components:
 *   schemas:
 *     Empresa:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34cd
 *         nome:
 *           type: string
 *           example: Tech Sul Ltda
 *         cnpj:
 *           type: string
 *           example: "12345678000190"
 *         email:
 *           type: string
 *           example: contato@techsul.com
 *         telefone:
 *           type: string
 *           example: "4834310000"
 *         endereco:
 *           type: string
 *           example: Rua das Flores, 100 - Centro, Criciúma/SC
 *         dataCadastro:
 *           type: string
 *           format: date
 *           example: "2026-09-20"
 *     EmpresaInput:
 *       type: object
 *       required:
 *         - nome
 *         - cnpj
 *       properties:
 *         nome:
 *           type: string
 *           example: Tech Sul Ltda
 *         cnpj:
 *           type: string
 *           description: 14 números (pontuação é ignorada)
 *           example: "12345678000190"
 *         email:
 *           type: string
 *           example: contato@techsul.com
 *         telefone:
 *           type: string
 *           example: "4834310000"
 *         endereco:
 *           type: string
 *           example: Rua das Flores, 100 - Centro, Criciúma/SC
 */

/**
 * @swagger
 * /empresas:
 *   get:
 *     summary: Lista todas as empresas
 *     tags: [Empresas]
 *     responses:
 *       200:
 *         description: Lista de empresas ordenada por nome
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 */
router.get('/', async (req, res) => {
  res.json(await Empresa.find().sort({ nome: 1 }));
});

/**
 * @swagger
 * /empresas/nome/{nome}:
 *   get:
 *     summary: Busca empresas pelo nome (parcial, sem diferenciar maiúsculas)
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         example: tech
 *     responses:
 *       200:
 *         description: Empresas encontradas (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 */
router.get('/nome/:nome', async (req, res) => {
  const empresas = await Empresa.find({
    nome: { $regex: escaparRegex(req.params.nome), $options: 'i' },
  }).sort({ nome: 1 });

  res.json(empresas);
});

/**
 * @swagger
 * /empresas/data/{data}:
 *   get:
 *     summary: Busca empresas pela data de cadastro
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: data
 *         required: true
 *         description: Data no formato AAAA-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-09-20"
 *     responses:
 *       200:
 *         description: Empresas cadastradas na data (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 */
router.get('/data/:data', async (req, res) => {
  res.json(await Empresa.find({ dataCadastro: req.params.data }).sort({ nome: 1 }));
});

/**
 * @swagger
 * /empresas/cnpj/{cnpj}:
 *   get:
 *     summary: Busca uma empresa pelo CNPJ
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: cnpj
 *         required: true
 *         schema:
 *           type: string
 *         example: "12345678000190"
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/cnpj/:cnpj', async (req, res) => {
  const empresa = await Empresa.findOne({ cnpj: limparCnpj(req.params.cnpj) });

  if (!empresa) {
    return res.status(404).json({ mensagem: 'Empresa não encontrada' });
  }

  res.json(empresa);
});

/**
 * @swagger
 * /empresas/{id}:
 *   get:
 *     summary: Busca uma empresa pelo id
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
  const empresa = idValido(req.params.id) ? await Empresa.findById(req.params.id) : null;

  if (!empresa) {
    return res.status(404).json({ mensagem: 'Empresa não encontrada' });
  }

  res.json(empresa);
});

/**
 * @swagger
 * /empresas:
 *   post:
 *     summary: Cadastra uma nova empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaInput'
 *     responses:
 *       201:
 *         description: Empresa criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: Campos obrigatórios faltando ou CNPJ inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: CNPJ já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { nome, cnpj, email, telefone, endereco } = req.body || {};

  if (!nome || !cnpj) {
    return res.status(400).json({ mensagem: 'Nome e CNPJ são obrigatórios' });
  }

  const cnpjLimpo = limparCnpj(cnpj);
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ mensagem: 'CNPJ deve ter 14 números' });
  }

  if (await Empresa.exists({ cnpj: cnpjLimpo })) {
    return res.status(409).json({ mensagem: 'CNPJ já cadastrado' });
  }

  const empresa = await Empresa.create({
    nome,
    cnpj: cnpjLimpo,
    email: email || '',
    telefone: telefone || '',
    endereco: endereco || '',
    dataCadastro: hoje(),
  });

  res.status(201).json(empresa);
});

/**
 * @swagger
 * /empresas/{id}:
 *   put:
 *     summary: Atualiza uma empresa (envie só os campos que quer alterar)
 *     tags: [Empresas]
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
 *             $ref: '#/components/schemas/EmpresaInput'
 *     responses:
 *       200:
 *         description: Empresa atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: CNPJ inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: CNPJ já cadastrado para outra empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
  const empresa = idValido(req.params.id) ? await Empresa.findById(req.params.id) : null;

  if (!empresa) {
    return res.status(404).json({ mensagem: 'Empresa não encontrada' });
  }

  const { nome, cnpj, email, telefone, endereco } = req.body || {};

  if (nome !== undefined && !String(nome).trim()) {
    return res.status(400).json({ mensagem: 'Nome não pode ficar vazio' });
  }

  if (cnpj !== undefined) {
    const cnpjLimpo = limparCnpj(cnpj);
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ mensagem: 'CNPJ deve ter 14 números' });
    }
    if (await Empresa.exists({ cnpj: cnpjLimpo, _id: { $ne: empresa._id } })) {
      return res.status(409).json({ mensagem: 'CNPJ já cadastrado para outra empresa' });
    }
    empresa.cnpj = cnpjLimpo;
  }

  if (nome !== undefined) empresa.nome = nome;
  if (email !== undefined) empresa.email = email;
  if (telefone !== undefined) empresa.telefone = telefone;
  if (endereco !== undefined) empresa.endereco = endereco;

  await empresa.save();
  res.json(empresa);
});

/**
 * @swagger
 * /empresas/{id}:
 *   delete:
 *     summary: Remove uma empresa
 *     description: Regra — não é possível excluir uma empresa vinculada a reservas.
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa removida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Empresa vinculada a reservas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
  const empresa = idValido(req.params.id) ? await Empresa.findById(req.params.id) : null;

  if (!empresa) {
    return res.status(404).json({ mensagem: 'Empresa não encontrada' });
  }

  const totalReservas = await Reserva.countDocuments({ empresaId: empresa._id });
  if (totalReservas > 0) {
    return res.status(409).json({
      mensagem: `Não é possível excluir: a empresa está vinculada a ${totalReservas} reserva(s). Cancele e exclua as reservas antes.`,
    });
  }

  await empresa.deleteOne();
  res.json(empresa);
});

module.exports = router;
