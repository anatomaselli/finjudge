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
    if (message.body && !message.isGroupMsg) {
      const texto = message.body.trim();

      // 1. Mensagem de boas-vindas com nome e telefone
      const welcomeRegex = /meu nome é (.+?) e meu telefone é (\d{10,15})/i;
      const matchWelcome = texto.match(welcomeRegex);

      if (matchWelcome) {
        const nome = matchWelcome[1].trim();
        const telefone = matchWelcome[2].trim();

        try {
          const response = await fetch('https://finjudge-backend.onrender.com/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone }),
          });

          if (response.ok) {
            await client.sendText(message.from, `🎉 Olá ${nome}, seu cadastro no FinJudge foi realizado com sucesso! Pode começar a registrar seus gastos.`);
          } else {
            await client.sendText(message.from, '❌ Erro ao salvar seu cadastro. Tente novamente.');
          }
        } catch (error) {
          console.error(error);
          await client.sendText(message.from, '⚠️ Erro de conexão com o servidor.');
        }

        return;
      }

      // 2. Registro de gasto: aceita vários formatos
      const gastoRegex = /(?:gastei\s*)?(\d+(?:[\.,]\d{1,2})?)\s*(?:com\s+)?(.+)/i;
      const matchGasto = texto.match(gastoRegex);

      if (matchGasto) {
        const valor = parseFloat(matchGasto[1].replace(',', '.'));
        const categoria = matchGasto[2].trim().toLowerCase();
        const telefone = message.from.replace(/\D/g, '');

        try {
          const response = await fetch('https://finjudge-backend.onrender.com/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: categoria, telefone }),
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

        return;
      }

      // 3. Se não reconhecido
      await client.sendText(message.from,
        '💬 Envie no formato:\n\n' +
        '1️⃣ "Olá, meu nome é Fulano e meu telefone é 479XXXXXXXX. Quero começar a usar o FinJudge!"\n\n' +
        '2️⃣ Ou registre um gasto assim:\n' +
        '• 8,50 ifood\n' +
        '• gastei 8,50 ifood\n' +
        '• gastei 8,50 com ifood'
      );
    }
  });
}