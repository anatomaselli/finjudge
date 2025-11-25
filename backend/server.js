const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/', (_, res) => res.send('FinJudge backend OK'));

/**
 * Rota para verificar se o lead já existe
 * POST /api/lead/check
 * body: { telefone }
 */
app.post('/api/lead/check', async (req, res) => {
  try {
    const { telefone } = req.body;

    const result = await pool.query(
      'SELECT 1 FROM public.leads WHERE telefone = $1 LIMIT 1',
      [String(telefone || '')]
    );

    res.json({ exists: result.rowCount > 0 });
  } catch (err) {
    console.error('DB ERROR lead/check:', err.code, err.message);
    res.status(500).json({ erro: 'Erro ao verificar lead no banco de dados' });
  }
});

/**
 * Rota para criar lead
 * POST /api/lead
 */
app.post('/api/lead', async (req, res) => {
  try {
    const { nome, telefone } = req.body;

    await pool.query(
      'INSERT INTO public.leads (nome, telefone) VALUES ($1, $2)',
      [nome || null, String(telefone || '')]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('DB ERROR lead:', err.code, err.message);
    res.status(500).json({ erro: 'Erro ao salvar lead no banco de dados' });
  }
});

/**
 * Rota para registrar gasto
 * POST /api/gasto
 */
app.post('/api/gasto', async (req, res) => {
  try {
    const { telefone, valor, categoria } = req.body;

    await pool.query(
      'INSERT INTO public.gastos (telefone, valor, categoria, data) VALUES ($1, $2, $3, now())',
      [String(telefone || ''), Number(valor), String(categoria || '')]
    );

    res.json({ ok: true });
  } catch (err) {
    // fallback automático pra "descricao" se a coluna "categoria" não existir
    if (err && err.code === '42703') {
      try {
        const { telefone, valor, categoria } = req.body;

        await pool.query(
          'INSERT INTO public.gastos (telefone, valor, descricao, data) VALUES ($1, $2, $3, now())',
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

/**
 * Rota que redireciona para o WhatsApp do bot sem expor o número no frontend
 * GET /api/start-whatsapp?text=...
 */
app.get('/api/start-whatsapp', (req, res) => {
  const phone = process.env.WHATSAPP_BOT_PHONE;

  if (!phone) {
    console.error('WHATSAPP_BOT_PHONE não configurado no .env');
    return res
      .status(500)
      .json({ erro: 'Telefone do bot não configurado no servidor' });
  }

  const text =
    req.query.text || 'Quero começar a usar o FinJudge!';
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  return res.redirect(302, waUrl);
});

// exporta o app para os testes
module.exports = app;

// só sobe o servidor quando NÃO estiver em ambiente de teste
const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log('FinJudge backend na porta', port));
}
