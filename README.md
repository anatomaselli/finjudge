
# FinJudge - Documentação de Deploy

## Estrutura do Projeto

```
finjudge/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
.gitignore
```

## Backend - Render

### 1. Configuração do Servidor

Arquivo `server.js`:

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FinJudge backend está online!');
});

app.post('/api/lead', async (req, res) => {
  const { nome, telefone } = req.body;

  try {
    await pool.query(
      'INSERT INTO leads (nome, telefone) VALUES ($1, $2)',
      [nome, telefone]
    );
    res.status(200).json({ status: 'sucesso' });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    res.status(500).json({ status: 'erro', erro: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`FinJudge backend rodando em http://localhost:${PORT}`);
});
```

### 2. Banco de Dados na Supabase

Variáveis de ambiente no `.env`:

```env
PGHOST=db.yqnuwewjbnxvnbkfhfpi.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=xxxxx
```

Arquivo `db.js`:

```js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
```

### 3. Ignorar `.env` no GitHub

Adicionado `.env` ao `.gitignore`:

```txt
.env
```

### 4. Deploy no Render

- Aplicação backend configurada como "Web Service".
- Código vinculado ao repositório GitHub.
- Build e deploy realizados com sucesso.
- App rodando em: https://finjudge-backend.onrender.com

Teste:
- Rota GET `/` responde com: `FinJudge backend está online!`

## Frontend - Netlify

### 1. Configuração da API

Arquivo `script.js`:

```js
const apiUrl = 'https://finjudge-backend.onrender.com/api/lead';
// usar apiUrl para envio do formulário
```

### 2. Deploy no Netlify

Configuração usada:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/`
- Functions directory: `frontend/netlify/functions` (não usado no momento)

Deploy iniciado em: https://wonderful-kelpie-4f2cb1.netlify.app

## Status Atual

| Etapa                            | Status        |
|----------------------------------|---------------|
| Backend (Render)                 | Online        |
| Banco de dados (Supabase)       | Conectado     |
| Variáveis de ambiente (.env)    | Configuradas  |
| Frontend (Netlify)              | Em deploy     |
| Integração frontend/backend     | Preparada     |
