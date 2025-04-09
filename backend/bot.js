const venom = require('venom-bot');
const fetch = require('node-fetch');

venom
  .create({
    session: 'finjudge',
    multidevice: true,
    headless: false,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  .then((client) => start(client))
  .catch((err) => console.error('Erro ao iniciar Venom:', err));

function start(client) {
  client.onMessage(async (message) => {
    if (!message.body || message.isGroupMsg) return;

    const texto = message.body.trim();
    const telefone = message.from.replace(/\D/g, '');

    // 1️⃣ Mensagem de boas-vindas
    if (texto.toLowerCase().includes('quero começar a usar o finjudge')) {
      await client.sendText(
        message.from,
        '👋 Bem-vindo ao FinJudge! Envie suas despesas no formato: \n\n💬 "gastei 15,90 no mercado"\n💬 "8,50 ifood"\n💬 "gastei 22 com gasolina"'
      );

      // Opcional: salvar no backend como lead
      try {
        await fetch('https://finjudge-backend.onrender.com/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: 'Novo lead via WhatsApp',
            telefone,
          }),
        });
      } catch (err) {
        console.error('Erro ao registrar lead inicial:', err);
      }

      return;
    }

    // 2️⃣ Gasto no formato livre
    const regex = /(\d+(?:[\.,]\d{1,2})?)\s*(?:com|no|na|em)?\s*(\w+)/i;
    const match = texto.match(regex);

    if (!match) {
      await client.sendText(
        message.from,
        '💬 Envie no formato:\n\n1️⃣ "gastei 50 no mercado"\n2️⃣ "8,50 ifood"\n3️⃣ "gastei 7,14 com uber"'
      );
      return;
    }

    const valor = parseFloat(match[1].replace(',', '.'));
    const categoria = match[2].toLowerCase();

    try {
      const response = await fetch('https://finjudge-backend.onrender.com/api/gasto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone,
          valor,
          categoria,
        }),
      });

      if (response.ok) {
        await client.sendText(
          message.from,
          `✅ Gasto de R$ ${valor.toFixed(2)} em *${categoria}* salvo com sucesso!`
        );
      } else {
        await client.sendText(message.from, '❌ Erro ao registrar o gasto. Tente novamente.');
      }
    } catch (error) {
      console.error(error);
      await client.sendText(message.from, '⚠️ Erro de conexão com o servidor.');
    }
  });
}