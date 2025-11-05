// wpp.js — whatsapp-web.js + PG (salva gastos + relatório)
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pool = require('./db');
require('dotenv').config();

const WELCOME =
  '👋 Bem-vindo ao FinJudge! Envie suas despesas no formato:\n\n' +
  '💬 "gastei 15,90 no mercado"\n' +
  '💬 "8,50 ifood"\n' +
  '💬 "gastei 22 com gasolina"\n\n' +
  '📊 Peça também: "relatório" ou "relatório até 20".';

const norm = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const digits = (s='') => String(s).replace(/\D/g,'');
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const pad2 = (n) => String(n).padStart(2, '0');

function getMonthRange(diaLimite) {
  const now = new Date();
  const ano = now.getFullYear();
  const mes0 = now.getMonth();
  const start = new Date(ano, mes0, 1, 0, 0, 0, 0);
  let endDay = now.getDate();
  if (diaLimite && Number(diaLimite) >= 1 && Number(diaLimite) <= 31) {
    endDay = Math.min(Number(diaLimite), 31);
  }
  const end = new Date(ano, mes0, endDay + 1, 0, 0, 0, 0);
  return { start, end, ano, mes: mes0 + 1, endDay };
}

async function buildReport(telefone, diaLimite) {
  const { start, end, ano, mes, endDay } = getMonthRange(diaLimite);
  const sql = `
    SELECT COALESCE(categoria, descricao) AS categoria, valor, data
    FROM public.gastos
    WHERE telefone = $1 AND data >= $2 AND data < $3
    ORDER BY data ASC
  `;
  const { rows } = await pool.query(sql, [telefone, start.toISOString(), end.toISOString()]);

  if (!rows.length)
    return `📊 Relatório 01/${pad2(mes)}/${ano}–${pad2(endDay)}/${pad2(mes)}/${ano}\nNenhum gasto no período.`;

  let total = 0;
  const linhas = rows.map(r => {
    total += Number(r.valor || 0);
    const d = new Date(r.data);
    return `• ${pad2(d.getDate())}/${pad2(d.getMonth()+1)}: ${(r.categoria || 'gasto')} — ${brl(r.valor)}`;
  });

  const MAX = 40;
  const corpo = linhas.length > MAX ? linhas.slice(0, MAX).join('\n') + `\n…(+${linhas.length - MAX} itens)` : linhas.join('\n');
  return `📊 Relatório 01/${pad2(mes)}/${ano}–${pad2(endDay)}/${pad2(mes)}/${ano}\n${corpo}\n\n🧮 Total: ${brl(total)}`;
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'finjudge' }),
  puppeteer: { headless: false, args: ['--no-sandbox','--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => { console.log('Escaneie o QR:'); qrcode.generate(qr, { small: true }); });
client.on('ready', () => console.log('Bot pronto!'));

client.on('message', async (msg) => {
  try {
    const raw = (msg.body || '').trim();
    const texto = norm(raw);
    const telefone = digits(msg.from);

    console.log('RX ->', { from: msg.from, body: raw });
    await msg.reply('Recebi: ' + raw);

    if (/(quero comecar|quero começar|finjudge|oi|ola|olá)/i.test(texto)) {
      await msg.reply(WELCOME);
      return;
    }

    // Relatório: "relatório", "relatório 20", "relatório até 20"
    const mRel = texto.match(/relat[oó]rio(?:\s+at[eé]\s+(\d{1,2})|\s+(\d{1,2}))?/i);
    if (mRel) {
      const dia = mRel[1] || mRel[2] || null;
      const out = await buildReport(telefone, dia);
      await msg.reply(out);
      return;
    }

    // Despesa: "gastei 15,90 no mercado" | "8,50 ifood"
    const m = texto.match(/(?:gastei\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:no|na|em|com)?\s*(.+)?/);
    if (m) {
      const valor = Number(m[1].replace(/\./g,'').replace(',', '.'));
      const categoria = (m[2] || '').trim();
      if (!isNaN(valor) && categoria) {
        try {
          await pool.query(
            'insert into public.gastos (telefone, valor, categoria, data) values ($1,$2,$3, now())',
            [telefone, valor, categoria]
          );
        } catch (e1) {
          if (e1 && e1.code === '42703') {
            await pool.query(
              'insert into public.gastos (telefone, valor, descricao, data) values ($1,$2,$3, now())',
              [telefone, valor, categoria]
            );
          } else {
            console.error('INSERT gasto falhou:', e1.code, e1.message);
            await msg.reply('Não consegui salvar no banco agora.');
            return;
          }
        }
        await msg.reply(`✅ Anotado: ${brl(valor)} em "${categoria}".\nPeça "relatório" para ver o acumulado do mês.`);
        return;
      }
    }

    await msg.reply(WELCOME);
  } catch (e) {
    console.error('on message error:', e);
    try { await msg.reply('⚠️ Tive um erro ao processar. Tente novamente.'); } catch {}
  }
});

client.initialize();
