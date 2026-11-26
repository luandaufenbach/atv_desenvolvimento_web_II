const express = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Login no painel administrativo
 *
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           example: luan@gmail.com
 *         senha:
 *           type: string
 *           example: "123456"
 *     LoginResposta:
 *       type: object
 *       properties:
 *         mensagem:
 *           type: string
 *           example: Login realizado com sucesso
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um usuário pelo e-mail e senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResposta'
 *       400:
 *         description: E-mail ou senha não informados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: E-mail ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha' });
  }

  // a senha não vem nas consultas por padrão (select: false), por isso o +senha
  const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select('+senha');

  // mesma mensagem para e-mail inexistente e senha errada (não revela qual dos dois falhou)
  if (!usuario || !(await bcrypt.compare(String(senha), usuario.senha))) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
  }

  res.json({ mensagem: 'Login realizado com sucesso', usuario });
});

module.exports = router;
