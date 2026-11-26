# Gestão de Espaços — Projeto 02 (Desenvolvimento de Aplicações II)

Aplicação completa para gestão de espaços: **API REST** (Node + Express + Mongoose + Swagger) com banco **MongoDB Atlas** e **APP** em React/Next.js (Axios + JSX).

```
interdisciplinar_web/
├── api/   → API REST (parte 1 migrada de arquivos JSON para MongoDB)
└── app/   → APP React/Next.js (Login, Admin e os 5 cadastros)
```

## Como rodar

### 1. API (`api/`)

1. Crie o arquivo `api/.env` com a string de conexão do Atlas (o arquivo **não** vai para o Git):
   ```
   MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxx.mongodb.net/
   ```
   O banco usado é `gestao_espacos` (pode trocar com `DB_NAME=` no `.env`).
2. Instale e importe os dados de exemplo (os JSON da parte 1 em `api/src/db/*.json`):
   ```
   cd api
   npm install
   npm run seed
   ```
   `npm run seed -- --force` apaga as 5 coleções e importa de novo.
3. Suba a API:
   ```
   npm run dev
   ```
   - API: http://localhost:8080/api
   - Swagger: http://localhost:8080/api-docs

### 2. APP (`app/`)

```
cd app
npm install
npm run dev
```

Abra http://localhost:3000 → página de Login. Usuários de exemplo do seed: e-mail de qualquer registro de `api/src/db/usuarios.json` com a senha `123456` (ex.: `luan@gmail.com`).

## Páginas do APP

| Página | Rota |
| --- | --- |
| Login | `/login` |
| Admin (menu dos cadastros) | `/admin` |
| Cadastro de Empresas | `/admin/empresas` |
| Cadastro de Espaços | `/admin/espacos` |
| Cadastro de Disponibilidades | `/admin/disponibilidades` |
| Cadastro de Reservas | `/admin/reservas` |
| Cadastro de Usuários | `/admin/usuarios` |

Cada cadastro segue a estrutura vista em aula: `index.js` (listagem), `create.js`, `read/[pid].js`, `update/[pid].js` e `delete/[pid].js`.
As páginas do Admin exigem login; sem sessão, voltam para `/login`.

## Rotas da API

Todas com prefixo `/api` e documentadas no Swagger.

| Entidade | Rotas |
| --- | --- |
| Login | `POST /login` |
| Usuários | `GET /usuarios`, `GET /usuarios/:id`, `GET /usuarios/nome/:nome`, `GET /usuarios/data/:data`, `POST`, `PUT /:id`, `DELETE /:id` |
| Empresas | `GET /empresas`, `GET /:id`, `GET /nome/:nome`, `GET /data/:data`, `GET /cnpj/:cnpj`, `POST`, `PUT /:id`, `DELETE /:id` |
| Espaços | `GET /espacos`, `GET /:id`, `GET /nome/:nome`, `POST`, `PUT /:id`, `DELETE /:id` |
| Disponibilidades | `GET /disponibilidades`, `GET /:id`, `GET /espaco/:espacoId`, `GET /dia/:diaSemana`, `POST`, `PUT /:id`, `DELETE /:id` |
| Reservas | `GET /reservas`, `GET /:id`, `GET /data/:data`, `GET /espaco/:espacoId`, `GET /usuario/:usuarioId`, `POST`, `PUT /:id`, `PUT /:id/cancelar`, `DELETE /:id` |

## Regras de negócio

A API valida tudo; o APP só mostra a mensagem que a API devolve.

**Exclusões (integridade)**
- **Usuário** com reservas (mesmo canceladas) não pode ser excluído. O usuário logado não pode excluir a si mesmo.
- **Empresa** vinculada a reservas não pode ser excluída.
- **Espaço** com disponibilidades ou reservas não pode ser excluído (pode ser marcado como inativo).
- **Disponibilidade** não pode ser excluída nem alterada se reservas confirmadas futuras ficarem sem horário.
- **Reserva**: primeiro **cancela**, depois **exclui**. Reserva confirmada não pode ser excluída.

**Reservas**
- Espaço ativo; usuário e empresa (se informada) existentes.
- Data/horário ainda não passados; início antes do fim.
- Precisa caber em uma disponibilidade do espaço naquele dia da semana.
- Reserva sem empresa é **externa**: só é aceita onde a disponibilidade permite.
- Sem conflito de horário com outra reserva confirmada do mesmo espaço.
- Reserva que já começou só pode ser cancelada. Reconfirmar uma cancelada passa por todas as regras de novo.

**Outros**
- E-mail de usuário e CNPJ de empresa são únicos. CNPJ com 14 números.
- Espaço não pode ser inativado com reservas confirmadas a partir de hoje.
- Disponibilidades do mesmo espaço e dia não podem se sobrepor.
- Senhas salvas com hash (bcrypt) e nunca devolvidas pela API.

## Tecnologias

- **Front-end:** React, Next.js (Pages Router), Axios, JSX
- **Back-end:** Node, Express, Express.Router, REST, Cors, Mongoose, Swagger
- **Banco de dados:** MongoDB (Atlas)
- **Visual:** design system com tema escuro (tokens de cor, tipografia Hanken Grotesk e ícones Material Symbols)
