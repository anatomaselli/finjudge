const express = require('express');
const cors = require('cors');
const pool = require('./db'); // conexão com o banco
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('FinJudge backend está online!');
});

// ➕ Rota que o frontend está tentando acessar
app.post('/api/lead', async (req, res) => {
  const { nome, telefone } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO leads (nome, telefone) VALUES ($1, $2) RETURNING *',
      [nome, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    res.status(500).json({ erro: 'Erro ao salvar lead no banco de dados' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`FinJudge backend rodando na porta ${PORT}`);
});
