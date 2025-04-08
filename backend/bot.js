const venom = require('venom-bot');
const fetch = require('node-fetch');

venom
  .create({
    session: 'finjudge', // cria pasta .finjudge com sessão
    multidevice: true // necessário para novo WhatsApp
  })
  .then((client) => start(client))
  .catch((err) => console.error('Erro ao iniciar Venom:', err));

function start(client) {
  client.onMessage(async (message) => {
    if (message.body && !message.isGroupMsg) {
      const texto = message.body.trim();

      const regex = /(\d+(?:[\.,]\d{1,2})?)\s*(?:no|em|na)?\s*(\w+)/i;
      const match = texto.match(regex);

      if (!match) {
        await client.sendText(message.from, 'Envie no formato: "gastei 50 no mercado"');
        return;
      }

      const valor = parseFloat(match[1].replace(',', '.'));
      const categoria = match[2].toLowerCase();

      try {
        const response = await fetch('https://finjudge-backend.onrender.com/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: categoria,
            telefone: message.from.replace(/\D/g, '')
          })
        });

        if (response.ok) {
          await client.sendText(message.from, `✅ Gasto de R$${valor.toFixed(2)} em "${categoria}" registrado com sucesso!`);
        } else {
          await client.sendText(message.from, '❌ Erro ao registrar o gasto. Tente novamente.');
        }
      } catch (err) {
        console.error(err);
        await client.sendText(message.from, '⚠️ Erro ao conectar com o servidor.');
      }
    }
  });
}