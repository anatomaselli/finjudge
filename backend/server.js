require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// rota GET de teste
app.get('/', (req, res) => {
  res.send(' FinJudge backend está online!');
});

// rota POST para lead
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
  console.log(`FinJudge backend rodando na porta ${PORT}`);
});
