
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.send('FinJudge backend OK'));

app.post('/api/lead', async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    await pool.query(
      'insert into public.leads (nome, telefone) values ($1,$2)',
      [nome || null, String(telefone || '')]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('DB ERROR lead:', err.code, err.message);
    res.status(500).json({ erro: 'Erro ao salvar lead no banco de dados' });
  }
});

app.post('/api/gasto', async (req, res) => {
  try {
    const { telefone, valor, categoria } = req.body;
    await pool.query(
      'insert into public.gastos (telefone, valor, categoria, data) values ($1,$2,$3, now())',
      [String(telefone || ''), Number(valor), String(categoria || '')]
    );
    res.json({ ok: true });
  } catch (err) {
    // fallback automático pra "descricao" se a coluna "categoria" não existir
    if (err && err.code === '42703') {
      try {
        const { telefone, valor, categoria } = req.body;
        await pool.query(
          'insert into public.gastos (telefone, valor, descricao, data) values ($1,$2,$3, now())',
          [String(telefone || ''), Number(valor), String(categoria || '')]
        );
        return res.json({ ok: true, via: 'descricao' });
      } catch (err2) {
        console.error('DB ERROR gasto/descricao:', err2.code, err2.message);
      }
    } else {
      console.error('DB ERROR gasto:', err.code, err.message);
    }
    res.status(500).json({ erro: 'Erro ao salvar gasto no banco de dados' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log('FinJudge backend na porta', port));
