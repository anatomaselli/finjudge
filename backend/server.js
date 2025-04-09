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

// Rota para cadastrar leads (formulário do site)
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

// Rota para verificar duplicidade de lead
app.post('/api/lead/check', async (req, res) => {
  const { telefone } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM leads WHERE telefone = $1',
      [telefone]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Erro ao verificar lead:', error);
    res.status(500).json({ erro: 'Erro ao verificar lead no banco de dados' });
  }
});

// Rota para registrar um gasto
app.post('/api/gasto', async (req, res) => {
  const { telefone, valor, categoria, data } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO gastos (telefone, valor, categoria, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [telefone, valor, categoria, data]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar gasto:', error);
    res.status(500).json({ erro: 'Erro ao salvar gasto no banco de dados' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FinJudge backend rodando na porta ${PORT}`);
});