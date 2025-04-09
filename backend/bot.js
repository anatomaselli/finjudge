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
      const telefone = message.from.replace(/\D/g, '');

      // Caso a pessoa envie uma mensagem de boas-vindas
      if (/quero começar a usar o finjudge/i.test(texto)) {
        await client.sendText(
          message.from,
          `🎉 Bem-vindo(a) ao FinJudge! Agora você pode registrar seus gastos assim:\n\n` +
          `- 8,50 ifood\n- gastei 50 no mercado\n- gastei 20,30 com gasolina`
        );
        return;
      }

      // Expressões como: "gastei 35 no mercado" ou "8,50 ifood"
      const regex = /(?:gastei\s*)?(\d+(?:[.,]\d{1,2})?)(?:\s*com|\s*no|\s*na)?\s+(.+)/i;
      const match = texto.match(regex);

      if (!match) {
        await client.sendText(message.from,
          '💬 Envie no formato:\n\n' +
          '1️⃣ "Olá, meu nome é Fulano e meu telefone é 479XXXXXXXX. Quero começar a usar o FinJudge!"\n' +
          '2️⃣ Ou: "gastei 50 no mercado"\n' +
          '3️⃣ Ou: "8,50 ifood"'
        );
        return;
      }

      const valor = parseFloat(match[1].replace(',', '.'));
      const categoria = match[2].trim().toLowerCase();

      try {
        const response = await fetch('https://finjudge-backend.onrender.com/api/gasto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telefone,
            valor,
            categoria,
            data: new Date().toISOString()
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
        console.error('Erro ao enviar pro backend:', error);
        await client.sendText(message.from, '⚠️ Erro de conexão com o servidor.');
      }
    }
  });
}