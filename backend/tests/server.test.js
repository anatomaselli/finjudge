beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// tests/server.test.js
const request = require('supertest');

// Mock do módulo de banco de dados
jest.mock('../db', () => ({
  query: jest.fn(),
}));

const app = require('../server');
const pool = require('../db');

describe('API FinJudge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- HEALTHCHECK ----------
  it('GET / deve retornar 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('FinJudge backend OK');
  });

  // ---------- /api/lead/check ----------
  describe('POST /api/lead/check', () => {
    it('deve retornar exists: true quando o telefone já existir', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .post('/api/lead/check')
        .send({ telefone: '11999999999' });

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM public.leads WHERE telefone = $1 LIMIT 1',
        ['11999999999']
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ exists: true });
    });

    it('deve retornar exists: false quando o telefone não existir', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .post('/api/lead/check')
        .send({ telefone: '11988888888' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ exists: false });
    });

    it('deve retornar 500 em erro de banco', async () => {
      pool.query.mockRejectedValueOnce(new Error('falha banco'));

      const res = await request(app)
        .post('/api/lead/check')
        .send({ telefone: '11977777777' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        'erro',
        'Erro ao verificar lead no banco de dados'
      );
    });
  });

  // ---------- /api/lead ----------
  describe('POST /api/lead', () => {
    it('deve criar lead e retornar ok: true', async () => {
      pool.query.mockResolvedValueOnce({}); // insert bem-sucedido

      const body = { nome: 'Ana', telefone: '11999999999' };

      const res = await request(app).post('/api/lead').send(body);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO public.leads (nome, telefone) VALUES ($1, $2)',
        [body.nome, body.telefone]
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('deve retornar 500 em erro de banco', async () => {
      const err = new Error('falha insert');
      pool.query.mockRejectedValueOnce(err);

      const res = await request(app)
        .post('/api/lead')
        .send({ nome: 'Erro', telefone: '000' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        'erro',
        'Erro ao salvar lead no banco de dados'
      );
    });
  });

  // ---------- /api/gasto ----------
  describe('POST /api/gasto', () => {
    it('deve registrar gasto com categoria e retornar ok: true', async () => {
      pool.query.mockResolvedValueOnce({}); // insert categoria ok

      const body = {
        telefone: '11999999999',
        valor: 50.5,
        categoria: 'alimentacao',
      };

      const res = await request(app).post('/api/gasto').send(body);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO public.gastos (telefone, valor, categoria, data) VALUES ($1, $2, $3, now())',
        [String(body.telefone), Number(body.valor), String(body.categoria)]
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('deve usar fallback para descricao quando coluna categoria não existir (erro 42703)', async () => {
      const err = new Error('coluna categoria não existe');
      err.code = '42703';

      pool.query
        .mockRejectedValueOnce(err) // primeira tentativa com categoria falha
        .mockResolvedValueOnce({}); // segunda tentativa com descricao ok

      const body = {
        telefone: '11999999999',
        valor: 10,
        categoria: 'mercado',
      };

      const res = await request(app).post('/api/gasto').send(body);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        'INSERT INTO public.gastos (telefone, valor, categoria, data) VALUES ($1, $2, $3, now())',
        [String(body.telefone), Number(body.valor), String(body.categoria)]
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO public.gastos (telefone, valor, descricao, data) VALUES ($1, $2, $3, now())',
        [String(body.telefone), Number(body.valor), String(body.categoria)]
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, via: 'descricao' });
    });

    it('deve retornar 500 em erro genérico de banco', async () => {
      const err = new Error('erro qualquer');
      err.code = '99999'; // diferente de 42703
      pool.query.mockRejectedValueOnce(err);

      const res = await request(app)
        .post('/api/gasto')
        .send({ telefone: '1', valor: 1, categoria: 'x' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        'erro',
        'Erro ao salvar gasto no banco de dados'
      );
    });
  });

  // ---------- /api/start-whatsapp ----------
  describe('GET /api/start-whatsapp', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      process.env = { ...OLD_ENV }; // clona env
    });

    afterAll(() => {
      process.env = OLD_ENV; // restaura env original
    });

    it('deve redirecionar para wa.me com o telefone do bot', async () => {
      process.env.WHATSAPP_BOT_PHONE = '5511999999999';

      const res = await request(app)
        .get('/api/start-whatsapp')
        .query({ text: 'Teste FinJudge' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('https://wa.me/5511999999999');
      expect(res.headers.location).toContain(
        encodeURIComponent('Teste FinJudge')
      );
    });

    it('deve retornar 500 se WHATSAPP_BOT_PHONE não estiver configurado', async () => {
      delete process.env.WHATSAPP_BOT_PHONE;

      const res = await request(app).get('/api/start-whatsapp');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        'erro',
        'Telefone do bot não configurado no servidor'
      );
    });
  });
});
