const venom = require('venom-bot');
const fetch = require('node-fetch');

venom
  .create({
    session: 'finjudge',
    multidevice: true,
    headless: false, // abre o navegador visível
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  .then((client) => start(client))
  .catch((err) => console.error('Erro ao iniciar Venom:', err));

function start(client) {
  client.onMessage(async (message) => {
    if (message.body && !message.isGroupMsg) {
      const texto = message.body.trim();

      // Expressões como: "gastei 35 no mercado"
      const regex = /(\d+(?:[\.,]\d{1,2})?)\s*(?:no|na|em)?\s*(\w+)/i;
      const match = texto.match(regex);

      if (!match) {
        await client.sendText(message.from, '💬 Envie no formato: "gastei 50 no mercado"');
        return;
      }

      const valor = parseFloat(match[1].replace(',', '.'));
      const categoria = match[2].toLowerCase();
      const telefone = message.from.replace(/\D/g, '');

      try {
        const response = await fetch('https://finjudge-backend.onrender.com/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: categoria,
            telefone
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
    }
  });
}