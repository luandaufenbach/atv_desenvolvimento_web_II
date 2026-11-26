require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { conectar } = require('./db/db');
const routes = require('./routes/index');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestão de Espaços',
      version: '2.0.0',
      description: 'API REST com MongoDB (Mongoose) do projeto Gestão de Espaços',
    },
    servers: [{ url: `http://localhost:${PORT}/api` }],
  },
  apis: ['./src/routes/*.js'], // onde procurar os comentários @swagger
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Erros inesperados (o Express 5 já captura os erros das rotas async)
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ mensagem: 'Registro duplicado' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ mensagem: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição' });
  }
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno no servidor' });
});

conectar()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API em http://localhost:${PORT}/api`);
      console.log(`Swagger em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((erro) => {
    console.error('Falha ao conectar no MongoDB:', erro.message);
    process.exit(1);
  });
