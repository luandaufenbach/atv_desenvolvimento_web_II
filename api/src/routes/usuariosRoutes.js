const express = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario');
const Reserva = require('../models/Reserva');
const { idValido, escaparRegex, hoje } = require('../utils/validacoes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Cadastro de usuários
 *
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2b9a1e4b0012ab34cd
 *         nome:
 *           type: string
 *           example: Ana Souza
 *         email:
 *           type: string
 *           example: ana@email.com
 *         telefone:
 *           type: string
 *           example: "48999990000"
 *         dataCadastro:
 *           type: string
 *           format: date
 *           example: "2026-09-20"
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         nome:
 *           type: string
 *           example: Ana Souza
 *         email:
 *           type: string
 *           example: ana@email.com
 *         senha:
 *           type: string
 *           example: "123456"
 *         telefone:
 *           type: string
 *           example: "48999990000"
 *     Erro:
 *       type: object
 *       properties:
 *         mensagem:
 *           type: string
 *           example: Usuário não encontrado
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários ordenada por nome
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/', async (req, res) => {
  const usuarios = await Usuario.find().sort({ nome: 1 });
  res.json(usuarios);
});

/**
 * @swagger
 * /usuarios/nome/{nome}:
 *   get:
 *     summary: Busca usuários pelo nome (parcial, sem diferenciar maiúsculas)
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         example: ana
 *     responses:
 *       200:
 *         description: Usuários encontrados (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/nome/:nome', async (req, res) => {
  const usuarios = await Usuario.find({
    nome: { $regex: escaparRegex(req.params.nome), $options: 'i' },
  }).sort({ nome: 1 });

  res.json(usuarios);
});

/**
 * @swagger
 * /usuarios/data/{data}:
 *   get:
 *     summary: Busca usuários pela data de cadastro
 *     tags: [Usuários]
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
 *         description: Usuários cadastrados na data (pode ser uma lista vazia)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/data/:data', async (req, res) => {
  const usuarios = await Usuario.find({ dataCadastro: req.params.data }).sort({ nome: 1 });
  res.json(usuarios);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário pelo id
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
  const usuario = idValido(req.params.id) ? await Usuario.findById(req.params.id) : null;

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  res.json(usuario);
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastra um novo usuário (a senha é salva com hash)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { nome, email, senha, telefone } = req.body || {};

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios' });
  }

  if (String(senha).length < 6) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
  }

  if (await Usuario.exists({ email: String(email).toLowerCase().trim() })) {
    return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senha: await bcrypt.hash(String(senha), 10),
    telefone: telefone || '',
    dataCadastro: hoje(),
  });

  res.status(201).json(usuario);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário (envie só os campos que quer alterar; senha vazia mantém a atual)
 *     tags: [Usuários]
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
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Campos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail já cadastrado para outro usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
  const usuario = idValido(req.params.id) ? await Usuario.findById(req.params.id) : null;

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  const { nome, email, senha, telefone } = req.body || {};

  if (nome !== undefined && !String(nome).trim()) {
    return res.status(400).json({ mensagem: 'Nome não pode ficar vazio' });
  }

  if (email !== undefined) {
    if (!String(email).trim()) {
      return res.status(400).json({ mensagem: 'E-mail não pode ficar vazio' });
    }
    const emailNormalizado = String(email).toLowerCase().trim();
    if (await Usuario.exists({ email: emailNormalizado, _id: { $ne: usuario._id } })) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado para outro usuário' });
    }
    usuario.email = emailNormalizado;
  }

  if (nome !== undefined) usuario.nome = nome;
  if (telefone !== undefined) usuario.telefone = telefone;

  // senha só muda se vier preenchida
  if (senha) {
    if (String(senha).length < 6) {
      return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
    }
    usuario.senha = await bcrypt.hash(String(senha), 10);
  }

  await usuario.save();
  res.json(usuario);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     description: |
 *       Regras: não é possível excluir um usuário que possui reservas (mesmo canceladas) nem o próprio usuário logado (header x-usuario-id).
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-usuario-id
 *         required: false
 *         description: Id do usuário logado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Usuário possui reservas ou é o usuário logado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
  const usuario = idValido(req.params.id) ? await Usuario.findById(req.params.id) : null;

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  }

  if (req.get('x-usuario-id') === String(usuario._id)) {
    return res.status(409).json({ mensagem: 'Você não pode excluir o seu próprio usuário' });
  }

  const totalReservas = await Reserva.countDocuments({ usuarioId: usuario._id });
  if (totalReservas > 0) {
    return res.status(409).json({
      mensagem: "Este usuário tem reservas e não pode ser excluído.",
    });
  }

  await usuario.deleteOne();
  res.json(usuario);
});

module.exports = router;
